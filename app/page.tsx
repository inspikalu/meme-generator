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
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);

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

    setIsLoadingMeme(true);
    const requestPayload = {
      ...formData,
      selectedMemeId: selectedMeme.id,
    };

    try {
      const response = await fetch("/api/caption-meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to fetch the new meme image. Please try again."
        );
      }

      const data = await response.json();

      if (!data.newImage || !data.newImage.url) {
        throw new Error(
          "New meme image could not be processed. Please try again."
        );
      }

      setSelectedMeme({
        ...selectedMeme,
        url: data.newImage.url,
      });
      setIsLoadingMeme(false);
      console.log(data.newImage);
    } catch (error: any) {
      setIsLoadingMeme(false);

      // Handle different types of errors
      if (error.message.includes("Failed to fetch")) {
        setToastMessage(
          "Network error: Unable to reach the server. Please check your internet connection."
        );
      } else {
        setToastMessage(error.message);
      }
    }
  };

  return (
    <>
      {toastMessage && <Toast message={toastMessage} onClose={handleClose} />}
      <div className="flex flex-col md:flex-row w-full items-start justify-between p-4 gap-3">
        <div className="flex flex-col items-end gap-3 md:aspect-square h-96 w-full md:w-[50%]">
          <button
            className="bg-[#979F79] text-[#272E10] px-4 py-2 rounded-lg font-bold"
            onClick={() => console.log(memes)}
          >
            Download Image
          </button>
          {/* <div className="bg-[#989D7F] relative border-4 border-[#313519] flex flex-row items-center justify-center p-2">
            {selectedMeme && (
              <>
                {!isLoaded && (
                  <div className="absolute inset-0 flex w-full h-full items-center justify-center">
                    <div className="w-16 h-16 border-t-4 border-[#313519] rounded-full animate-spin"></div>
                  </div>
                )}
                <Image
                  alt={selectedMeme.name}
                  src={selectedMeme.url}
                  width={selectedMeme.width}
                  height={selectedMeme.height}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  priority
                  onLoad={() => setIsLoaded(true)}
                  onError={() => {
                    setIsLoaded(true); // In case of error, we still want to hide the spinner
                    setToastMessage("Failed to load image.");
                  }}
                />
              </>
            )}
          </div> */}
          <div className="bg-[#989D7F] relative border-4 border-[#313519] flex items-center justify-center p-2 w-full h-full max-w-[500px] max-h-[500px] overflow-hidden">
            {selectedMeme && (
              <>
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-t-4 border-[#313519] rounded-full animate-spin"></div>
                  </div>
                )}
                <Image
                  alt={selectedMeme.name}
                  src={selectedMeme.url}
                  width={selectedMeme.width}
                  height={selectedMeme.height}
                  className="w-full h-full object-cover"
                  priority
                  onLoad={() => setIsLoaded(true)}
                  onError={() => {
                    setIsLoaded(true);
                    setToastMessage("Failed to load image.");
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className="bg-[#8D8C6E] w-full md:w-[50%] p-4 border-4 border-[#313519]">
          <div
            className={` text-white font-pixel transition-opacity duration-300 ease-in-out ${
              currentTitle !== "" ? "opacity-100" : "opacity-0"
            }`}
          >
            {currentTitle}
          </div>
          <div className="flex flex-row flex-nowrap min-w-full overflow-x-scroll p-5 gap-3 bg-[#979F7F] border-4 border-[#8D8C6E] rounded-lg">
            {memes &&
              memes.slice(0, visibleCount).map((item) => (
                <div
                  key={item.id}
                  className="w-36 h-36 bg-[#8D8C6E] flex items-center justify-center relative border-4 border-[#313519] aspect-square cursor-pointer"
                >
                  <Image
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
                      setIsLoaded(false);
                    }}
                  />
                </div>
              ))}
            {memes && visibleCount < memes.length && (
              <button
                className="bg-[#8D8C6E] text-[#272E10] font-pixel px-4 py-2 rounded-lg border-4 border-[#8D8C6E]"
                onClick={() => handleLoadMore(setVisibleCount, visibleCount)}
              >
                Load More
              </button>
            )}
          </div>
          <form
            className="flex flex-col gap-3 items-start mt-4 bg-[#272E10] p-4 rounded-lg border-4 border-[#313519]"
            onSubmit={handleMakeMeme}
          >
            <div className="flex flex-col items-start w-full">
              <label htmlFor="text0" className="text-[#989D7F] font-pixel">
                Text 1
              </label>
              <input
                type="text"
                name="text0"
                id="text0"
                value={formData.text0}
                onChange={handleInputChange}
                className="bg-[#313519] text-[#989D7F] w-full px-4 py-2 rounded-md border-2 border-[#8D8C6E] font-pixel"
                required
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="text1" className="text-[#989D7F] font-pixel">
                Text 2
              </label>
              <input
                type="text"
                name="text1"
                id="text1"
                value={formData.text1}
                onChange={handleInputChange}
                className="bg-[#313519] text-[#989D7F] w-full px-4 py-2 rounded-md border-2 border-[#8D8C6E] font-pixel"
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="text2" className="text-[#989D7F] font-pixel">
                Text 3
              </label>
              <input
                type="text"
                name="text2"
                id="text2"
                value={formData.text2}
                onChange={handleInputChange}
                className="bg-[#313519] text-[#989D7F] w-full px-4 py-2 rounded-md border-2 border-[#8D8C6E] font-pixel"
              />
            </div>
            <div className="flex flex-col items-start w-full">
              <label htmlFor="text3" className="text-[#989D7F] font-pixel">
                Text 4
              </label>
              <input
                type="text"
                name="text3"
                id="text3"
                value={formData.text3}
                onChange={handleInputChange}
                className="bg-[#313519] text-[#989D7F] w-full px-4 py-2 rounded-md border-2 border-[#8D8C6E] font-pixel"
              />
            </div>
            <button
              type="submit"
              className="bg-[#8D8C6E] text-[#272E10] font-pixel px-4 py-2 mt-4 rounded-lg border-4 border-[#8D8C6E] w-full flex flex-row items-center justify-center"
            >
              {isLoadingMeme ? (
                <div className="w-8 h-8 border-t-4 border-[#313519] rounded-full animate-spin"></div>
              ) : (
                <span>Make Meme</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
