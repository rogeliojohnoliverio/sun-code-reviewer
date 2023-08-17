import { ChatGPTAPI } from 'chatgpt';
import { Inputs } from './input';
import { Prompts } from './prompt';

export class Chat {
  private chatAPI: ChatGPTAPI;

  constructor(apikey: string) {
    this.chatAPI = new ChatGPTAPI({
      apiKey: apikey,
      apiBaseUrl: 'https://api.openai.com/v1',
      completionParams: {
        model: 'gpt-3.5-turbo',
        temperature: +(process.env.temperature || 0) || 1,
        top_p: +(process.env.top_p || 0) || 1,
        max_tokens: process.env.max_tokens
          ? +process.env.max_tokens
          : undefined,
      },
    });
  }

  private generatePrompt = (filename: string, patch: string) => {
    const prompts = new Prompts();
    const input = new Inputs(filename, patch);
    return input.render(prompts.reviewFilePrompt);
  };

  public codeReview = async (filename: string, patch: string) => {
    if (!patch) {
      return '';
    }

    const prompt = this.generatePrompt(filename, patch);
    const res = await this.chatAPI.sendMessage(prompt);
    return res.text;
  };
}
