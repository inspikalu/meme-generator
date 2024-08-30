"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { handleGetMemes, handleLoadMore } from "@/app/utils/helpers";
import { Meme } from "@/app/utils/constants";
import Toast from "@/app/components/Toast";
import { CanvasClient, CanvasInterface } from "@dscvr-one/canvas-client-sdk";
import { validateHostMessage } from "./dscvr";

type InitResponse = {
  type: "lifecycle:init-response";
  untrusted: {
    user?:
      | { id: string; username: string; avatar?: string | undefined }
      | undefined;
    content?: { id: string; portalId: string; portalName: string } | undefined;
  };
  trustedBytes: string;
};
export default function Home() {
  const copyToClipboardOriginalMessage = "Copy username to clipboard";

  // React state hooks
  const [canvasClient, setCanvasClient] = useState<CanvasClient | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanvasClient(new CanvasClient());
    }
  }, []);

  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<CanvasInterface.Lifecycle.User | undefined>(
    undefined
  );
  const [content, setContent] = useState<
    CanvasInterface.Lifecycle.Content | undefined
  >(undefined);
  const [currentReaction, setCurrentReaction] = useState<string | undefined>(
    undefined
  );
  const [copyToClipboardLabel, setCopyToClipboardLabel] = useState(
    copyToClipboardOriginalMessage
  );

  // useRef for ResizeObserver to keep it stable between renders
  const resizeObserver = useRef<ResizeObserver>();

  // Function to start the process
  const start = async () => {
    if (!canvasClient) return;

    try {
      const response = await canvasClient.ready();
      const isValidResponse = await validateHostMessage(response);

      if (!isValidResponse) return;

      setIsReady(canvasClient.isReady);

      if (response) {
        setUser(response.untrusted.user);
        setContent(response.untrusted.content);
      }

      canvasClient.onContentReaction((reaction) => {
        if (!validateHostMessage(reaction)) return;

        if (reaction.untrusted.status === "cleared") {
          setCurrentReaction("");
        } else {
          setCurrentReaction(reaction.untrusted.reaction);
        }
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  // Function to create a new post
  const createNewPost = () => {
    if (!canvasClient || !user) return;
    const html = `
    <h1>New canvas post!</h1>
    <p>Check out the meme Created by <b>${user.username}</b></p>
    <img src="${selectedMeme?.url}" alt="${selectedMeme?.name}" style="width:${selectedMeme?.width}; height: auto;" />
    `;
    canvasClient.createPost(html);
  };

  // Function to set body height
  const setBodyHeight = (height: number) => {
    document.body.style.height = height ? `${height}px` : "";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      resizeObserver.current = new ResizeObserver(() => canvasClient?.resize());

      if (canvasClient) {
        start(); // Start the process when the component mounts
      }
    }

    // Cleanup on unmount
    return () => {
      resizeObserver.current?.disconnect();
    };
  }, [canvasClient]);

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
    setBodyHeight(1000);
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
  const handleDownload = () => {
    if (!selectedMeme) {
      return handleShowToast("No meme selected to download");
    }

    const link = document.createElement("a");
    link.href = selectedMeme.url;
    link.target = "_blank";
    link.download = selectedMeme.name || "meme.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {toastMessage && <Toast message={toastMessage} onClose={handleClose} />}
      <div className="flex flex-col md:flex-row w-full items-start justify-between p-4 gap-3">
        <div className="flex flex-col items-end gap-3 md:aspect-square h-96 w-full md:w-[50%]">
          <button
            className={`bg-[#979F79] text-[#272E10] px-4 py-2 rounded-lg font-bold ${
              !selectedMeme ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleDownload}
            disabled={!selectedMeme}
          >
            Download Image
          </button>
          <button
            className={`bg-[#979F79] text-[#272E10] px-4 py-2 rounded-lg font-bold ${
              !selectedMeme ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={createNewPost}
            disabled={!selectedMeme}
          >
            Post Image
          </button>
          <div className="bg-[#989D7F] relative border-4 border-[#313519] flex items-center justify-center p-2 w-full h-full  max-h-[500px] overflow-hidden">
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
                  className="w-36 min-w-[150px] h-36 bg-[#8D8C6E] flex items-center justify-center relative border-4 border-[#313519] aspect-square cursor-pointer"
                >
                  <Image
                    alt={item.name}
                    src={item.url}
                    fill
                    style={{ objectFit: "cover", minWidth: "200px" }}
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
