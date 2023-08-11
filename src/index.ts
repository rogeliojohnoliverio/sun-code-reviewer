import { Probot } from 'probot';

export = (app: Probot) => {
  app.on(
    ['pull_request.opened', 'pull_request.synchronize'],
    async (context) => {
      // Get current repository details
      const repo = context.repo();

      // Get commit data from current repository and pull request
      const data = await context.octokit.repos.compareCommits({
        owner: repo.owner,
        repo: repo.repo,
        base: context.payload.pull_request.base.sha,
        head: context.payload.pull_request.head.sha,
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

        const filesNames = files?.map((file) => file.filename) || [];
        changedFiles = changedFiles?.filter((file) =>
          filesNames.includes(file.filename)
        );
      }
      console.log('Changed Files: ', changedFiles);
    }
  );
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
