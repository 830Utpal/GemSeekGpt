import { Inter} from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";

const inter= Inter({
  variable: "--font-Inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "gemseekgpt",
  description: "Full Stack project",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
    </AppContextProvider>
    </ClerkProvider>
  );
}