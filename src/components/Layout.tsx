import React from "react";
import AdBanner from "./AdBanner";
import Header from "./Header";
import Footer from "./Footer";
import "./css/layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Obtenemos el userId del localStorage o de donde lo manejes
  const loggedUserId = localStorage.getItem("userId") || "";

  return (
    <div className="page-container">
      {/* Header con ancho completo */}
      <Header loggedUserId={loggedUserId} />

      {/* Contenido con anuncios laterales */}
      <div className="content-with-ads">
        {/* Anuncio lateral izquierdo */}
        <div className="ad-sidebar left-sidebar">
          <AdBanner
            adSlot="1234567890"
            adFormat="vertical"
            adSize="skyscraper"
          />
        </div>

        {/* Contenido principal */}
        <div className="main-content">{children}</div>

        {/* Anuncio lateral derecho */}
        <div className="ad-sidebar right-sidebar">
          <AdBanner
            adSlot="0987654321"
            adFormat="vertical"
            adSize="skyscraper"
          />
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Layout;
