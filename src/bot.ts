import { Context, Probot } from 'probot';
import { Chat } from './chat.js';
import { assessment } from './constant.js';
import axios from 'axios';

const MAX_PATCH_COUNT = process.env.MAX_PATCH_LENGTH
  ? +process.env.MAX_PATCH_LENGTH
  : Infinity;

  const loadChat = async (context: Context) => {
    if (process.env.OPENAI_API_KEY) {
      return new Chat(process.env.OPENAI_API_KEY);
    }
  
    const repo = context.repo();
  
    try {
      // Check env on the repository
      const { data } = (await context.octokit.request(
        'GET /repos/{owner}/{repo}/actions/variables/{name}',
        {
          owner: repo.owner,
          repo: repo.repo,
          name: 'OPENAI_API_KEY', // Ensure 'OPENAI_API_KEY' is a string
        }
      )) as any;
  
      if (!data?.value) {
        throw new Error("OPENAI_API_KEY is not set in Variables/Secrets on this repository");
      }
  
      // Test the API key by making a simple request to the OpenAI API
      const apiKey = data.value;
      const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
        prompt: 'Hello, world!',
        max_tokens: 5
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
  
      if (response.status !== 200) {
        throw new Error(`API key test request failed with status: ${response.status}`);
      }
  
      return new Chat(apiKey);
    } catch (error: any) {
      await context.octokit.issues.createComment({
        repo: repo.repo,
        owner: repo.owner,
        issue_number: context.pullRequest().pull_number,
        body: `### Error :x:\n${
          error.response?.data?.error?.message ||
          error?.message ||
          'Invalid API key. Please check your OPENAI_API_KEY in Variables/Secrets on this repository.'
        }` 
        });
      return null;
    }
  };
export const Bot = (app: Probot) => {
  app.on(
    ['pull_request.opened', 'pull_request.synchronize'],
    async (context) => {
      // Get current repository details
      const repo = context.repo();
      // Initialize ChatGPT
      const chat = await loadChat(context);
      if (!chat) {
        throw new Error('Chat initialization failed');
      }
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

        const filesNames = files?.map((file) => file.filename) || [];
        changedFiles = changedFiles?.filter((file) =>
          filesNames.includes(file.filename)
        );
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

        try {
          const res = await chat?.codeReview(file.filename, patch);
          if (!!res) {
            await context.octokit.pulls.createReviewComment({
              repo: repo.repo,
              owner: repo.owner,
              pull_number: context.pullRequest().pull_number,
              commit_id: commits[commits.length - 1].sha,
              path: file.filename,
              body: res.includes(assessment.APPROVED)
                ? `${assessment.APPROVED} :white_check_mark:`
                : `### NEEDS REVIEW :bangbang: \n\n${res}`,
              position: patch.split('\n').length - 1,
            });
          }
        } catch (e: any) {
          await context.octokit.issues.createComment({
            repo: repo.repo,
            owner: repo.owner,
            issue_number: context.pullRequest().pull_number,
            body: `### Error :x:\nReview on \`${file.filename}\` failed. ${
              e?.message && `\`${e?.message}\``
            }`,
          });
          throw new Error(`Review on ${file.filename} failed.\n ${e}`);
        }
      }
    }
  );
};
