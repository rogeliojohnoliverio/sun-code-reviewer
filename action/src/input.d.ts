export declare class Inputs {
    filename: string;
    patches: string;
    constructor(filename?: string, patch?: string);
    render(content: string): string;
}
