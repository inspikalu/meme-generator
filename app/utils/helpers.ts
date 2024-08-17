import { Meme } from "./constants"

export const handleGetMemes = async function (setMemes: React.Dispatch<React.SetStateAction<Meme[] | null>>) {
    const data = await (await fetch("/api/get-memes/")).json()
    setMemes(data.data.data.memes)
}




export const handleLoadMore = function (setVisibleCount: any, prevCount: number) {
    setVisibleCount(prevCount + 10);
};

