import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  disconnectGoogleAds,
  fetchGoogleAdsStatus,
  GOOGLE_ADS_ERROR_MESSAGES,
  startGoogleAdsOAuth,
  type GoogleAdsConnectionStatus,
} from "@/lib/google-ads-connection";

type GoogleAdsConnectionContextValue = {
  status: GoogleAdsConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  refreshStatus: () => Promise<void>;
};

const GoogleAdsConnectionContext = createContext<GoogleAdsConnectionContextValue | null>(null);

export function GoogleAdsConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GoogleAdsConnectionStatus>({
    connected: false,
    oauthConfigured: false,
    customerId: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      const next = await fetchGoogleAdsStatus();
      setStatus(next);
      return next;
    } catch {
      setStatus({ connected: false, oauthConfigured: false, customerId: null });
      return { connected: false, oauthConfigured: false, customerId: null };
    }
  }, []);

  useEffect(() => {
    void refreshStatus().finally(() => setIsLoading(false));
  }, [refreshStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("google_ads_connected") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
      setIsConnecting(false);
      void refreshStatus().then((next) => {
        if (next.connected) {
          toast.success("Google Ads hesabınız bağlandı. Canlı veriler yükleniyor…");
        }
      });
      return;
    }

    const errorCode = params.get("google_ads_error");
    if (errorCode) {
      const errorDetail = params.get("google_ads_error_detail");
      window.history.replaceState({}, "", window.location.pathname);
      setIsConnecting(false);
      const baseMessage =
        GOOGLE_ADS_ERROR_MESSAGES[errorCode] ?? "Google Ads bağlantısı başarısız oldu.";
      toast.error(errorDetail ? `${baseMessage} (${decodeURIComponent(errorDetail)})` : baseMessage);
    }
  }, [refreshStatus]);

  const connect = useCallback(() => {
    if (!status.oauthConfigured) {
      toast.error(GOOGLE_ADS_ERROR_MESSAGES.not_configured);
      return;
    }

    setIsConnecting(true);
    startGoogleAdsOAuth();
  }, [status.oauthConfigured]);

  const disconnect = useCallback(async () => {
    await disconnectGoogleAds();
    setStatus({ connected: false, oauthConfigured: status.oauthConfigured, customerId: null });
    toast.message("Google Ads hesabı bağlantısı kaldırıldı.");
  }, [status.oauthConfigured]);

  const value = useMemo(
    () => ({
      status,
      isConnected: status.connected,
      isConnecting,
      isLoading,
      connect,
      disconnect,
      refreshStatus,
    }),
    [status, isConnecting, isLoading, connect, disconnect, refreshStatus],
  );

  return (
    <GoogleAdsConnectionContext.Provider value={value}>{children}</GoogleAdsConnectionContext.Provider>
  );
}

export function useGoogleAdsConnection(): GoogleAdsConnectionContextValue {
  const context = useContext(GoogleAdsConnectionContext);
  if (!context) {
    throw new Error("useGoogleAdsConnection must be used within GoogleAdsConnectionProvider");
  }
  return context;
}
