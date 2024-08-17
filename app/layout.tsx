import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import Head from "next/head"; // Import Head component
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const pressStart2p = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meme Generator",
  description: "Create Fantastic memes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        {/* Open Graph Metadata */}
        <meta property="og:title" content="Meme Generator" />
        <meta property="og:description" content="Create Fantastic memes" />
        <meta
          property="og:image"
          content="https://meme-generator-orpin-iota.vercel.app/meme.png
"
        />
        <meta property="og:url" content="https://meme-generator-orpin-iota.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Meme Generator" />

        {/* Other Metadata */}
        <meta name="dscvr:canvas:version" content="vNext" />
      </Head>

      <body className={`${inter.className} ${pressStart2p.className}`}>
        {children}
      </body>
    </html>
  );
}
