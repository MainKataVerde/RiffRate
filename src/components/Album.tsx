/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, JSX, useCallback, useMemo } from "react";
import Header from "./Header";
import { useParams, useNavigate } from "react-router-dom";
import "./css/album.css";
import axios from "axios";
import React from "react";

interface Review {
  userId: string;
  username: string;
  userPhoto: string;
  text: string;
  rating: number;
  likes: number;
  date: string;
  viewed: boolean;
  favoriteTrack?: string;
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
  links: { url: string }[] | string[];
  reviews: Review[];
  popularity: number;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

// Componente memoizado para una Review
// Componente memoizado para una Review
const ReviewItem = React.memo(
  ({
    review,
    navigate,
    renderStars,
  }: {
    review: Review;
    navigate: any;
    renderStars: (rating: number) => JSX.Element[];
  }) => {
    const [reviewLiked, setReviewLiked] = React.useState(false);

    return (
      <div className="review-item-card">
        <div className="review-profile-section">
          <img
            src={review.userPhoto || "https://via.placeholder.com/40?text=User"}
            alt={review.username || "Usuario"}
            className="review-avatar"
            onClick={() => review.userId && navigate(`/user/${review.userId}`)}
          />
          <div className="review-user-content">
            <div className="review-header">
              <h3 className="review-username">
                {review.username || "Amigo X"}
              </h3>
              <div className="review-rating-notes">
                {renderStars(review.rating || 0)}
              </div>
            </div>
            <p className="review-text">
              {review.text ||
                "Lorem ipsum dolor sit amet consectetur adipiscing elit scelerisque, praesent euismod ac eu vivamus aliquet ante conubia, blandit vitae tempus mus rutrum dui porttitor."}
            </p>
            <div
              className="review-likes-footer"
              onClick={() => setReviewLiked(!reviewLiked)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={reviewLiked ? "#ff4081" : "#ffffff"}
                className="like-heart-icon"
              >
                <path
                  d={
                    reviewLiked
                      ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      : "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
                  }
                />
              </svg>
              <span className="likes-count">{review.likes || 0} LIKES</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Componente memoizado para un usuario de ListenList
const UserListenListItem = React.memo(
  ({ user, navigate }: { user: any; navigate: any }) => {
    return (
      <div
        className="user-item"
        onClick={() => user._id && navigate(`/user/${user._id}`)}
      >
        <img
          src={user.photo || "https://via.placeholder.com/40?text=User"}
          alt={user.username || "Usuario"}
          className="user-avatar"
        />
        <div className="user-name">{user.nombre || user.name || "Usuario"}</div>
      </div>
    );
  }
);

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
  const [favoriteTrack, setFavoriteTrack] = useState<string>("");
  const [inListenList, setInListenList] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"producers" | "label" | "genre">(
    "producers"
  );
  const [selectedProducer, setSelectedProducer] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const [listenListUsers, setListenListUsers] = useState<any[]>([]);

  // Estados para el diálogo de reseña
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");

  // Función para navegar al productor - memoizada con useCallback
  const navigateToProducer = useCallback(
    (producerName: string) => {
      navigate(`/search?q=${encodeURIComponent(producerName)}&type=artist`);
    },
    [navigate]
  );

  // Función para manejar el clic en las calificaciones - memoizada con useCallback
  const handleRateClick = useCallback(
    async (rating: number) => {
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
          date: new Date().toISOString(),
          text: "",
        };

        // Enviar la calificación al servidor
        const response = await axios.post(
          "http://localhost:4000/reviews/create",
          reviewData
        );

        if (response.data.success) {
          console.log("Calificación guardada con éxito");

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
    },
    [loggedUserId, id, navigate]
  );

  // Fetch listenList usuarios optimizado con useCallback
  const fetchListenListUsers = useCallback(async () => {
    if (!album?._id || !loggedUserId) return;

    try {
      const res = await axios.get(
        `http://localhost:4000/album/${album._id}/listenListFriends/${loggedUserId}`
      );
      if (res.data.success) {
        setListenListUsers(res.data.users || []);
      }
    } catch (err) {
      console.error("Error al cargar amigos con el álbum en ListenList:", err);

      // Fallback a la ruta antigua si la nueva falla
      try {
        const fallbackRes = await axios.get(
          `http://localhost:4000/album/${album._id}/listenListUsers`
        );
        if (fallbackRes.data.success) {
          setListenListUsers(fallbackRes.data.users || []);
        }
      } catch (fallbackErr) {
        console.error("También falló el endpoint de fallback:", fallbackErr);
      }
    }
  }, [album?._id, loggedUserId]);

  // Optimización: useEffect para cargar ListenList usuarios
  useEffect(() => {
    if (album && album._id) {
      fetchListenListUsers();
    }
  }, [album, fetchListenListUsers]);

  // Optimización: cacheo de usuarios para evitar llamadas duplicadas
  const fetchReviewsWithUserData = useCallback(async (reviews: Review[]) => {
    const userCache: Record<string, any> = {};

    return await Promise.all(
      reviews.map(async (review) => {
        try {
          if (!userCache[review.userId]) {
            const userData = await axios.get(
              `http://localhost:4000/user/${review.userId}`
            );
            userCache[review.userId] = userData.data;
          }

          return {
            ...review,
            username:
              userCache[review.userId].nombre ||
              userCache[review.userId].username ||
              "Usuario",
            userPhoto: userCache[review.userId].photo || undefined,
          };
        } catch (err) {
          console.error(
            `Error al cargar datos de usuario ${review.userId}:`,
            err
          );
          return review;
        }
      })
    );
  }, []);

  // IMPORTANTE: Mover estas funciones antes de handleSubmitReview para evitar el error de referencia

  // Fetch de reviews populares - memoizada
  const fetchAlbumReviewsWithText = useCallback(async () => {
    if (!album?._id) return;

    try {
      const res = await axios.get(
        `http://localhost:4000/album/${album._id}/reviewsWithText`
      );

      if (res.data.success) {
        const reviewsWithData = await fetchReviewsWithUserData(
          res.data.reviews || []
        );
        setPopularReviews(reviewsWithData);
      }
    } catch (err) {
      console.error("Error al cargar reseñas públicas con texto:", err);
    }
  }, [album?._id, fetchReviewsWithUserData]);

  // Fetch de reviews de amigos - memoizada
  const fetchFriendReviewsWithText = useCallback(async () => {
    if (!album?._id || !loggedUserId) return;

    try {
      const res = await axios.get(
        `http://localhost:4000/album/${album._id}/friendsReviewsWithText/${loggedUserId}`
      );

      if (res.data.success) {
        const reviewsWithData = await fetchReviewsWithUserData(
          res.data.reviews || []
        );
        setFriendReviews(reviewsWithData);
      }
    } catch (err) {
      console.error("Error al cargar reseñas de amigos con texto:", err);
    }
  }, [album?._id, loggedUserId, fetchReviewsWithUserData]);

  // Función para manejar el envío de la reseña - memoizada
  const handleSubmitReview = useCallback(async () => {
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
        favoriteTracks: favoriteTrack || undefined,
      };

      const response = await axios.post(
        "http://localhost:4000/reviews/create",
        reviewData
      );

      if (response.data.success) {
        // Si el álbum estaba en ListenList, quitarlo automáticamente
        if (inListenList) {
          try {
            await axios.post("http://localhost:4000/listenlist/remove", {
              userId: loggedUserId,
              albumId: id,
            });
            setInListenList(false);
          } catch (error) {
            console.error("Error al quitar de ListenList:", error);
          }
        }

        // Cerrar diálogo y limpiar texto
        setReviewDialogOpen(false);
        setReviewText("");
        setFavoriteTrack("");

        // Actualizar las reseñas populares
        fetchAlbumReviewsWithText();
      } else {
        alert("Error al publicar la reseña");
      }
    } catch (error) {
      console.error("Error al enviar la reseña:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setRatingSaving(false);
    }
  }, [
    loggedUserId,
    id,
    reviewText,
    userRating,
    favoriteTrack,
    inListenList,
    navigate,
    fetchAlbumReviewsWithText,
  ]);

  // Función para manejar el clic en el botón "Visto" - memoizada
  const handleViewedClick = useCallback(async () => {
    setAlbumViewed(!albumViewed);

    try {
      if (!loggedUserId) {
        navigate("/login", {
          state: {
            returnUrl: `/album/${id}`,
            message: "Inicia sesión para marcar álbumes como vistos",
          },
        });
        setAlbumViewed(albumViewed);
        return;
      }

      if (!albumViewed && inListenList) {
        try {
          await axios.post("http://localhost:4000/listenlist/remove", {
            userId: loggedUserId,
            albumId: id,
          });
          setInListenList(false);
        } catch (listenListErr) {
          console.error("Error al quitar de ListenList:", listenListErr);
        }
      }

      const reviewData = {
        userId: loggedUserId,
        albumId: id,
        viewed: !albumViewed,
        rating: userRating || undefined,
        date: new Date().toISOString(),
      };

      const response = await axios.post(
        "http://localhost:4000/reviews/create",
        reviewData
      );

      if (!response.data.success) {
        setAlbumViewed(albumViewed);
        console.error("Error al actualizar estado de visto");
      }
    } catch (error) {
      setAlbumViewed(albumViewed);
      console.error("Error al conectar con el servidor:", error);
    }
  }, [albumViewed, loggedUserId, id, inListenList, userRating, navigate]);

  // Función para manejar el like/unlike del álbum - memoizada
  const handleLikeClick = useCallback(async () => {
    setAlbumLiked(!albumLiked);

    try {
      if (!loggedUserId) {
        navigate("/login", {
          state: {
            returnUrl: `/album/${id}`,
            message: "Inicia sesión para dar like a álbumes",
          },
        });
        setAlbumLiked(albumLiked);
        return;
      }

      const likeData = {
        userId: loggedUserId,
        albumId: id,
      };

      const endpoint = albumLiked
        ? "http://localhost:4000/likes/remove"
        : "http://localhost:4000/likes/add";

      const response = await axios.post(endpoint, likeData);

      if (!response.data.success) {
        setAlbumLiked(albumLiked);
        console.error("Error al actualizar like:", response.data.message);
      }
    } catch (error) {
      setAlbumLiked(albumLiked);
      console.error("Error al conectar con el servidor:", error);
    }
  }, [albumLiked, loggedUserId, id, navigate]);

  // Función para manejar la adición/eliminación del ListenList - memoizada
  const handleListenListClick = useCallback(async () => {
    setInListenList(!inListenList);

    try {
      if (!loggedUserId) {
        navigate("/login", {
          state: {
            returnUrl: `/album/${id}`,
            message: "Inicia sesión para añadir álbumes a tu ListenList",
          },
        });
        setInListenList(inListenList);
        return;
      }

      const listenListData = {
        userId: loggedUserId,
        albumId: id,
      };

      const endpoint = inListenList
        ? "http://localhost:4000/listenlist/remove"
        : "http://localhost:4000/listenlist/add";

      const response = await axios.post(endpoint, listenListData);

      if (!response.data.success) {
        setInListenList(inListenList);
      }
    } catch (error) {
      setInListenList(inListenList);
      console.error("Error al conectar con el servidor:", error);
    }
  }, [inListenList, loggedUserId, id, navigate]);

  // Función para eliminar etiquetas HTML del texto
  const stripHtml = useCallback((html: string) => {
    return html.replace(/<[^>]*>?/gm, "");
  }, []);

  // Función para obtener los datos del artista - memoizada
  const fetchArtistData = useCallback(async (artistName: string) => {
    try {
      const res = await axios.get(
        `http://localhost:4000/artistName/${encodeURIComponent(artistName)}`
      );
      setArtist(res.data);
    } catch (err) {
      console.error("Error al cargar datos del artista:", err);
    }
  }, []);

  // Función para generar alturas de barras - optimizada para evitar re-renders
  const generateBarHeights = useCallback((averageRating: number = 0) => {
    try {
      const safeRating = isNaN(averageRating) ? 0 : averageRating;
      const heights: number[] = [];

      for (let i = 1; i <= 5; i++) {
        const distance = Math.abs(i - safeRating);
        const baseHeight = Math.max(5, 100 - distance * 40);
        // Eliminar aleatorización en cada render
        const height = Math.min(100, Math.max(5, baseHeight));
        heights.push(height);
      }
      return heights;
    } catch (error) {
      console.error("Error generando alturas de barras:", error);
      return [20, 40, 60, 40, 20];
    }
  }, []);

  // Cargar reviews cuando el álbum está listo
  useEffect(() => {
    if (album && album._id && loggedUserId) {
      fetchFriendReviewsWithText();
      fetchAlbumReviewsWithText();
    }
  }, [
    album,
    loggedUserId,
    fetchFriendReviewsWithText,
    fetchAlbumReviewsWithText,
  ]);

  // Fetch principal de datos del álbum - optimizado
  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("ID de álbum no encontrado");
          setLoading(false);
          return;
        }

        // Batch de peticiones principales cuando sea posible
        const [albumRes, userStateRes] = await Promise.all([
          axios.get(`http://localhost:4000/album/${id}`).catch((err) => {
            console.error(
              "Error detallado en petición de álbum:",
              err.response || err
            );
            throw new Error(`Error en petición de álbum: ${err.message}`);
          }),
          loggedUserId
            ? axios
                .get(
                  `http://localhost:4000/user/${loggedUserId}/album/${id}/state`
                )
                .catch(() => null)
            : Promise.resolve(null),
        ]);

        if (albumRes.data.success) {
          const albumData = albumRes.data.album;

          if (!albumData) {
            throw new Error("Datos de álbum vacíos o inválidos");
          }

          setAlbum(albumData);

          // Generar barHeights solo una vez
          if (typeof albumData.averageRating === "number") {
            setBarHeights(generateBarHeights(albumData.averageRating));
          } else {
            setBarHeights(generateBarHeights(0));
          }

          // Cargar datos del artista
          if (albumData && albumData.artist) {
            await fetchArtistData(albumData.artist);
          }

          // Si el usuario está logueado, verificar estados
          if (loggedUserId && id) {
            try {
              const hasReviewRes = await axios.get(
                `http://localhost:4000/user/${loggedUserId}/album/${id}/hasReview`
              );

              if (hasReviewRes.data.success && hasReviewRes.data.hasReviewed) {
                const userReviewRes = await axios.get(
                  `http://localhost:4000/user/${loggedUserId}/album/${id}/review`
                );

                if (userReviewRes.data.success) {
                  let reviewData = null;

                  if (
                    userReviewRes.data.reviews &&
                    userReviewRes.data.reviews.length > 0
                  ) {
                    reviewData = userReviewRes.data.reviews[0];
                  } else if (userReviewRes.data.review) {
                    reviewData = userReviewRes.data.review;
                  }

                  if (reviewData) {
                    setUserRating(reviewData.rating || 0);

                    if (reviewData.text) {
                      setReviewText(reviewData.text);
                    }

                    if (reviewData.favoriteTrack) {
                      setFavoriteTrack(reviewData.favoriteTrack);
                    } else if (reviewData.favoriteTracks) {
                      setFavoriteTrack(reviewData.favoriteTracks);
                    }

                    setAlbumViewed(
                      reviewData.viewed ||
                        reviewData.rating > 0 ||
                        Boolean(reviewData.text)
                    );
                  }
                }
              }

              // Batch de peticiones secundarias
              const [userLikeRes, listenListRes, similarRes] =
                await Promise.all([
                  axios.get(
                    `http://localhost:4000/user/${loggedUserId}/album/${id}/liked`
                  ),
                  axios.get(
                    `http://localhost:4000/user/${loggedUserId}/album/${id}/inListenList`
                  ),
                  axios.get(`http://localhost:4000/album/${id}/similar`),
                ]);

              if (userLikeRes.data.success) {
                setAlbumLiked(userLikeRes.data.isLiked);
              }

              if (listenListRes.data.success) {
                setInListenList(listenListRes.data.isInListenList);
              }

              if (similarRes.data.success) {
                setSimilarAlbums(similarRes.data.albums || []);
              }
            } catch (err) {
              console.error("Error al cargar datos de usuario:", err);
            }
          } else {
            // Si no hay usuario logueado, solo cargar álbumes similares
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
          }
        } else {
          setError(
            `No se pudo cargar el álbum: ${
              albumRes.data.message || "Error desconocido"
            }`
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        console.error("Error detallado al cargar el álbum:", err);
        setError(`Error al cargar el álbum: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [id, loggedUserId, fetchArtistData, generateBarHeights]);

  // Formatear la fecha de lanzamiento - memoizada
  const formatReleaseDate = useCallback((dateString: string) => {
    if (!dateString) return "Año desconocido";
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch (e) {
      return "Año desconocido" + e;
    }
  }, []);

  // Renderizar estrellas basado en calificación - memoizado para evitar cálculos redundantes
  const renderStars = useCallback((rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="star filled">
            ♪
          </span>
        );
      } else if (i - rating === 0.5) {
        stars.push(
          <span key={i} className="star half-filled">
            ♪
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star">
            ♪
          </span>
        );
      }
    }
    return stars;
  }, []);

  // Determinar si el array existe y tiene elementos - memoizada
  const hasItems = useCallback((arr: any[] | undefined | null) => {
    return Array.isArray(arr) && arr.length > 0;
  }, []);

  // Renderizar estrellas para calificación media - memoizado
  const renderAverageStars = useCallback((rating: number): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 > 0.3;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="avg-star filled">
          ♪
        </span>
      );
    }

    if (halfStar && stars.length < 5) {
      stars.push(
        <span key="half" className="avg-star half-filled">
          ♪
        </span>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="avg-star">
          ♪
        </span>
      );
    }

    return stars;
  }, []);

  // Truncar descripción si es muy larga - memoizado
  const truncateDescription = useCallback(
    (text: string, maxLength: number = 300) => {
      if (!text) return "";
      if (showFullDescription || text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    },
    [showFullDescription]
  );

  // Memoizar las estrellas promedio
  const averageStarsRendered = useMemo(
    () => renderAverageStars(album?.averageRating || 0),
    [album?.averageRating, renderAverageStars]
  );

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
                    const url = typeof link === "string" ? link : link?.url;

                    if (!url || typeof url !== "string" || url.trim() === "") {
                      return null;
                    }

                    let iconSrc = "/default-music-icon.png";
                    let platformName = "Música";

                    try {
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
                        key={`stream-${index}`}
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
                    {(showAllTracks
                      ? album.tracks
                      : album.tracks.slice(0, 4)
                    ).map((track, index) => (
                      <div
                        key={`track-${index}`}
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
                    {album.tracks.length > 4 && !showAllTracks && (
                      <div
                        className="tracks-more"
                        onClick={() => setShowAllTracks(true)}
                      >
                        Mas
                      </div>
                    )}
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
              <>
                <div className="album-info-tabs">
                  <div className="tab-header">
                    <button
                      className={`tab-button ${
                        activeTab === "producers" ? "active" : ""
                      }`}
                      onClick={() => {
                        setActiveTab("producers");
                        setSelectedLabel(null);
                        setSelectedGenre(null);
                      }}
                    >
                      Producers
                    </button>
                    <button
                      className={`tab-button ${
                        activeTab === "label" ? "active" : ""
                      }`}
                      onClick={() => {
                        setActiveTab("label");
                        setSelectedProducer(null);
                        setSelectedGenre(null);
                      }}
                    >
                      Label
                    </button>
                    <button
                      className={`tab-button ${
                        activeTab === "genre" ? "active" : ""
                      }`}
                      onClick={() => {
                        setActiveTab("genre");
                        setSelectedProducer(null);
                        setSelectedLabel(null);
                      }}
                    >
                      Genero
                    </button>
                  </div>
                  {activeTab === "producers" && (
                    <div className="tab-content">
                      <div className="tags-list">
                        {album.producers.map((producer, index) => (
                          <span
                            key={`producer-${index}`}
                            className={`tag-item ${
                              selectedProducer === producer
                                ? "tag-selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedProducer(
                                producer === selectedProducer ? null : producer
                              )
                            }
                          >
                            {producer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === "label" && (
                    <div className="tab-content">
                      <div className="tags-list">
                        {[album.label || "Independent"].map((label, index) => (
                          <span
                            key={`label-${index}`}
                            className={`tag-item ${
                              selectedLabel === label ? "tag-selected" : ""
                            }`}
                            onClick={() =>
                              setSelectedLabel(
                                label === selectedLabel ? null : label
                              )
                            }
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === "genre" && (
                    <div className="tab-content">
                      <div className="tags-list">
                        {(album.genres || ["Sin género especificado"]).map(
                          (genre, index) => (
                            <span
                              key={`genre-${index}`}
                              className={`tag-item ${
                                selectedGenre === genre ? "tag-selected" : ""
                              }`}
                              onClick={() =>
                                setSelectedGenre(
                                  genre === selectedGenre ? null : genre
                                )
                              }
                            >
                              {genre}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {listenListUsers.length > 0 && (
              <div className="album-section">
                <div className="section-header">
                  <h2 className="section-headerh3">
                    Amigos que tambien quieren escucharlo
                  </h2>
                </div>
                <hr className="section-divider" />
                <div className="users-horizontal-container">
                  {listenListUsers.slice(0, 5).map((user, index) => (
                    <UserListenListItem
                      key={`user-${user._id || index}`}
                      user={user}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Sección Reviews de amigos */}
            {hasItems(friendReviews) && (
              <div className="album-section">
                <div className="section-header">
                  <h2 className="section-headerh3">Review de amigos</h2>
                </div>
                <hr className="section-divider" />
                <div className="reviews-container">
                  {friendReviews.slice(0, 3).map((review, index) => (
                    <ReviewItem
                      key={`friend-review-${review.userId || index}`}
                      review={review}
                      navigate={navigate}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Sección Reviews populares */}
            {hasItems(popularReviews) && (
              <div className="album-section">
                <div className="section-header">
                  <h2 className="section-headerh3">Review Populares</h2>
                </div>
                <hr className="section-divider" />
                <div className="reviews-container">
                  {popularReviews.slice(0, 3).map((review, index) => (
                    <ReviewItem
                      key={`popular-review-${review.userId || index}`}
                      review={review}
                      navigate={navigate}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Sección Álbumes Similares */}
            {hasItems(similarAlbums) && (
              <div className="album-section">
                <div className="section-header with-navigation">
                  <h2 className="section-headerh3">Álbumes Similares</h2>
                  <div
                    className="section-nav-icon"
                    onClick={() =>
                      navigate(
                        `/albums/popularity?genre=${encodeURIComponent(
                          album.genres[0] || ""
                        )}`
                      )
                    }
                  >
                    &gt;
                  </div>
                </div>
                <hr className="section-divider" />
                <div className="similar-albums-container">
                  {similarAlbums.slice(0, 4).map((similarAlbum) => (
                    <div
                      key={similarAlbum._id}
                      className="similar-album-card"
                      onClick={() => navigate(`/album/${similarAlbum._id}`)}
                    >
                      <img
                        src={
                          similarAlbum.cover ||
                          "https://via.placeholder.com/150?text=Álbum"
                        }
                        alt={similarAlbum.name}
                        className="similar-album-cover"
                      />
                      <div className="similar-album-info">
                        <p className="similar-album-name">
                          {similarAlbum.name}
                        </p>
                        <p className="similar-album-artist">
                          {similarAlbum.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel de interacción (columna derecha) */}
          <div className="album-interaction-side">
            <div className="album-interaction-panel">
              {loggedUserId ? (
                <>
                  {/* Opciones para usuarios logueados */}
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
                      <span style={{ color: albumViewed ? "#4a90e2" : "" }}>
                        Visto
                      </span>
                    </div>

                    {/* Botón Like */}
                    <div
                      className={`interaction-option ${
                        albumLiked ? "active" : ""
                      }`}
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
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          ) : (
                            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                          )}
                        </svg>
                      </div>
                      <span style={{ color: albumLiked ? "#ff4081" : "" }}>
                        Like
                      </span>
                    </div>

                    {/* Botón ListenList */}
                    <div
                      className={`interaction-option ${
                        inListenList ? "active" : ""
                      }`}
                      onClick={handleListenListClick}
                    >
                      <div className="interaction-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill={inListenList ? "#4a90e2" : "#e3e3e3"}
                        >
                          <path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" />
                        </svg>
                      </div>
                      <span style={{ color: inListenList ? "#4a90e2" : "" }}>
                        Listenlist
                      </span>
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
                          key={`rate-${star}`}
                          className={`rate-icon ${
                            star <= userRating ? "rated" : ""
                          }`}
                          onClick={(e) => {
                            const rect = (
                              e.target as HTMLElement
                            ).getBoundingClientRect();
                            const clickX =
                              (e as React.MouseEvent).clientX - rect.left;
                            const isHalf = clickX < rect.width / 2;
                            const value = isHalf ? star - 0.5 : star;
                            handleRateClick(value);
                          }}
                        >
                          <span
                            className={
                              star <= userRating
                                ? "music-note-icon filled"
                                : star - 0.5 === userRating
                                ? "music-note-icon half-filled"
                                : "music-note-icon"
                            }
                            style={{
                              color:
                                star <= userRating || star - 0.5 === userRating
                                  ? "#ffd700"
                                  : "#e3e3e3",
                              fontSize: "36px",
                            }}
                          >
                            ♪
                          </span>
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
                </>
              ) : (
                /* Botón de login único para usuarios no logueados */
                <div
                  className="login-panel-button"
                  onClick={() =>
                    navigate("/login", {
                      state: {
                        returnUrl: `/album/${id}`,
                        message:
                          "Inicia sesión para interactuar con este álbum",
                      },
                    })
                  }
                >
                  Iniciar sesión para interactuar
                </div>
              )}
            </div>

            <div className="album-rating-stats">
              <div className="rating-stats-header">
                <div className="rating-label">RATINGS</div>
                <div className="fans-count">{album.totalRatings || 0} FANS</div>
              </div>
              <div className="rating-stats-content">
                <div className="rating-histogram">
                  <div className="rating-bars">
                    {barHeights.map((height, index) => (
                      <div
                        key={`bar-${index}`}
                        className="rating-bar"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="average-rating">
                  <div className="rating-number">
                    {(album.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="rating-stars">{averageStarsRendered}</div>
                </div>
              </div>
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
                    key={`review-star-${star}`}
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

            {/* Sección para el track favorito */}
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
                    <option key={`track-option-${index}`} value={track}>
                      {track}
                    </option>
                  ))}
              </select>
            </div>

            <div className="review-text-section">
              <textarea
                placeholder="Escribe tu reseña aquí..."
                value={reviewText}
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
