# ⚙️ Sun AI Code Reviewer

Sun AI Code Reviewer is an AI-based code reviewer suggesting code improvements, refactors and pointing out issues for every GitHub pull request using OpenAI's gpt-3.5-turbo and other models. It is designed to be used as a GitHub Action and can be configured to run on every pull request (PR) and additional commits on that PR. Try using `Sun Code Reviewer` now as Github Actions!

> LIMITATIONS: As this project is still on an ongoing development and dependent on the AI assistant used, we expect that there are still some little inconsistencies to the reviews being suggested by the AI assistant (ChatGPT). Nevertheless, it should still suggest relevant and useful improvements based on the code changes/diffs. Feel free to help us improve this project!

## ⭐ Features

   - Line-by-line code change suggestions: Reviews the changes line by line and provides code change suggestions.
   - Continuous, incremental reviews: Reviews are performed on each commit within a pull request, rather than a one-time review on the entire pull request.
   - Use as a Github Action: Initiate the automatic code review by configuring a yaml file just like how we setup linter and formatter actions

## 🔑 Requirements
Register an OpenAI API account and create a secret key for it. Copy and paste the secret key to your repository's settings -> secret and variables -> actions -> `secrets` OR `variables` and add the OPENAI_API_KEY as name and the API KEY as value.

> You may opt to create a new account preferably using your personal email address to get a $5 free credit from OpenAI and use the API for free.

## 👆 How to use as Github Action
1. Configure the necessary settings on your desired repository to run the code reviewer action:
    - Add your OPENAI_API_KEY secret/variable as mentioned above
![image](https://github.com/rogeliojohnoliverio/public-repo/assets/110364637/4c3b82f1-42fb-45b6-aa92-ddaf62d2e92c)
2. Create these directories on the root of your project `.github > workflows` and on the workflows folder, create a file named actions.yml (or can be anything to your liking).
3. Add this content to the actions.yml
```yml
name: Sun Code Reviewer
permissions:
  contents: read
  pull-requests: write

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  sun-ai-code-reviewer:
    runs-on: ubuntu-latest
    steps:
      - uses: rogeliojohnoliverio/sun-code-reviewer@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY || vars.OPENAI_API_KEY }}
```
4. Push this changes and this should run every opened pull request and every additional commit on that pull request

## Local Setup
1. Create a [Github App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)
2. Setup Webhook channel using https://smee.io/ , copy the link created.
3. Clone this repo and run `cp .env.example .env`
4. Fill the necessary values in the .env (refer to this [TUTORIAL](https://www.youtube.com/watch?v=WSkoEqrL0r4))
6. Run the commands below
```sh
# Install dependencies
npm install

# Run the bot we suggest use node version v18.17.0 it might have issue with other versions
npm run all
```

## 👤 Developers

- Augusto, Rose
- Oliverio, Rogelio John
- Vilo, Bruce Nigel
