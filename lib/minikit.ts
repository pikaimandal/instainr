declare global {
  interface Window {
    MiniKit: {
      isInstalled: () => boolean;
      install: (options: { appId: string }) => void;
      init?: (options: { appId: string }) => void;
      version?: string;
      user?: {
        username?: string;
        profilePictureUrl?: string;
      };
      walletAddress?: string;
      isInWorldApp?: boolean;
      appId?: string;
      commandsAsync: {
        walletAuth: (input: {
          nonce: string;
          expirationTime?: Date;
          statement?: string;
          requestId?: string;
          notBefore?: Date;
        }) => Promise<{
          commandPayload: any;
          finalPayload: {
            status: 'success' | 'error';
            message?: string;
            signature?: string;
            address?: string;
            version?: number;
          };
        }>;
        verify?: (input: {
          action: string;
          signal?: string;
        }) => Promise<{
          commandPayload: any;
          finalPayload: {
            status: 'success' | 'error';
            message?: string;
            nullifier_hash?: string;
            merkle_root?: string;
            proof?: string;
          };
        }>;
      };
    };
    WORLD_APP_ID?: string;
    WORLD_APP_CHECK_COUNT?: number;
  }
}

import { useEffect, useState } from 'react';

/**
 * Detects if the current environment is the World App
 * Uses multiple detection methods for higher reliability
 * @returns Promise<boolean> that resolves to true if in World App, false otherwise
 */
export async function detectWorldApp(): Promise<boolean> {
  // Safety check for SSR
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for MiniKit presence and isInstalled method (most reliable)
  if (window.MiniKit && typeof window.MiniKit.isInstalled === 'function') {
    try {
      const isInstalled = window.MiniKit.isInstalled();
      console.log("MiniKit.isInstalled() returned:", isInstalled);
      
      if (isInstalled) {
        return true;
      }
    } catch (error) {
      console.error("Error calling MiniKit.isInstalled():", error);
    }
  }

  // Check for isInWorldApp property (if available in newer versions)
  if (window.MiniKit?.isInWorldApp) {
    console.log("MiniKit.isInWorldApp is true");
    return true;
  }
  
  // Check for iframe (common for World App)
  const isInIframe = window !== window.parent;
  
  // Check user agent for World App indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isWorldAppUserAgent = userAgent.includes('world');
  
  // Check URL parameters or custom flags
  const worldAppUrlIndicator = window.location.href.includes('worldapp');
  
  // Combine secondary methods for better accuracy
  if ((isInIframe && isWorldAppUserAgent) || worldAppUrlIndicator) {
    console.log("World App detected via secondary methods");
    return true;
  }
  
  return false;
}

/**
 * Hook that polls for MiniKit availability and calls the callback when available
 * @param callback Function to call when MiniKit is available
 * @param interval Polling interval in milliseconds (default: 500ms)
 * @param maxTries Maximum number of polling attempts (default: 10)
 */
export function useMiniKitPolling(
  callback: () => void,
  interval = 500,
  maxTries = 10
) {
  const [isAvailable, setIsAvailable] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') {
      return; // Exit early in SSR
    }

    let tries = 0;
    let timerId: NodeJS.Timeout;
    
    const checkMiniKit = () => {
      // Check if MiniKit is available on window
      if (window.MiniKit) {
        console.log("MiniKit detected via polling");
        setIsAvailable(true);
        
        // Call the callback function
        callback();
        return true;
      }
      
      tries++;
      
      // Stop polling after max tries
      if (tries >= maxTries) {
        console.log(`MiniKit not found after ${maxTries} attempts`);
        return false;
      }
      
      // Continue polling
      timerId = setTimeout(checkMiniKit, interval);
      return false;
    };
    
    // Start polling
    if (!isAvailable && !checkMiniKit()) {
      timerId = setTimeout(checkMiniKit, interval);
    }
    
    // Cleanup on unmount
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [callback, interval, maxTries, isAvailable]);
  
  return isAvailable;
}

export {} 