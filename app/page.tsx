"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { handleGetMemes, handleLoadMore } from "@/app/utils/helpers";
import { Meme } from "@/app/utils/constants";
import Toast from "@/app/components/Toast";

export default function Home() {
  const [memes, setMemes] = useState<Meme[] | null>([]);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [currentTitle, setCurrentTitle] = useState("");
  const [selectedMeme, setSelectedMeme] = useState<Meme>();

  const [formData, setFormData] = useState({
    text0: "",
    text1: "",
    text2: "",
    text3: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingMeme, setIsLoadingMeme] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleClose = () => {
    setToastMessage(null);
  };

  const handleShowToast = (message: string) => {
    showToast(message ? message : "This is a custom toast message!");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    handleGetMemes(setMemes);
  }, []);

  const handleMakeMeme = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedMeme) {
      return handleShowToast("Please select a meme to continue");
    }
    const requestPayload = {
      ...formData,
      selectedMemeId: selectedMeme?.id,
    };

    const response = await fetch("/api/caption-meme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();
    setSelectedMeme({
      ...selectedMeme,
      url: data.newImage.url,
    });
    console.log(data.newImage);
  };

  return (
    <>
      {toastMessage && <Toast message={toastMessage} onClose={handleClose} />}
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold" onClick={() => console.log(memes)}>
        Click Me to get memes
      </button > <div className="flex flex-col md:flex-row w-full items-center justify-between p-4"><div className="bg-pink-600 md:aspect-square h-96 w-full md:w-[50%] relative border-4 border-yellow-400">
        {selectedMeme && (
          <>
            {!isLoaded && (
              <>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800"></div>
                < div className="w-16 h-16 border-t-4 border-yellow-400 rounded-full animate-spin"></div>
              </>
            )}
            <Image alt={selectedMeme.name} src={selectedMeme.url} width={selectedMeme.width} height={selectedMeme.height} style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: isLoaded ? "block" : "none",
            }}
              loading="lazy" onLoad={() => setIsLoaded(true)}
            />
          </>
        )}
      </div > <div className="bg-purple-700 w-full md:w-[50%] p-4 border-4 border-yellow-400"><h2 className="text-yellow-400 font-pixel text-2xl mb-4">
        {currentTitle}
      </h2><div className="flex flex-row flex-nowrap min-w-full overflow-x-scroll p-5 gap-3 bg-pink-800 border-4 border-pink-600 rounded-lg">
            {memes &&
              memes.slice(0, visibleCount).map((item) => (
                <div key={item.id} className="w-36 h-36 bg-pink-700 flex items-center justify-center relative border-4 border-yellow-400 aspect-square cursor-pointer"
                ><Image
                    alt={item.name}
                    src={item.url}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    onMouseOver={() => setCurrentTitle(`${item.name}`)}
                    onMouseOut={() => {
                      selectedMeme
                        ? setCurrentTitle(selectedMeme.name)
                        : setCurrentTitle("");
                    }}
                    onClick={() => {
                      setSelectedMeme(item);
                      setIsLoaded(false); // Reset loading state when selecting a new meme
                    }}
                  />
                </div>
              ))}
            {memes && visibleCount < memes.length && (
              <button className="bg-purple-600 text-yellow-400 font-pixel px-4 py-2 rounded-lg border-4 border-pink-600" onClick={() => handleLoadMore(setVisibleCount, visibleCount)}
              >
                Load More
              </button>
            )
            }
          </div > <form
            className="flex flex-col gap-3 items-start mt-4 bg-gray-800 p-4 rounded-lg border-4 border-yellow-400"
            onSubmit={handleMakeMeme}
          ><div className="flex flex-col items-start w-full"><label htmlFor="text0" className="text-yellow-400 font-pixel">
            Text 1
          </label><input
                type="text"
                name="text0"
                id="text0"
                value={formData.text0}
                onChange={handleInputChange}
                className="bg-gray-900 text-yellow-300 w-full px-4 py-2 rounded-md border-2 border-yellow-400 font-pixel"
                required
              /></div><div className="flex flex-col items-start w-full"><label htmlFor="text1" className="text-yellow-400 font-pixel">
                Text 2
              </label><input
                type="text"
                name="text1"
                id="text1"
                value={formData.text1}
                onChange={handleInputChange}
                className="bg-gray-900 text-yellow-300 w-full px-4 py-2 rounded-md border-2 border-yellow-400 font-pixel"
              /></div><div className="flex flex-col items-start w-full"><label htmlFor="text2" className="text-yellow-400 font-pixel">
                Text 3
              </label><input
                type="text"
                name="text2"
                id="text2"
                value={formData.text2}
                onChange={handleInputChange}
                className="bg-gray-900 text-yellow-300 w-full px-4 py-2 rounded-md border-2 border-yellow-400 font-pixel"
              /></div><div className="flex flex-col items-start w-full"><label htmlFor="text3" className="text-yellow-400 font-pixel">
                Text 4
              </label><input
                type="text"
                name="text3"
                id="text3"
                value={formData.text3}
                onChange={handleInputChange}
                className="bg-gray-900 text-yellow-300 w-full px-4 py-2 rounded-md border-2 border-yellow-400 font-pixel"
              /></div><button
                type="submit"
                className="bg-purple-600 text-yellow-400 font-pixel px-4 py-2 mt-4 rounded-lg border-4 border-pink-600 w-full"
              >
              Make Meme
            </button></form></div ></div ></>
  );
}
