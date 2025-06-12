import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/friends.css";
import Header from "./Header";

interface Friend {
  _id: string;
  nombre: string;
  photo: string;
  reviews?: number | any[];
  likes?: number | any[];
  listenList?: any[];
}

const Friends = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const loggedUserId = localStorage.getItem("userId");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sortBy, setSortBy] = useState<string>("name");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        console.log(`Obteniendo amigos del usuario ${userId}`);

        // URL ABSOLUTA - esta es la clave para solucionar el problema
        const url = `http://localhost:4000/user/${userId}/friends`;
        console.log("URL:", url);

        // Añadir timeout para evitar esperas infinitas
        const response = await axios.get(url, { timeout: 5000 });

        // Resto del código igual...
        console.log("Respuesta completa:", response.data);

        if (response.data.success) {
          console.log(`Se encontraron ${response.data.friends.length} amigos`);
          setFriends(response.data.friends);
        } else {
          console.error("Error en respuesta:", response.data);
          setError(response.data.message || "No se pudieron cargar los amigos");
        }
      } catch (err) {
        console.error("Error detallado:", err);

        // Mostrar información específica según tipo de error
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("Datos del error:", err.response.data);
            setError(
              `Error ${err.response.status}: ${
                err.response.data.message || "Error del servidor"
              }`
            );
          } else if (err.request) {
            console.error("No se recibió respuesta");
            setError("No se pudo conectar al servidor");
          } else {
            setError(`Error: ${err.message}`);
          }
        } else {
          setError("Error desconocido al cargar amigos");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFriends();
    } else {
      setError("ID de usuario no especificado");
      setLoading(false);
    }
  }, [userId]);

  // Ordenar amigos según el criterio seleccionado
  // Prevenir errores cuando friends es undefined
  const sortedFriends = friends
    ? [...friends].sort((a, b) => {
        switch (sortBy) {
          case "name": {
            // Verificar que los objetos tienen la propiedad name
            return (a.nombre || "").localeCompare(b.nombre || "");
          }
          case "reviewsCount": {
            const reviewsA = Array.isArray(a.reviews)
              ? a.reviews.length
              : a.reviews || 0;
            const reviewsB = Array.isArray(b.reviews)
              ? b.reviews.length
              : b.reviews || 0;
            return reviewsB - reviewsA;
          }
          case "likesCount": {
            const likesA = Array.isArray(a.likes)
              ? a.likes.length
              : a.likes || 0;
            const likesB = Array.isArray(b.likes)
              ? b.likes.length
              : b.likes || 0;
            return likesB - likesA;
          }
          default: {
            return 0;
          }
        }
      })
    : [];

  const getReviewsCount = (friend: Friend) => {
    return Array.isArray(friend.reviews)
      ? friend.reviews.length
      : friend.reviews || 0;
  };

  const getLikesCount = (friend: Friend) => {
    return Array.isArray(friend.likes)
      ? friend.likes.length
      : friend.likes || 0;
  };

  const getListenListCount = (friend: Friend) => {
    return friend.listenList?.length || 0;
  };

  return (
    <div className="friends-page">
      <div className="friends-container">
        <header className="friends-header">
          <h1>MIS AMIGOS</h1>
          <div className="friends-sort">
            <span className="sort-label">ORDENAR POR</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Nombre</option>
              <option value="reviewsCount">Más reseñas</option>
              <option value="likesCount">Más likes</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="friends-loading">Cargando amigos...</div>
        ) : error ? (
          <div className="friends-error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <div className="friends-content">
            {friends.length > 0 ? (
              <div className="friends-grid">
                {sortedFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="friend-card"
                    onClick={() => navigate(`/user/${friend._id}`)}
                  >
                    <div className="friend-photo">
                      <img
                        src={
                          friend.photo ||
                          "https://via.placeholder.com/150?text=User"
                        }
                        alt={friend.nombre}
                      />
                    </div>
                    <div className="friend-info">
                      <h3>{friend.nombre}</h3>
                      <div className="friend-stats">
                        <div className="stat">
                          <span className="stat-value">
                            {getReviewsCount(friend)}
                          </span>
                          <span className="stat-label">reseñas</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">
                            {getLikesCount(friend)}
                          </span>
                          <span className="stat-label">likes</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">
                            {getListenListCount(friend)}
                          </span>
                          <span className="stat-label">escuchados</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-friends">
                <p>No tienes amigos agregados aún</p>
                <button
                  className="add-friends-btn"
                  onClick={() => navigate("/search/")}
                >
                  Buscar amigos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
