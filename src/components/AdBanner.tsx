import { useEffect } from "react";
import "./css/adBanner.css";

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
  adSize?:
    | "small"
    | "medium"
    | "large"
    | "leaderboard"
    | "skyscraper"
    | "billboard";
  style?: React.CSSProperties;
}

const AdBanner = ({
  adSlot,
  adFormat = "auto",
  adSize = "medium",
  style,
}: AdBannerProps) => {
  const ADSENSE_PUB_ID = "ca-pub-TU_ID_REAL_AQUÍ"; // Reemplaza con tu ID real de AdSense

  // Definición de tamaños estándar de anuncios
  const sizeStyles = {
    small: { minHeight: "90px", width: "100%", maxWidth: "300px" },
    medium: { minHeight: "250px", width: "100%", maxWidth: "336px" },
    large: { minHeight: "280px", width: "100%", maxWidth: "728px" },
    leaderboard: { minHeight: "90px", width: "100%", maxWidth: "728px" },
    skyscraper: { minHeight: "600px", width: "160px", maxWidth: "200px" },
    billboard: { minHeight: "600px", width: "100%", maxWidth: "970px" }, // Anuncio más grande
  };

  // Combinar estilos predefinidos con estilos personalizados
  const combinedStyle = {
    ...(adSize ? sizeStyles[adSize] : {}),
    ...style,
  };

  useEffect(() => {
    // Solo ejecutar en producción, no en desarrollo local
    if (process.env.NODE_ENV === "production") {
      try {
        // Cargar script de AdSense si aún no está cargado
        if (window.adsbygoogle === undefined) {
          const script = document.createElement("script");
          script.src =
            "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
          script.async = true;
          script.crossOrigin = "anonymous";
          script.setAttribute("data-ad-client", ADSENSE_PUB_ID);
          document.head.appendChild(script);
        }

        // Inicializar el anuncio
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("Error cargando anuncio:", error);
      }
    }
  }, []);

  // Fallback para entorno de desarrollo - muestra un placeholder
  if (process.env.NODE_ENV !== "production") {
    return (
      <div
        className={`ad-placeholder ad-size-${adSize}`}
        style={{
          ...combinedStyle,
          backgroundColor: "#f0f0f0",
          border: "1px dashed #ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: style?.position || "relative",
          top: style?.top || "auto",
        }}
      >
        <p>
          Espacio para anuncio ({adSlot})
          <br />
          Formato: {adFormat} - Tamaño: {adSize}
        </p>
      </div>
    );
  }

  // Versión para producción
  return (
    <div className={`ad-container ad-size-${adSize}`} style={combinedStyle}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={ADSENSE_PUB_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
