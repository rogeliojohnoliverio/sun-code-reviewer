import { Probot } from 'probot';

const MAX_PATCH_COUNT = process.env.MAX_PATCH_LENGTH
  ? +process.env.MAX_PATCH_LENGTH
  : Infinity;

export = (app: Probot) => {
  app.on(
    ['pull_request.opened', 'pull_request.synchronize'],
    async (context) => {
      // Get current repository details
      const repo = context.repo();

      //Check pull request event type
      const pull_request = context.payload.pull_request;

      if (
        pull_request.state === 'closed' ||
        pull_request.locked ||
        pull_request.draft
      ) {
        console.log('Invalid pull request event');
        throw new Error('Invalid pull request event');
      }

      // Get commit data from current repository and pull request
      const data = await context.octokit.repos.compareCommits({
        owner: repo.owner,
        repo: repo.repo,
        base: pull_request.base.sha,
        head: pull_request.head.sha,
      });

      let { files: changedFiles, commits } = data.data;

      // This will run when and every new commit is pushed to the pull request
      if (context.payload.action === 'synchronize' && commits.length >= 2) {
        const {
          data: { files },
        } = await context.octokit.repos.compareCommits({
          owner: repo.owner,
          repo: repo.repo,
          base: commits[commits.length - 2].sha,
          head: commits[commits.length - 1].sha,
        });

        const excludedFiles = process.env.EXCLUDED_FILES
          ? process.env.EXCLUDED_FILES.split(',')
          : [];

        const filesNames = files?.map((file) => file.filename) || [];

        changedFiles = changedFiles?.filter((file) => {
          return (
            !excludedFiles.includes(file.filename) &&
            filesNames.includes(file.filename)
          );
        });
      }

      if (!changedFiles?.length) {
        throw new Error('No changes were made');
      }

      // Loop through the changed files to get commit patches to be fed in  chatGPT
      for (let i = 0; i < changedFiles.length; i++) {
        const file = changedFiles[i];
        const patch = file.patch || '';

        if (file.status !== 'modified' && file.status !== 'added') {
          continue;
        }

        if (!patch || patch.length > MAX_PATCH_COUNT) {
          console.log(`${file.filename} skipped due to large diff`);
          continue;
        }

        console.log(patch);
      }

      await context.octokit.issues.createComment({
        repo: repo.repo,
        owner: repo.owner,
        issue_number: context.pullRequest().pull_number,
        body: JSON.stringify(changedFiles),
      });
    }
  );
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
