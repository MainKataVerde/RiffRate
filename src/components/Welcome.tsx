import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/welcome.css";
import axios from "axios";
import Header from "./Header";

interface Album {
  _id: string;
  name: string;
  popularity: number;
  cover: string;
}

interface User {
  _id: string;
  nombre: string;
  username: string;
  photo: string;
  reviewCount?: number;
  listenCount?: number;
}

const Welcome = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [friendsAlbums, setFriendsAlbums] = useState<Album[]>([]);
  const [topListeners, setTopListeners] = useState<User[]>([]);
  const [topReviewers, setTopReviewers] = useState<User[]>([]);
  const [nombre, setNombre] = useState("");
  const [hasFriends, setHasFriends] = useState(false);
  const [showListeners, setShowListeners] = useState(true); // Nuevo estado para alternar
  const loggedUserId = localStorage.getItem("userId");

  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos del usuario
    if (loggedUserId) {
      axios
        .get(`http://localhost:4000/user/${loggedUserId}`)
        .then(({ data }) => {
          setNombre(data.nombre);
        })
        .catch((error) => console.error(error));
    }

    // Obtener álbumes populares generales
    fetch("http://localhost:4000/popular")
      .then((res) => res.json())
      .then((data) => setAlbums(data))
      .catch((err) => console.error("Error al cargar álbumes populares:", err));

    // Obtener usuarios top (listeners y reviewers)
    fetch("http://localhost:4000/toplisteners")
      .then((res) => res.json())
      .then((data) => {
        // Manejar la estructura de respuesta correcta
        if (data.success && Array.isArray(data.results)) {
          setTopListeners(data.results);
        } else {
          setTopListeners(data || []); // Fallback si la estructura es diferente
        }
      })
      .catch((err) => console.error("Error al cargar top listeners:", err));

    fetch("http://localhost:4000/topReviewers")
      .then((res) => res.json())
      .then((data) => {
        // Manejar la estructura de respuesta correcta
        if (data.success && Array.isArray(data.results)) {
          setTopReviewers(data.results);
        } else {
          setTopReviewers(data || []); // Fallback si la estructura es diferente
        }
      })
      .catch((err) => console.error("Error al cargar top reviewers:", err));

    // Obtener álbumes populares entre amigos si hay un usuario logueado
    if (loggedUserId) {
      fetch(`http://localhost:4000/popular/friends/${loggedUserId}`)
        .then((res) => res.json())
        .then((data) => {
          setFriendsAlbums(data);
          setHasFriends(data.length > 0);
        })
        .catch((err) => {
          console.error("Error al cargar álbumes populares entre amigos:", err);
          setHasFriends(false);
        });
    }
  }, [loggedUserId]);

  // Función para renderizar usuarios
  const renderUsers = (users: User[], type: "listeners" | "reviewers") => {
    return (
      <div className="albumContent user-content">
        {users.slice(0, 10).map((user) => (
          <div className="user-item" key={user._id}>
            <div
              className="user-avatar"
              onClick={() => navigate(`/user/${user._id}`)}
            >
              <img
                src={user.photo || "https://via.placeholder.com/110?text=User"}
                alt={user.nombre}
              />
            </div>
            <div className="user-info">
              <p className="user-name">{user.nombre || user.username}</p>
              <p className="user-stat">
                {type === "listeners"
                  ? `${user.listenCount || 0} escuchas`
                  : `${user.reviewCount || 0} reviews`}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Determinar qué mostrar en la segunda sección
  const shouldShowFriendsAlbums = loggedUserId && hasFriends;

  return (
    <>
      <div className="welcomeContainer">
        <Header loggedUserId={loggedUserId} />
        <div className="cuerpo">
          <div className="cuerpoArriba">
            <div className="cuerpoArribaTexto">
              {loggedUserId ? (
                <h1>
                  Hola {""}
                  <b>{nombre}</b> ,¿que vamos a escuchar hoy ?
                </h1>
              ) : (
                <h1>
                  <b onClick={() => navigate("/login")}>Inicia sesion</b> y
                  ponle nota a tu sonido
                </h1>
              )}
            </div>
          </div>
          <div className="cuerpoAbajo">
            <div className="populares-header">
              <h2>Populares</h2>
              <span
                className="arrow"
                onClick={() => navigate(`/albums/popularity`)}
              >
                {">"}
              </span>
            </div>
            <hr className="populares-divider" />
            {/* Sección de álbumes populares con scroll visible */}
            <div className="albumes">
              <div className="albumContent">
                {albums.slice(0, 10).map((album) => (
                  <div className="album" key={album._id}>
                    <img
                      src={album.cover || "https://via.placeholder.com/220"}
                      alt={album.name}
                      onClick={() => navigate(`/album/${album._id}`)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Segunda sección: amigos o top users */}
            <div className="populares-header">
              <h2>
                {shouldShowFriendsAlbums
                  ? "Populares entre tus amigos"
                  : "Top usuarios que puedes seguir"}
              </h2>

              <span
                className="arrow"
                onClick={() =>
                  shouldShowFriendsAlbums
                    ? navigate(`/albums/popularity?friends=true`)
                    : navigate(`/users/top`)
                }
              >
                {">"}
              </span>
            </div>
            <hr className="populares-divider" />

            <div className="albumes">
              {shouldShowFriendsAlbums ? (
                // Mostrar álbumes de amigos
                <div className="albumContent">
                  {friendsAlbums.slice(0, 10).map((album) => (
                    <div className="album" key={album._id}>
                      <img
                        src={album.cover || "https://via.placeholder.com/220"}
                        alt={album.name}
                        onClick={() => navigate(`/album/${album._id}`)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // Mostrar usuarios top basado en la selección
                renderUsers(
                  showListeners ? topListeners : topReviewers,
                  showListeners ? "listeners" : "reviewers"
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
