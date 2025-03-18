import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "../components/theme-provider"
import { UserProvider } from "./user-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InstaINR - Convert your crypto to INR instantly",
  description: "Convert your crypto to INR instantly with InstaINR",
  generator: 'v0.dev'
}

// Initialize the MiniKit when script loads - using the latest MiniKit API
const initMiniKitScript = `
  // Set the app ID
  window.WORLD_APP_ID = "app_a694eef5223a11d38b4f737fad00e561";
  
  // Create a more reliable MiniKit initialization function
  function initMiniKit() {
    if (typeof window !== 'undefined') {
      console.log("Running in browser environment");
      
      // Check if we're in an iframe - common for World App
      const isInIframe = window !== window.parent;
      console.log("Is in iframe:", isInIframe);
      
      // Log user agent to help with debugging
      console.log("User agent:", navigator.userAgent);
      
      // If MiniKit is already attached to window, use it
      if (window.MiniKit) {
        console.log("MiniKit found on window, initializing...");
        try {
          // Support both install (newer) and init (older) methods
          if (typeof window.MiniKit.install === 'function') {
            window.MiniKit.install({
              appId: window.WORLD_APP_ID
            });
            console.log("MiniKit installed successfully with install()");
          } else if (typeof window.MiniKit.init === 'function') {
            window.MiniKit.init({
              appId: window.WORLD_APP_ID
            });
            console.log("MiniKit initialized successfully with init()");
          } else {
            console.warn("Neither MiniKit.install nor MiniKit.init is available");
          }
          return true;
        } catch (e) {
          console.error("MiniKit installation failed:", e);
        }
      } else {
        console.log("MiniKit not found on window yet");
        return false;
      }
    }
    return false;
  }
  
  // Try to initialize immediately
  if (!initMiniKit()) {
    // If initialization fails, try again when the document is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log("DOM loaded, trying MiniKit init again");
      initMiniKit();
    });
    
    // Also try one more time after a short delay
    setTimeout(function() {
      console.log("Delayed init, trying MiniKit init again");
      initMiniKit();
    }, 1000);
  }
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
        {/* Add MiniKit script - use the latest version */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@worldcoin/minikit-js@1.6.0/dist/minikit.js"
          strategy="beforeInteractive"
        />
        {/* Initialize MiniKit after it loads */}
        <Script id="init-minikit" strategy="afterInteractive">
          {initMiniKitScript}
        </Script>
      </head>
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}



import './globals.css'