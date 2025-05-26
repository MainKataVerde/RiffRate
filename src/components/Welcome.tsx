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
  photo: string;
  reviews: string[];
}

interface Review {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        nombre?: string;
        photo?: string;
      };
  albumId:
    | string
    | {
        _id: string;
        name?: string;
        cover?: string;
        released?: string;
      };
  text: string;
  rating: number;
  likes: number;
  likesCount?: number;
  date: string;
  favoriteTrack?: string;
}

interface ReviewCardProps {
  review: Review;
  navigate: (path: string) => void;
}

const Welcome = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [friendsAlbums, setFriendsAlbums] = useState<Album[]>([]);
  const [topListeners, setTopListeners] = useState<User[]>([]);
  const [topReviewers, setTopReviewers] = useState<User[]>([]);
  const [nombre, setNombre] = useState("");
  const [hasFriends, setHasFriends] = useState(false);
  const [showListeners] = useState(true);
  const loggedUserId = localStorage.getItem("userId");
  const [friendReviews, setFriendReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [popularReviews, setPopularReviews] = useState<Review[]>([]);
  const [isLoadingPopularReviews, setIsLoadingPopularReviews] = useState(false);

  const navigate = useNavigate();

  // Añade este componente dentro de Welcome.tsx o en un archivo separado

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

    if (loggedUserId) {
      setIsLoadingReviews(true);
      fetch(
        `http://localhost:4000/${loggedUserId}/friends/reviews/popular?limit=5`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("Datos completos de reseñas de amigos:", data);
          console.log("Primera review (si existe):", data.reviews?.[0]);
          if (data.success && Array.isArray(data.reviews)) {
            setFriendReviews(data.reviews);
          } else {
            console.warn("Estructura inesperada en friendReviews:", data);
            setFriendReviews([]);
          }
        })
        .catch((err) => {
          console.error("Error al cargar reseñas de amigos:", err);
          setFriendReviews([]);
        })
        .finally(() => {
          setIsLoadingReviews(false);
        });
    }

    setIsLoadingPopularReviews(true);
    fetch(
      `http://localhost:4000/reviews/popular?withText=true&limit=2&populate=true`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos de reseñas populares:", data);
        // Verificamos la estructura y registramos más detalles
        if (data.success && Array.isArray(data.reviews)) {
          console.log(`Reseñas populares cargadas: ${data.reviews.length}`);
          setPopularReviews(data.reviews);
        } else {
          console.warn("Estructura inesperada en reseñas populares:", data);
          setPopularReviews([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar reseñas populares:", err);
        setPopularReviews([]);
      })
      .finally(() => {
        setIsLoadingPopularReviews(false);
      });
  }, [loggedUserId]);

  const ReviewCard = ({ review, navigate }: ReviewCardProps) => {
    const [reviewLiked, setReviewLiked] = useState(false);

    // Mantener toda la lógica de extracción de datos igual
    const userIsObject =
      typeof review.userId === "object" && review.userId !== null;
    const albumIsObject =
      typeof review.albumId === "object" && review.albumId !== null;

    // Renderiza notas musicales para el rating
    const renderRating = (rating: number) => {
      const notes = [];
      for (let i = 0; i < 5; i++) {
        notes.push(
          <span
            key={`note-${i}`}
            className={i < rating ? "music-note filled" : "music-note"}
          >
            ♪
          </span>
        );
      }
      return notes;
    };

    // Lógica de extracción de datos (se mantiene igual)
    const albumCover = albumIsObject
      ? (review.albumId as any).cover
      : review.album?.cover || "https://via.placeholder.com/150?text=Album";
    const albumDate = albumIsObject
      ? (review.albumId as any).released
      : review.album?.released;
    const albumName = albumIsObject
      ? (review.albumId as any).name
      : review.album?.name || "Nombre Album";
    const albumId = albumIsObject
      ? (review.albumId as any)._id
      : typeof review.albumId === "string"
      ? review.albumId
      : "";
    const userPhoto = userIsObject
      ? (review.userId as any).photo
      : review.user?.photo || "https://via.placeholder.com/40?text=User";
    const userName = userIsObject
      ? (review.userId as any).nombre || (review.userId as any).username
      : review.user?.nombre || review.user?.username || "Usuario";
    const userId = userIsObject
      ? (review.userId as any)._id
      : typeof review.userId === "string"
      ? review.userId
      : "";

    const formatReleaseDate = (albumDate: any): React.ReactNode => {
      if (typeof albumDate === "string" && /^\d{4}$/.test(albumDate)) {
        return albumDate;
      }
      try {
        const date = new Date(albumDate);
        if (isNaN(date.getTime())) return albumDate;
        return date.getFullYear().toString();
      } catch (error) {
        console.error("Error formatting date:", error);
        return albumDate;
      }
    };

    return (
      <div className="rese-container friend-review-card">
        {/* Sección superior: Foto álbum + Info usuario y álbum */}
        <div className="rese-top">
          {/* Lado izquierdo: Portada del álbum */}
          <div className="rese-top-left">
            <img
              src={albumCover}
              alt={albumName}
              className="albumFoto"
              onClick={() => albumId && navigate(`/album/${albumId}`)}
            />
          </div>

          {/* Lado derecho: Info usuario y álbum */}
          <div className="rese-top-right">
            {/* Parte superior derecha: Avatar + nombre usuario */}
            <div className="rese-top-right-top">
              <img
                src={userPhoto}
                alt={userName}
                className="userPhoto"
                onClick={() => userId && navigate(`/user/${userId}`)}
              />
              <h1 className="userName">{userName}</h1>
            </div>

            {/* Parte inferior derecha: Título álbum + fecha */}
            <div className="rese-top-right-bottom">
              <h1 className="tituloAlbum">
                {albumName}{" "}
                <span className="fechaAlbum">
                  {albumDate ? formatReleaseDate(albumDate) : "0000"}
                </span>
              </h1>
              <div className="review-rating-row">
                {renderRating(review.rating || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Sección inferior: Texto review + likes */}
        <div className="rese-bottom">
          {/* Parte superior: Texto de la reseña */}
          <div className="rese-bottom-top">
            <p className="textoReseña">
              {review.text || "Lorem ipsum dolor sit amet..."}
            </p>
          </div>

          {/* Parte inferior: Botón de like */}
          <div className="rese-bottom-bottom">
            <div
              className="review-footer"
              onClick={() => setReviewLiked(!reviewLiked)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={reviewLiked ? "#ff4081" : "#ffffff"}
                className="like-heart-icon"
              >
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
              </svg>
              <span className="likes-count">
                {review.likesCount || review.likes || 0} LIKES
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Función para renderizar usuarios
  const renderUsers = (users: User[], type: "listeners" | "reviewers") => {
    return (
      <div className="albumContent user-content">
        {users.slice(0, 6).map((user) => (
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
                  ? `${user.reviews.length || 0} escuchas`
                  : ``}
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
                  <b>{nombre}</b> ,¿que vamos a escuchar hoy?
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
                {albums.slice(0, 6).map((album) => (
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
                  {friendsAlbums.slice(0, 6).map((album) => (
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
            {/* Friends Reviews section - solo muestra si el usuario está logueado */}
            {/* Sección unificada de Reviews */}
            <div className="populares-header">
              <h2>
                {loggedUserId && friendReviews && friendReviews.length > 0
                  ? "Reviews de amigos"
                  : "Popular Reviews"}
              </h2>
              <span
                className="arrow"
                onClick={() =>
                  navigate(
                    loggedUserId && friendReviews.length > 0
                      ? "/reviews/friends"
                      : "/reviews/popular"
                  )
                }
              >
                {">"}
              </span>
            </div>
            <hr className="populares-divider" />

            <div className="reviews-container">
              {isLoadingReviews || isLoadingPopularReviews ? (
                <div className="loading-reviews">Cargando reseñas...</div>
              ) : loggedUserId && friendReviews && friendReviews.length > 0 ? (
                // Reseñas de amigos si el usuario está logueado y tiene amigos con reseñas
                <div className="friends-reviews-grid">
                  {friendReviews
                    .slice(0, 2)
                    .map((review) =>
                      review && review._id ? (
                        <ReviewCard
                          key={review._id}
                          review={review}
                          navigate={navigate}
                        />
                      ) : null
                    )}
                </div>
              ) : popularReviews && popularReviews.length > 0 ? (
                // Reseñas populares si no hay de amigos o el usuario no está logueado
                <div className="friends-reviews-grid">
                  {popularReviews
                    .slice(0, 2)
                    .map((review) =>
                      review && review._id ? (
                        <ReviewCard
                          key={review._id}
                          review={review}
                          navigate={navigate}
                        />
                      ) : null
                    )}
                </div>
              ) : (
                <div className="no-reviews">No hay reseñas disponibles.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
