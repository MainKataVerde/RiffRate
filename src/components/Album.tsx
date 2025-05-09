import { useState, useEffect } from "react";
import Header from "./Header";
import { useParams, useNavigate } from "react-router-dom";
import "./css/album.css";
import axios from "axios";

interface Review {
  userId: string;
  username: string;
  userPhoto: string;
  text: string;
  rating: number;
  likes: number;
  date: string;
  viewed: boolean;
  favoriteTrack?: string; // Añadido campo para track favorito
}

// Interfaz para los datos del artista
interface ArtistData {
  _id: string;
  name: string;
  photo: string;
  bio: string;
  followers: number;
  albums: string[];
}

interface AlbumData {
  _id: string;
  name: string;
  artist: string;
  cover: string;
  genres: string[];
  tracks: string[];
  producers: string[];
  label: string;
  released: string;
  description: string;
  duration: number;
  links: { url: string }[] | string[]; // Actualizado para soportar ambos formatos
  reviews: Review[];
  popularity: number;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

const Album = () => {
  const { id } = useParams();
  const loggedUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendReviews, setFriendReviews] = useState<Review[]>([]);
  const [popularReviews, setPopularReviews] = useState<Review[]>([]);
  const [similarAlbums, setSimilarAlbums] = useState<AlbumData[]>([]);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [albumViewed, setAlbumViewed] = useState<boolean>(false);
  const [albumLiked, setAlbumLiked] = useState<boolean>(false);
  const [favoriteTrack, setFavoriteTrack] = useState<string>(""); // Nuevo estado para track favorito

  // Estados para el diálogo de reseña
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");

  // Función para navegar al productor
  const navigateToProducer = (producerName: string) => {
    // Navega a la búsqueda del productor
    navigate(`/search?q=${encodeURIComponent(producerName)}&type=artist`);
  };

  // Función para manejar el clic en las calificaciones
  const handleRateClick = async (rating: number) => {
    // Actualizar estado local inmediatamente para feedback visual
    setUserRating(rating);
    setRatingSaving(true);
    setRatingError(null);

    // Marcar como visto automáticamente cuando se puntúa
    setAlbumViewed(true);

    try {
      // Verificar si el usuario está logueado
      if (!loggedUserId) {
        // Si no hay usuario logueado, redirigir al login
        navigate("/login", {
          state: {
            returnUrl: `/album/${id}`,
            message: "Inicia sesión para calificar álbumes",
          },
        });
        return;
      }

      // Datos completos para el servidor
      const reviewData = {
        userId: loggedUserId,
        albumId: id,
        rating: rating,
        viewed: true,
        date: new Date().toISOString(), // Asegurarse que la fecha es válida
        // Text vacío para evitar problemas de validación
        text: "",
      };

      // Enviar la calificación al servidor
      const response = await axios.post(
        "http://localhost:4000/reviews/create",
        reviewData
      );

      // Log detallado para depuración
      console.log("Respuesta del servidor al guardar rating:", response.data);

      if (response.data.success) {
        console.log("Calificación guardada con éxito");

        // Verificación opcional para confirmar el guardado
        try {
          const verifyRes = await axios.get(
            `http://localhost:4000/user/${loggedUserId}/album/${id}/hasReview`
          );
          console.log("Verificación post-guardado:", verifyRes.data);
        } catch (e) {
          console.warn("Error en verificación:", e);
        }
      } else {
        setRatingError("No se pudo guardar la calificación");
      }
    } catch (error) {
      console.error("Error al guardar la calificación:", error);
      setRatingError("Error al conectar con el servidor");
    } finally {
      setRatingSaving(false);
    }
  };

