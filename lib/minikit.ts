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
      isInWorldApp?: boolean;
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

export {} 