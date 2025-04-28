import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./template.css";
import axios from "axios";

type HeaderProps = {
  loggedUserId: string | null;
};

const Header = ({ loggedUserId }: HeaderProps) => {
  const [photo, setPhoto] = useState("");
  const [nombre, setNombre] = useState("");
  const navegate = useNavigate();

  useEffect(() => {
    if (loggedUserId) {
      axios
        .get(`http://localhost:4000/user/${loggedUserId}`)
        .then(({ data }) => {
          setPhoto(data.photo);
          setNombre(data.nombre);
        })
        .catch((error) => console.error(error));
    }
  }, [loggedUserId]);

  return (
    <div className="header">
      <div className="headerLogo">
        <div className="logo"></div>
        <h1 onClick={() => navegate("/")}>Riffrate</h1>
      </div>
      <div className="menu">
        <a href="/albums">Albums</a>
        <a href="/listas">Listas</a>
        <a href="/amigos">Amigos</a>
        <a href="/noticias">Noticias</a>
        <span className="search-icon">
          {/* Puedes usar un SVG de lupa aquí */}
          <svg viewBox="0 0 24 24">
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </span>
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
