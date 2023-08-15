import { Inputs } from './input';
import { Prompts } from './prompt';

export class Chat {
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
    return prompt;
  };
}
