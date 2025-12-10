import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@workspace/ui/globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "BlinkRoom - Private Conversations that Disappear",
  description: "Free, anonymous, and end-to-end encrypted chat rooms that are automatically deleted after 24 hours. No sign-up required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} font-display bg-background-light dark:bg-background-dark antialiased`}>
        {children}
      </body>
    </html>
  );
}