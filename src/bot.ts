import { Context, Probot } from 'probot';
import { Chat } from './chat.js';
import { assessment } from './constant.js';
import axios from 'axios';

const MAX_PATCH_COUNT = process.env.MAX_PATCH_LENGTH
  ? +process.env.MAX_PATCH_LENGTH
  : Infinity;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const loadChat = async (context: Context) => {
  const repo = context.repo();

  try {
    if (!OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not set in Variables/Secrets on this repository'
      );
    }

    // Test the API key by making a simple request to the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci/completions',
      {
        prompt: 'Hello, world!',
        max_tokens: 5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error(
        `API key test request failed with status: ${response.status}`
      );
    }
    return new Chat(OPENAI_API_KEY);
  } catch (error: any) {
    await context.octokit.issues.createComment({
      repo: repo.repo,
      owner: repo.owner,
      issue_number: context.pullRequest().pull_number,
      body: `### Error :x:\n${
        error.response?.data?.error?.message ||
        error?.message ||
        'Invalid API key. Please check your OPENAI_API_KEY in Variables/Secrets on this repository.'
      }`,
    });
    console.error(
      error.response?.data?.error?.message ||
        error?.message ||
        'Invalid API key. Please check your OPENAI_API_KEY in Variables/Secrets on this repository.'
    );
    process.exit(1);
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
          if (!!res && !res.includes(assessment.APPROVED)) {
            await context.octokit.pulls.createReviewComment({
              repo: repo.repo,
              owner: repo.owner,
              pull_number: context.pullRequest().pull_number,
              commit_id: commits[commits.length - 1].sha,
              path: file.filename,
              body: `### NEEDS REVIEW :bangbang: \n\n${res}`,
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
          console.error(`Review on ${file.filename} failed.\n ${e}`);
          process.exit(1);
        }
      }
    }
  );
};
