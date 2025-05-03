import { useEffect } from "react";
import "./css/adBanner.css";
// Add type declaration for window.adsbygoogle
interface AdSenseObject {
  push(params: Record<string, unknown>): void;
}

declare global {
  interface Window {
    adsbygoogle: AdSenseObject[];
  }
}

interface AdBannerProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
}

const AdBanner = ({ adSlot, adFormat = "auto", style }: AdBannerProps) => {
  useEffect(() => {
    try {
      // Comprobamos si el script de AdSense ya está cargado
      if (window.adsbygoogle === undefined) {
        const script = document.createElement("script");
        script.src =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        script.setAttribute("data-ad-client", "ca-pub-XXXXXXXXXXXXXXXX"); // Tu ID de cliente
        document.head.appendChild(script);
      }

      // Inicializa el anuncio
      (window.adsbygoogle = window.adsbygoogle || []).push();
    } catch (error) {
      console.error("Error cargando anuncio:", error);
    }
  }, []);

  return (
    <div className="ad-container" style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Reemplaza con tu ID de cliente
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
