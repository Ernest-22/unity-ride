import type { Metadata } from "next";
//import { Inter, Plus_Jakarta_Sans } from "next/font/google"; // Using a modern font
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

// 1. Load Premium Fonts
// const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

// 2. PROFESSIONAL METADATA
export const metadata: Metadata = {
  title: "UnityRide - Community Carpooling",
  description: "The safe, verified carpooling platform for church communities in South Africa. Save fuel, share rides, and worship together.",
  applicationName: "UnityRide",
  authors: [{ name: "Singo Ndivhadzo Ernest" }],
  keywords: ["carpooling", "church", "transport", "south africa", "lift club", "pretoria", "limpopo"],
  icons: {
    icon: "/icon-192.png", // Browser Tab Icon
    shortcut: "/icon-192.png",
    apple: "/icon-512.png", // iPhone Home Screen Icon (Needs to be high res)
  },
  // This makes it look good on WhatsApp/Facebook
  openGraph: {
    title: "UnityRide - Ride Together, Worship Together",
    description: "Join your church community's exclusive carpooling network.",
    siteName: "UnityRide",
    locale: "en_ZA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
            {/* The Toaster handles the nice popups (Success/Error messages) */}
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '50px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }
            }}/>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}