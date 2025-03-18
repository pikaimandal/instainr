declare global {
  interface Window {
    MiniKit: {
      isInstalled: () => boolean;
      init: (options: { appId: string }) => void;
      user?: {
        username?: string;
        profilePictureUrl?: string;
      };
      walletAddress?: string;
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
      };
    };
  }
}

export {} 