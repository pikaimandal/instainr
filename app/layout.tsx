import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InstaINR - Convert your crypto to INR instantly",
  description: "Convert your crypto to INR instantly with InstaINR",
  generator: 'v0.dev'
}

// Initialize the MiniKit when script loads
const initMiniKitScript = `
  // Set the app ID
  window.WORLD_APP_ID = "app_a694eef5223a11d38b4f737fad00e561";
  
  // Log if we're in an iframe to help debug
  console.log("In iframe: " + (window !== window.parent));
  
  // Listen for MiniKit being available
  function waitForMiniKit() {
    console.log("Checking for MiniKit...");
    if (window.MiniKit) {
      console.log("MiniKit found, initializing...");
      try {
        window.MiniKit.init({ 
          appId: window.WORLD_APP_ID
        });
        console.log("MiniKit initialized with appId:", window.WORLD_APP_ID);
      } catch (e) {
        console.error("MiniKit initialization failed:", e);
      }
    } else {
      console.log("MiniKit not found, trying again in 500ms");
      setTimeout(waitForMiniKit, 500);
    }
  }
  
  // Start checking for MiniKit
  waitForMiniKit();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
        {/* Add MiniKit script */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1/dist/minikit.js"
          strategy="beforeInteractive"
        />
        {/* Initialize MiniKit after it loads */}
        <Script id="init-minikit" strategy="afterInteractive">
          {initMiniKitScript}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'