import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/header.css";
import axios from "axios";

type HeaderProps = {
  loggedUserId: string | null;
};

const Header = ({ loggedUserId }: HeaderProps) => {
  const [showInput, setShowInput] = useState(false);
  const [query, setQuery] = useState("");
  const [photo, setPhoto] = useState("");
  const navegate = useNavigate();

  const handleSearchClick = () => setShowInput((v) => !v);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navegate(`/search/${encodeURIComponent(query)}`);
      setShowInput(false);
      setQuery("");
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("userId");
    // También podrías eliminar otros datos guardados en localStorage
    navegate("/login");
    // Recarga la página para asegurar que todos los estados se resetean
    window.location.reload();
  };

  useEffect(() => {
    if (loggedUserId) {
      axios
        .get(`http://localhost:4000/user/${loggedUserId}`)
        .then(({ data }) => {
          setPhoto(data.photo);
        })
        .catch((error) => console.error(error));
    }
  }, [loggedUserId]);

  return (
    <div className="header">
      <div className="headerLogo">
        <div className="logo">
          <img onClick={() => navegate("/")} src="/public/logo.png" />
        </div>
      </div>
      <div className="menu">
        <div className="search-container">
          <span className="search-icon" onClick={handleSearchClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#00215E"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
          </span>
          <input
            className={`search-input ${showInput ? "show" : ""}`}
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ transition: "width 0.3s, opacity 0.3s" }}
          />
        </div>
        <a href="/albums/popularity">Albums</a>
        <a href="/listas">Listas</a>
        <a href={`/user/${loggedUserId}/friends`}>Amigos</a>
        <a href="/noticias">Noticias</a>
      </div>
      <div className="profile">
        {loggedUserId ? (
          <div className="profile-container">
            <img className="profilePhoto" src={photo} alt="Perfil" />

            {/* Menú desplegable */}
            <div className="profile-dropdown">
              <div
                className="dropdown-item"
                onClick={() => navegate(`/user/${loggedUserId}`)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18"
                  viewBox="0 -960 960 960"
                  width="18"
                >
                  <path
                    d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"
                    fill="#ffffff"
                  />
                </svg>
                Mi perfil
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18"
                  viewBox="0 -960 960 960"
                  width="18"
                >
                  <path
                    d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"
                    fill="#ffffff"
                  />
                </svg>
                Cerrar sesión
              </div>
            </div>
          </div>
        ) : (
          <button
            className="profileLogginButton"
            onClick={() => navegate("/login")}
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
