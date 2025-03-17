import { Inter} from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
