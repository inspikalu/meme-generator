export const memeApiBaseUrl = "https://api.imgflip.com";


export interface Meme {
    id: string;
    name: string;
    url: string;
    box_count: number;
    captions: number;
    width: number;
    height: number;
}