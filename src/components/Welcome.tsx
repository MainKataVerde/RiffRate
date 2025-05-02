import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./template.css";
import axios from "axios";
import Header from "./Header";

interface Album {
  _id: string;
  name: string;
  popularity: number;
  cover: string;
}

const Welcome = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [friendsAlbums, setFriendsAlbums] = useState<Album[]>([]);
  const [nombre, setNombre] = useState("");
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

    // Obtener álbumes populares entre amigos si hay un usuario logueado
    if (loggedUserId) {
      fetch(`http://localhost:4000/popular/friends/${loggedUserId}`)
        .then((res) => res.json())
        .then((data) => setFriendsAlbums(data))
        .catch((err) =>
          console.error("Error al cargar álbumes populares entre amigos:", err)
        );
    }
  }, [loggedUserId]);

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

            {/* Sección de álbumes populares entre amigos */}
            {loggedUserId && (
              <>
                <div className="populares-header">
                  <h2>Populares entre tus amigos</h2>
                  <span
                    className="arrow"
                    onClick={() => navigate(`/albums/popularity?friends=true`)}
                  >
                    {">"}
                  </span>
                </div>
                <hr className="populares-divider" />
                <div className="albumes">
                  <div className="albumContent">
                    {friendsAlbums.length > 0 ? (
                      friendsAlbums.slice(0, 10).map((album) => (
                        <div className="album" key={album._id}>
                          <img
                            src={
                              album.cover || "https://via.placeholder.com/220"
                            }
                            alt={album.name}
                            onClick={() => navigate(`/album/${album._id}`)}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="no-friends-albums">
                        Aún no hay álbumes populares entre tus amigos o no
                        tienes amigos agregados.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
