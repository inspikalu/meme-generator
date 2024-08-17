import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import Head from "next/head"; // Import Head component
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const pressStart2p = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meme Generator",
  description: "Create Fantastic memes",
  openGraph: {
    url: "https://meme-generator-orpin-iota.vercel.app",
    title: "Meme Generator",
    description: "Create Fantastic Memes",
    type: "website",
    siteName: "Meme Generator",
  },
  keywords: "meme, meme generator, how to generate meme",
  other: {
    "dscvr:canvas:version": "vNext",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        {/* Other Metadata */}
        <meta name="dscvr:canvas:version" content="vNext" />
      </Head>

      <body className={`${inter.className} ${pressStart2p.className}`}>
        {children}
      </body>
    </html>
  );
}
