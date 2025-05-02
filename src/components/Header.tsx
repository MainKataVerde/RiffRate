import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./template.css";
import axios from "axios";

type HeaderProps = {
  loggedUserId: string | null;
};

const Header = ({ loggedUserId }: HeaderProps) => {
  const [showInput, setShowInput] = useState(false);
  const [query, setQuery] = useState("");
  const [photo, setPhoto] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search/${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="headerLogo">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="RiffRate" />
        </Link>
      </div>

      {/* Navegación */}
      <nav className="menu">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Inicio
        </Link>
        <Link
          to="/albums/popularity"
          className={location.pathname.includes("/albums") ? "active" : ""}
        >
          Explorar
        </Link>
      </nav>

      {/* Barra de búsqueda */}
      <div className="search-container">
        <div className="search-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Buscar álbumes, artistas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Perfil */}
      <div className="profile">
        {loggedUserId ? (
          <Link to={`/user/${loggedUserId}`}>
            <img
              className="profilePhoto"
              src={photo || "https://via.placeholder.com/36?text=User"}
              alt="Perfil"
            />
          </Link>
        ) : (
          <button
            className="profileLogginButton"
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
