import { Poppins , Geist_Mono  } from "next/font/google";
import "../globals.css";
import Waves from "@/components/Backgrounds/Waves/Waves";
import { AuthProvider } from "@/config/authcontext";
import { Toaster } from "react-hot-toast";

const poppins =Poppins({
  subsets:['latin'],
  weight: ['100','200','300','400','500','600','700','800','900'],
  variable:'--font-poppins'
 });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Chat App",
  description: "Chat with Server",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans ${geistMono.variable} antialiased bg-black overflow-hidden w-full min-h-screen`}
      >
        <AuthProvider>
        <div className="z-30"><Toaster /></div>
        <Waves lineColor="indigo" className="w-full min-h-screen fixed z-10"/>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