  // Función para manejar el envío de la reseña
  const handleSubmitReview = async () => {
    setRatingSaving(true);

    try {
      if (!loggedUserId) {
        navigate("/login", {
          state: {
            returnUrl: `/album/${id}`,
            message: "Inicia sesión para hacer reseñas",
          },
        });
        return;
      }

      const reviewData = {
        userId: loggedUserId,
        albumId: id,
        text: reviewText,
        rating: userRating || 0,
        viewed: true,
        date: new Date().toISOString(),
        favoriteTracks: favoriteTrack || undefined, // Cambiado a favoriteTracks para que coincida con el backend
      };

      const response = await axios.post(
        "http://localhost:4000/reviews/create",
        reviewData
      );

      if (response.data.success) {
        // Cerrar diálogo y limpiar texto
        setReviewDialogOpen(false);
        setReviewText("");
        setFavoriteTrack(""); // Limpiar el track favorito

        // Actualizar las reseñas populares si es necesario
        try {
          const popularRes = await axios.get(
            `http://localhost:4000/album/${id}/reviews/popular`
          );
          if (popularRes.data.success) {
            setPopularReviews(popularRes.data.reviews || []);
          }
        } catch (err) {
          console.error("Error al recargar reseñas:", err);
        }
      } else {
        alert("Error al publicar la reseña");
      }
    } catch (error) {
      console.error("Error al enviar la reseña:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setRatingSaving(false);
    }
  };

  // Función para manejar el clic en el botón "Visto"
  const handleViewedClick = async () => {
    // Cambiar el estado visual inmediatamente para feedback
    setAlbumViewed(!albumViewed);

    try {
      // Verificar si el usuario está logueado
      if (!loggedUserId) {
        navigate("/login", {
          state: {
            returnUrl: `/album/${id}`,
            message: "Inicia sesión para marcar álbumes como vistos",
          },
        });
        // Revertir el cambio visual ya que no se pudo completar la acción
        setAlbumViewed(albumViewed);
        return;
      }

      // Datos completos para enviar al servidor
      const reviewData = {
        userId: loggedUserId,
        albumId: id,
        viewed: !albumViewed,
        // Mantener la calificación actual si existe
        rating: userRating || undefined,
        // Incluir fecha para evitar problemas de validación
        date: new Date().toISOString(),
      };

      // Enviar al servidor
      const response = await axios.post(
        "http://localhost:4000/reviews/create",
        reviewData
      );

      // Log detallado para depuración
      console.log("Respuesta al actualizar visto:", response.data);

      if (!response.data.success) {
        // Si hay error, revertir el cambio visual
        setAlbumViewed(albumViewed);
        console.error("Error al actualizar estado de visto");
      }
    } catch (error) {
      // Revertir cambio en caso de error
      setAlbumViewed(albumViewed);
      console.error("Error al conectar con el servidor:", error);
    }
  };

  // Función para manejar el like/unlike del álbum
  const handleLikeClick = async () => {
    // Cambiar el estado visual inmediatamente para feedback
    setAlbumLiked(!albumLiked);

    try {
      // Verificar si el usuario está logueado
      if (!loggedUserId) {
        navigate("/login", {
          state: {
            returnUrl: `/album/${id}`,
            message: "Inicia sesión para dar like a álbumes",
          },
        });
        // Revertir el cambio visual
        setAlbumLiked(albumLiked);
        return;
      }

      // Datos para enviar al servidor
      const likeData = {
        userId: loggedUserId,
        albumId: id,
      };

      // Determinar si estamos añadiendo o eliminando el like
      const endpoint = albumLiked
        ? "http://localhost:4000/likes/remove"
        : "http://localhost:4000/likes/add";

      // Enviar la solicitud al servidor
      const response = await axios.post(endpoint, likeData);

      console.log("Respuesta del servidor:", response.data);

      if (!response.data.success) {
        // Si hay error, revertir el cambio visual
        setAlbumLiked(albumLiked);
        console.error("Error al actualizar like:", response.data.message);
      }
    } catch (error) {
      // Revertir cambio en caso de error
      setAlbumLiked(albumLiked);
      console.error("Error al conectar con el servidor:", error);
    }
  };

  // Función para eliminar etiquetas HTML del texto
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, "");
  };

  // Función para obtener los datos del artista
  const fetchArtistData = async (artistName: string) => {
    try {
      const res = await axios.get(
        `http://localhost:4000/artistName/${encodeURIComponent(artistName)}`
      );
      setArtist(res.data);
    } catch (err) {
      console.error("Error al cargar datos del artista:", err);
    }
  };

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("ID de álbum no encontrado");
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:4000/album/${id}`);

        if (res.data.success) {
          const albumData = res.data.album;
          console.log("Album links:", albumData.links);
          setAlbum(albumData);

          // Cargar datos del artista una vez que tengamos el nombre
          if (albumData && albumData.artist) {
            await fetchArtistData(albumData.artist);
          }

          // Si el usuario está logueado, verificar si ya ha hecho review y cargar su estado
          if (loggedUserId && id) {
            try {
              // Primero verificamos si el usuario tiene una review usando el endpoint correspondiente
              const hasReviewRes = await axios.get(
                `http://localhost:4000/user/${loggedUserId}/album/${id}/hasReview`
              );
              console.log("Verificación de review:", hasReviewRes.data);

              // Si el usuario tiene una review, cargar los detalles completos
              if (hasReviewRes.data.success && hasReviewRes.data.hasReviewed) {
                try {
                  // CORRECCIÓN: Usar la ruta correcta según los endpoints disponibles
                  const userReviewRes = await axios.get(
                    `http://localhost:4000/user/${loggedUserId}/album/${id}/review`
                  );
                  console.log("Datos de review:", userReviewRes.data);

                  if (userReviewRes.data.success) {
                    let reviewData = null;

                    // Manejo de diferentes formatos posibles de respuesta
                    if (
                      userReviewRes.data.reviews &&
                      userReviewRes.data.reviews.length > 0
                    ) {
                      // Formato array - tomamos la primera review (más reciente)
                      reviewData = userReviewRes.data.reviews[0];
                    } else if (userReviewRes.data.review) {
                      // Formato objeto único
                      reviewData = userReviewRes.data.review;
                    }

                    if (reviewData) {
                      // Establecer el rating y estado visto
                      console.log("Review cargada:", reviewData);
                      setUserRating(reviewData.rating || 0);

                      // Si hay texto de reseña, guardarlo para posible edición
                      if (reviewData.text) {
                        setReviewText(reviewData.text);
                      }

                      // Cargar track favorito si existe
                      if (reviewData.favoriteTrack) {
                        setFavoriteTrack(reviewData.favoriteTrack);
                      } else if (reviewData.favoriteTracks) {
                        // Si el backend devuelve favoriteTracks en lugar de favoriteTrack
                        setFavoriteTrack(reviewData.favoriteTracks);
                      }

                      // Un álbum se considera visto si está explícitamente marcado como tal,
                      // si tiene rating o si tiene texto de review
                      setAlbumViewed(
                        reviewData.viewed ||
                          reviewData.rating > 0 ||
                          Boolean(reviewData.text)
                      );
                    }
                  }
                } catch (reviewErr) {
                  console.error("Error al cargar datos de review:", reviewErr);
                }
              }
            } catch (err) {
              console.error(
                "Error al verificar si el usuario ha reseñado el álbum:",
                err
              );
            }

            // Verificar si el álbum está en likes del usuario
            try {
              const userLikeRes = await axios.get(
                `http://localhost:4000/user/${loggedUserId}/album/${id}/liked`
              );

              if (userLikeRes.data.success) {
                setAlbumLiked(userLikeRes.data.isLiked);
              }
            } catch (likeErr) {
              console.error("Error al verificar like del álbum:", likeErr);
            }

            try {
              const friendsRes = await axios.get(
                `http://localhost:4000/album/${id}/reviews/friends/${loggedUserId}`
              );
              if (friendsRes.data.success) {
                setFriendReviews(friendsRes.data.reviews || []);
              }
            } catch (err) {
              console.error("Error al cargar reseñas de amigos:", err);
            }
          }

          // Cargar reseñas populares
          try {
            const popularRes = await axios.get(
              `http://localhost:4000/album/${id}/reviews/popular`
            );
            if (popularRes.data.success) {
              setPopularReviews(popularRes.data.reviews || []);
            }
          } catch (err) {
            console.error("Error al cargar reseñas populares:", err);
          }

          // Cargar álbumes similares
          try {
            const similarRes = await axios.get(
              `http://localhost:4000/album/${id}/similar`
            );
            if (similarRes.data.success) {
              setSimilarAlbums(similarRes.data.albums || []);
            }
          } catch (err) {
            console.error("Error al cargar álbumes similares:", err);
          }
        } else {
          setError("No se pudo cargar el álbum");
        }
      } catch (err) {
        console.error("Error al cargar el álbum:", err);
        setError("Error al cargar el álbum");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [id, loggedUserId]);

  if (loading) {
    return (
      <div>
        <Header loggedUserId={loggedUserId} />
        <div className="album-loading">
          <div className="loading-spinner"></div>
          <p>Cargando álbum...</p>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div>
        <Header loggedUserId={loggedUserId} />
        <div className="album-error">
          <p>{error || "No se pudo cargar el álbum"}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Formatear la fecha de lanzamiento
  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return "Año desconocido";
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch (e) {
      return "Año desconocido" + e;
    }
  };

  // Renderizar estrellas basadas en la calificación
  const renderStars = (rating: number) => {
    const stars = [];
    const safeRating = rating || 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= safeRating) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  // Determinar si el array existe y tiene elementos
  const hasItems = (arr: any[] | undefined | null) => {
    return Array.isArray(arr) && arr.length > 0;
  };

  // Truncar descripción si es muy larga
  const truncateDescription = (text: string, maxLength: number = 300) => {
    if (!text) return "";
    if (showFullDescription || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="app-container">
      {/* Sección 1: Header/Navegación */}
      <div className="header-section">
        <Header loggedUserId={loggedUserId} />
      </div>

      {/* Sección 2: Contenido principal del álbum */}
      <div className="main-album-section">
        <div className="album-content">
          {/* Columna izquierda - Cover, streaming y tracks */}
          <div className="album-left">
            <div className="album-cover">
              <img
                src={
                  album.cover || "https://via.placeholder.com/300?text=Álbum"
                }
                alt={album.name || "Álbum"}
              />
            </div>
            <div className="album-streaming">
              <h3 className="section-title">DONDE VER</h3>
              <div className="streaming-links">
                {Array.isArray(album.links) && album.links.length > 0 ? (
                  album.links.map((link, index) => {
                    // Determinar si link es una string directamente o un objeto con propiedad url
                    const url = typeof link === "string" ? link : link?.url;

                    // Verificación adicional de seguridad
                    if (!url || typeof url !== "string" || url.trim() === "") {
                      return null;
                    }

                    // Determinar qué icono y nombre mostrar basado en la URL
                    let iconSrc = "/default-music-icon.png";
                    let platformName = "Música";

                    try {
                      // Extraer el dominio de la URL para identificar la plataforma
                      const urlLower = url.toLowerCase();

                      if (
                        urlLower.includes("spotify.com") ||
                        urlLower.includes("spoti.fi")
                      ) {
                        iconSrc = "/spotify-icon.svg";
                        platformName = "Spotify";
                      } else if (
                        urlLower.includes("apple.com") ||
                        urlLower.includes("itunes") ||
                        urlLower.includes("music.apple")
                      ) {
                        iconSrc = "/apple-music-icon.svg";
                        platformName = "Apple Music";
                      } else if (
                        urlLower.includes("youtube.com") ||
                        urlLower.includes("youtu.be")
                      ) {
                        iconSrc = "/youtube-icon.svg";
                        platformName = "Youtube music";
                      } else if (urlLower.includes("soundcloud.com")) {
                        iconSrc = "/soundcloud-icon.svg";
                        platformName = "SoundCloud";
                      }
                    } catch (e) {
                      console.error("Error al procesar URL:", e);
                    }

                    return (
                      <a
                        key={index}
                        className="streaming-link"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={iconSrc} alt={platformName} />
                        <span>{platformName}</span>
                      </a>
                    );
                  })
                ) : (
                  <div className="no-links-message">
                    No hay enlaces de streaming disponibles
                  </div>
                )}
              </div>
            </div>
            <div className="album-tracks">
              <h3 className="section-title">TRACKS</h3>
              <div className="tracks-container">
                {hasItems(album.tracks) ? (
                  <>
                    {/* Si showAllTracks es true, mostrar todos los tracks, si no, solo los primeros 4 */}
                    {(showAllTracks
                      ? album.tracks
                      : album.tracks.slice(0, 4)
                    ).map((track, index) => (
                      <div
                        key={index}
                        className={`track-item ${
                          track === favoriteTrack ? "favorite-track" : ""
                        }`}
                        title={
                          track === favoriteTrack
                            ? `${track} (Track favorito)`
                            : track
                        }
                      >
                        {track}
                      </div>
                    ))}
                    {/* Botón "More..." cuando hay más de 4 tracks y no se están mostrando todos */}
                    {album.tracks.length > 4 && !showAllTracks && (
                      <div
                        className="tracks-more"
                        onClick={() => setShowAllTracks(true)}
                      >
                        Mas
                      </div>
                    )}
                    {/* Botón "Less" cuando se están mostrando todos los tracks y hay más de 4 */}
                    {album.tracks.length > 4 && showAllTracks && (
                      <div
                        className="tracks-more"
                        onClick={() => setShowAllTracks(false)}
                      >
                        Menos
                      </div>
                    )}
                  </>
                ) : (
                  <div className="track-item">No hay tracks disponibles</div>
                )}
              </div>
            </div>
          </div>

          {/* Columna central - Información principal, reseñas, etc. */}
          <div className="album-center">
            <div className="album-header">
              <div className="album-header-top">
                <div className="album-artist">
                  <img
                    src={
                      artist?.photo ||
                      "https://via.placeholder.com/40?text=Artist"
                    }
                    className="artist-avatar"
                    alt={album.artist || "Artista"}
                    onClick={() =>
                      artist?._id && navigate(`/artist/${artist._id}`)
                    }
                  />
                  <span>
                    {artist?.name || album.artist || "Artista desconocido"}
                  </span>
                </div>

                <div className="album-stats-box">
                  <span className="album-duration">{album.duration} mins</span>
                  <span className="album-track-count">
                    {hasItems(album.tracks) ? album.tracks.length : 0} TRACKS
                  </span>
                </div>
              </div>

              <div className="album-title-section">
                <h1
                  className="album-title-large"
                  title={album.name || "Álbum sin título"}
                >
                  {album.name || "Álbum sin título"}
                </h1>
                <div className="album-year">
                  <p>
                    {album.released
                      ? formatReleaseDate(album.released)
                      : "Desconocido"}
                  </p>
                </div>
              </div>

              <div className="album-description">
                <p>
                  {stripHtml(
                    truncateDescription(
                      album.description || "Sin descripción por ahora"
                    )
                  )}
                  {/* Botones "More..." y "Less..." para la descripción */}
                  {album.description && album.description.length > 300 && (
                    <>
                      {!showFullDescription ? (
                        <span
                          className="description-more"
                          onClick={() => setShowFullDescription(true)}
                        >
                          Mas
                        </span>
                      ) : (
                        <span
                          className="description-more"
                          onClick={() => setShowFullDescription(false)}
                        >
                          Menos
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            {hasItems(album.producers) && (
              <div className="album-producers">
                <h3>Producers</h3>
                <div className="producers-list">
                  {album.producers.map((producer, index) => (
                    <span
                      key={index}
                      className="producer-tag"
                      onClick={() => navigateToProducer(producer)}
                    >
                      {producer}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasItems(friendReviews) && (
              <div className="album-section">
                <div className="section-header">
                  <h3>Reviews de amigos</h3>
                  <span
                    className="view-all"
                    onClick={() => navigate(`/album/${id}/reviews/friends`)}
                  >
                    ›
                  </span>
                </div>
                <hr className="section-divider" />
                <div className="reviews-container">
                  {friendReviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div
                        className="review-user"
                        onClick={() =>
                          review.userId && navigate(`/user/${review.userId}`)
                        }
                      >
                        <img
                          src={
                            review.userPhoto ||
                            "https://via.placeholder.com/40?text=User"
                          }
                          alt={review.username || "Usuario"}
                        />
                      </div>
                      <div className="review-content">
                        <div className="review-header">
                          <span className="review-username">
                            {review.username || "Usuario"}
                          </span>
                          <div className="review-rating">
                            {renderStars(review.rating || 0)}
                          </div>
                        </div>
                        <p className="review-text">
                          {review.text || "Sin comentario"}
                        </p>
                        <div className="review-actions">
                          <span className="review-likes">
                            ❤ {review.likes || 0} LIKES
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasItems(popularReviews) && (
              <div className="album-section">
                <div className="section-header">
                  <h3>Reviews populares</h3>
                  <span
                    className="view-all"
                    onClick={() => navigate(`/album/${id}/reviews`)}
                  >
                    ›
                  </span>
                </div>
                <hr className="section-divider" />
                <div className="reviews-container">
                  {popularReviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div
                        className="review-user"
                        onClick={() =>
                          review.userId && navigate(`/user/${review.userId}`)
                        }
                      >
                        <img
                          src={
                            review.userPhoto ||
                            "https://via.placeholder.com/40?text=User"
                          }
                          alt={review.username || "Usuario"}
                        />
                      </div>
                      <div className="review-content">
                        <div className="review-header">
                          <span className="review-username">
                            {review.username || "Usuario"}
                          </span>
                          <div className="review-rating">
                            {renderStars(review.rating || 0)}
                          </div>
                        </div>
                        <p className="review-text">
                          {review.text || "Sin comentario"}
                        </p>
                        <div className="review-actions">
                          <span className="review-likes">
                            ❤ {review.likes || 0} LIKES
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasItems(similarAlbums) && (
              <div className="album-section">
                <div className="section-header">
                  <h3>Albumes Similares</h3>
                  <span
                    className="view-all"
                    onClick={() => navigate(`/albums/similar/${id}`)}
                  >
                    ›
                  </span>
                </div>
                <hr className="section-divider" />
                <div className="similar-albums-container">
                  {similarAlbums.slice(0, 4).map((simAlbum, index) => (
                    <div
                      key={index}
                      className="similar-album-item"
                      onClick={() =>
                        simAlbum._id && navigate(`/album/${simAlbum._id}`)
                      }
                    >
                      <img
                        src={
                          simAlbum.cover ||
                          "https://via.placeholder.com/100?text=Álbum"
                        }
                        alt={simAlbum.name || "Álbum similar"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel de interacción (columna derecha) */}
          <div className="album-interaction-side">
            <div className="album-interaction-panel">
              <div className="interaction-row">
                <div
                  className={`interaction-option ${
                    albumViewed ? "active" : ""
                  }`}
                  onClick={handleViewedClick}
                >
                  <div className="interaction-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill={albumViewed ? "#4a90e2" : "#e3e3e3"}
                    >
                      {albumViewed ? (
                        <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                      ) : (
                        <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                      )}
                    </svg>
                  </div>
                  <span>Visto</span>
                </div>

                {/* Nuevo botón Like */}
                <div
                  className={`interaction-option ${albumLiked ? "active" : ""}`}
                  onClick={handleLikeClick}
                >
                  <div className="interaction-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 0 24 24"
                      width="24px"
                      fill={albumLiked ? "#ff4081" : "#e3e3e3"}
                    >
                      {albumLiked ? (
                        // Corazón lleno para álbum ya likeado
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      ) : (
                        // Corazón vacío para álbum no likeado
                        <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                      )}
                    </svg>
                  </div>
                  <span style={{ color: albumLiked ? "#ff4081" : "" }}>
                    Like
                  </span>
                </div>

                <div className="interaction-option">
                  <div className="interaction-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#e3e3e3"
                    >
                      <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
                    </svg>
                  </div>
                  <span>Listenlist</span>
                </div>
              </div>

              <div className="interaction-divider"></div>

              <div className="interaction-rate">
                <span>
                  Rate
                  {ratingError && (
                    <small className="rating-error"> {ratingError}</small>
                  )}
                </span>
                <div className="rate-icons">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`rate-icon ${
                        star <= userRating ? "rated" : ""
                      }`}
                      onClick={() => handleRateClick(star)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="36px"
                        viewBox="0 -960 960 960"
                        width="36px"
                        fill={star <= userRating ? "#ffd700" : "#e3e3e3"}
                      >
                        <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              <div className="interaction-divider"></div>

              <div
                className="interaction-button"
                onClick={() => setReviewDialogOpen(true)}
              >
                Hacer Review
              </div>

              <div className="interaction-divider"></div>

              <div className="interaction-button">Añadir a una lista</div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de reseña con el nuevo selector de track favorito */}
      {reviewDialogOpen && (
        <div
          className="review-dialog-overlay"
          onClick={() => setReviewDialogOpen(false)}
        >
          <div
            className="review-dialog-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="review-dialog-header">
              <h2>Escribe tu reseña</h2>
              <button
                className="close-dialog-btn"
                onClick={() => setReviewDialogOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="review-dialog-album-info">
              <img
                src={
                  album?.cover || "https://via.placeholder.com/60?text=Álbum"
                }
                alt={album?.name || "Álbum"}
                className="review-album-cover"
              />
              <div className="review-album-details">
                <h3>{album?.name}</h3>
                <p>{album?.artist}</p>
              </div>
            </div>

            <div className="review-rating-section">
              <p>Tu calificación:</p>
              <div className="review-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`rate-icon ${star <= userRating ? "rated" : ""}`}
                    onClick={() => handleRateClick(star)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="36px"
                      viewBox="0 -960 960 960"
                      width="36px"
                      fill={star <= userRating ? "#ffd700" : "#e3e3e3"}
                    >
                      <path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Nueva sección para el track favorito */}
            <div className="favorite-track-section">
              <p>Track favorito</p>
              <select
                className="favorite-track-select"
                value={favoriteTrack}
                onChange={(e) => setFavoriteTrack(e.target.value)}
              >
                <option value="">Selecciona tu track favorito</option>
                {hasItems(album.tracks) &&
                  album.tracks.map((track, index) => (
                    <option key={index} value={track}>
                      {track}
                    </option>
                  ))}
              </select>
            </div>

            <div className="review-text-section">
              <textarea
                placeholder="Escribe tu reseña aquí..."
                onChange={(e) => setReviewText(e.target.value)}
                rows={6}
                className="review-textarea"
              />
            </div>

            <div className="review-dialog-actions">
              <button
                className="cancel-btn"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="submit-btn"
                onClick={handleSubmitReview}
                disabled={ratingSaving}
              >
                {ratingSaving ? "Enviando..." : "Publicar reseña"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Album;
