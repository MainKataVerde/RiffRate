import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./template.css";
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
      navegate(`/buscar/${encodeURIComponent(query)}`);
      setShowInput(false);
      setQuery("");
    }
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
          <img onClick={() => navegate("/")} src="/public/logo_letras.png" />
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
        <a href="/albums">Albums</a>
        <a href="/listas">Listas</a>
        <a href="/amigos">Amigos</a>
        <a href="/noticias">Noticias</a>
      </div>
      <div className="profile">
        {loggedUserId ? (
          // Si hay usuario logueado, muestra la foto
          <img className="profilePhoto" src={photo} alt="ERROR" />
        ) : (
          // Si no hay usuario logueado, muestra el botón
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
