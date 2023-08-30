# ⚙️ Sun Code Reviewer using CHATGPT

Sun Code Reviewer: Sun Code Reviewer is an AI-based code reviewer and summarizer for GitHub pull requests using OpenAI's gpt-3.5-turbo and gpt-4 models. It is designed to be used as a GitHub Action and can be configured to run on every pull request and review comments. Try installing `Sun Code Reviewer` now and use it in your development reviewer with ease!

## 🔗 Link

## ⭐ Features

   - PR Summarization: It generates a summary and release notes of the changes in the pull request.
   - Line-by-line code change suggestions: Reviews the changes line by line and provides code change suggestions.
   - Continuous, incremental reviews: Reviews are performed on each commit within a pull request, rather than a one-time review on the entire pull request.
   - Cost-effective and reduced noise: Incremental reviews save on OpenAI costs and reduce noise by tracking changed files between commits and the base of the pull request.

## 🔑 Requirements
Register an OpenAI API account and create a secret key for it. Copy and paste the secret key to github->repository->settings->secret->variales and add the OPENAI_API_KEY as name and the API KEY as value.

> You may opt to create a new account preferably using your personal email address to get a $5 free credit from OpenAI and use the API for free.


## Setup

```sh
# Install dependencies
npm install

# Run the bot we suggest use node version v18.17.0 it might have issue with other versions
npm start

#note: for first run it will generate and .env and check the WEBHOOK_PROXY_URL that is being generated use that in the Github app that you on the repo and add the value of WEBHOOK_PROXY_URL in Webhook URL.
#after npm start then Check the .env.example file for data needed in .env please fill up properly
```
## 👆 How to use

1. On your project repository make your you added the application in the marketplace you check it in Settings->GitHub App if the app is added
2. Click configure settings then update the .env file
   - APP_ID: the ID of the app, which you can get from the app settings page.
   - WEBHOOK_SECRET: Generate a unique secret with (e.g. with openssl rand -base64 32) and save it because you'll need it in a minute to configure your .env file
   - PRIVATE_KEY: Download the private key from the app.
3. Navigate to Permissions and Events some permissions must be granted
   - Pull request permissions, Pull request review, Pull request review comment, Pull request review thread 
   - At Repository permissions update it into read and write permissions the Commit status,Pull requests and Variables 
4. Push new pull request or commit
5. The result will also be appended below the latest commits which it will show some comments



## 👤 Developers

- Augusto, Rose
- Oliverio, Rogelio John
- Vilo, Bruce Nigel

