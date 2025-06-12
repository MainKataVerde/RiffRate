import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./css/user.module.css";
import Header from "./Header";

// Interfaces
interface UserData {
  nombre: string; // Usando nombre en lugar de name
  email: string;
  photo: string;
  bio?: string;
  minutesListened?: number;
  createdAt?: string;
  friends?: string[]; // IDs de amigos
  favoriteAlbums?: string[]; // IDs de álbumes favoritos
  lists?: string[]; // IDs de listas
  likes?: string[]; // IDs de likes
  listenList?: string[]; // IDs de álbumes en lista de escucha
  reviews?: string[]; // IDs de reseñas
}

// Nuevo tipo para amigos con información detallada
interface FriendData {
  _id: string;
  nombre: string;
  photo: string;
  reviews?: string[];
  likes?: string[];
  listenList?: string[];
}

interface Album {
  _id: string;
  name: string;
  cover: string;
  artist: string;
  year?: number;
  genre?: string;
  rating?: number;
}

interface Review {
  _id: string;
  userId:
    | {
        _id: string;
        name?: string; // Opcional para manejar diferentes estructuras
        photo?: string;
      }
    | string; // Puede ser solo el ID como string
  albumId:
    | {
        _id: string;
        name?: string;
        artist?: string;
        cover?: string;
        released?: string;
      }
    | string; // Puede ser solo el ID como string
  rating: number;
  text: string;
  content?: string; // Campo añadido para compatibilidad
  createdAt: string;
  likes: string[];
  likesCount?: number; // Calculado
  favoriteTrack?: string;
}

interface Lista {
  _id: string;
  name: string;
  description?: string;
  albums: Album[];
  createdAt: string;
}

const User = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loggedUserId = localStorage.getItem("userId");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [popularReviews, setPopularReviews] = useState<Review[]>([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState<Album[]>([]);
  const [listenList, setListenList] = useState<Album[]>([]);
  const [recentLists, setRecentLists] = useState<Lista[]>([]);
  const [allUserAlbums, setAllUserAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  // Nuevo estado para amigos
  const [userFriends, setUserFriends] = useState<FriendData[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  // Estados para el botón de seguimiento
  const [isFollowing, setIsFollowing] = useState(false);
  const [showUnfollowOption, setShowUnfollowOption] = useState(false);

  useEffect(() => {
    // Reiniciar isOwnProfile cada vez que cambia el id
    setIsOwnProfile(loggedUserId === id);

    // También es buena práctica reiniciar otros estados cuando cambias de perfil
    setRecentReviews([]);
    setPopularReviews([]);
    setFavoriteAlbums([]);
    setListenList([]);
    setRecentLists([]);
    setActiveTab("perfil");
  }, [id, loggedUserId]);

  // Función para cargar álbumes por ID con mejor manejo de errores y depuración
  const fetchAlbumDetails = async (albumId: string) => {
    try {
      console.log(`Intentando cargar álbum con ID: ${albumId}`);
      const response = await axios.get(
        `http://localhost:4000/album/${albumId}`
      );

      // Depuración para ver exactamente qué devuelve la API
      console.log(`Respuesta para álbum ${albumId}:`, response.data);

      // Manejo de diferentes formatos de respuesta
      if (response.data.success && response.data.album) {
        // Formato {success: true, album: {...}}
        return response.data.album;
      } else if (response.data._id) {
        // El objeto álbum directamente
        return response.data;
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        // Si viene como array (puede pasar en algunos backends)
        return response.data[0];
      } else if (response.data.error || response.data.message) {
        // Error explícito en la respuesta
        console.error(
          `Error al cargar álbum ${albumId}:`,
          response.data.error || response.data.message
        );
        return null;
      } else {
        // Formato desconocido
        console.error(
          `Formato de respuesta desconocido para álbum ${albumId}:`,
          response.data
        );
        return null;
      }
    } catch (err) {
      console.error(`Error en la petición del álbum ${albumId}:`, err);
      return null;
    }
  };

  // Añade esta función junto con las otras utilidades
  const loadAlbumDetailsForReviews = async (reviews: Review[]) => {
    const reviewsToUpdate = reviews.filter(
      (review) => typeof review.albumId === "string" && review.albumId
    );

    if (reviewsToUpdate.length === 0) return reviews;

    console.log(
      `Cargando detalles para ${reviewsToUpdate.length} álbumes de reseñas`
    );

    const updatedReviews = [...reviews];

    for (const review of reviewsToUpdate) {
      if (typeof review.albumId === "string") {
        const albumDetails = await fetchAlbumDetails(review.albumId);
        if (albumDetails) {
          // Encuentra el índice de la reseña en el array original
          const index = updatedReviews.findIndex((r) => r._id === review._id);
          if (index !== -1) {
            // Actualiza la reseña con los detalles del álbum
            updatedReviews[index] = {
              ...updatedReviews[index],
              albumId: albumDetails,
            };
          }
        }
      }
    }

    return updatedReviews;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Obtener datos básicos del usuario
        const userResponse = await axios.get(
          `http://localhost:4000/user/${id}`
        );

        if (userResponse.data.mesnaje || userResponse.data.mensjae) {
          const errorMessage =
            userResponse.data.mesnaje || userResponse.data.mensjae;
          setError(errorMessage);
          setLoading(false);
          return;
        }

        setUser(userResponse.data);

        // Verificar si es el perfil del usuario logueado
        if (loggedUserId && id === loggedUserId) {
          setIsOwnProfile(loggedUserId === id);
        }

        // Verificar si el usuario logueado sigue al perfil que se está viendo
        if (loggedUserId && id && loggedUserId !== id) {
          try {
            const friendResponse = await axios.get(
              `http://localhost:4000/friends/check/${loggedUserId}/${id}`
            );
            setIsFollowing(friendResponse.data.isFriend);
          } catch (err) {
            console.error("Error al verificar relación de amistad:", err);
            setIsFollowing(
              userResponse.data.friends?.includes(loggedUserId) || false
            );
          }
        }

        // Cargar álbumes favoritos si hay IDs
        if (userResponse.data.favoriteAlbums?.length > 0) {
          try {
            // Crear un array para almacenar los álbumes cargados
            const loadedAlbums: Album[] = [];

            // Procesar los IDs secuencialmente para mejor depuración
            for (const albumId of userResponse.data.favoriteAlbums.slice(
              0,
              4
            )) {
              const album = await fetchAlbumDetails(albumId);
              if (album) {
                loadedAlbums.push(album);
              }
            }

            console.log(
              `Se cargaron ${loadedAlbums.length} de ${Math.min(
                4,
                userResponse.data.favoriteAlbums.length
              )} álbumes favoritos`
            );
            setFavoriteAlbums(loadedAlbums);
          } catch (err) {
            console.error("Error general al cargar álbumes favoritos:", err);
          }
        }

        // Cargar lista de escucha si hay IDs
        if (userResponse.data.listenList?.length > 0) {
          try {
            // Obtener datos de los álbumes en listenList
            const listenPromises = userResponse.data.listenList
              .slice(0, 4)
              .map((albumId: string) =>
                axios.get(`http://localhost:4000/album/${albumId}`)
              );

            const listenResponses = await Promise.all(listenPromises);

            // Extraer los datos del álbum de la estructura de respuesta
            const listenAlbums = listenResponses
              .map((res) => {
                // Si la respuesta tiene la estructura {success: true, album: {...}}
                if (res.data.success && res.data.album) {
                  return res.data.album;
                }
                // Si la respuesta es directamente el álbum
                else if (res.data._id) {
                  return res.data;
                }
                return null;
              })
              .filter((album) => album !== null);

            setListenList(listenAlbums);
          } catch (err) {
            console.error("Error al cargar lista de escucha:", err);
          }
        }

        // Actualiza la función de carga de reseñas en el primer useEffect
        try {
          setReviewsLoading(true);
          const reviewsResponse = await axios.get(
            `http://localhost:4000/user/${id}/reviews`
          );

          console.log("Respuesta de reseñas:", reviewsResponse.data); // Añadir para depuración

          if (reviewsResponse.data.success) {
            let allReviews = reviewsResponse.data.reviews || [];

            // Asegurarse de que cada reseña tenga la estructura correcta
            const processedReviews = allReviews.map((review: any) => {
              // Verificar si los datos anidados están presentes o necesitan transformación
              return {
                _id: review._id,
                rating: review.rating || 0,
                text: review.text || "", // Mantener el campo original text
                content: review.text || "", // Agregar el campo content para compatibilidad
                createdAt: review.createdAt || new Date().toISOString(),
                likes: review.likes || [],
                likesCount: review.likes?.length || 0,
                favoriteTrack: review.favoriteTracks || "",

                // Manejar userId de manera más robusta
                userId:
                  typeof review.userId === "object" && review.userId !== null
                    ? review.userId
                    : typeof review.userId === "string"
                    ? {
                        _id: review.userId,
                        name: review.userName || "Usuario",
                        photo: review.userPhoto || "/public/default-user.png",
                      }
                    : {
                        _id: "",
                        name: "Usuario",
                        photo: "/public/default-user.png",
                      },

                // Manejar albumId de manera más robusta
                albumId:
                  typeof review.albumId === "object" && review.albumId !== null
                    ? review.albumId
                    : review.album // Comprobar si existe un campo album separado (como en Welcome)
                    ? review.album
                    : typeof review.albumId === "string"
                    ? {
                        _id: review.albumId,
                        name: review.albumName || "Álbum desconocido",
                        artist: review.albumArtist || "Artista desconocido",
                        cover: review.albumCover || "/public/default-album.png",
                        released: review.albumReleased || "",
                      }
                    : {
                        _id: "",
                        name: "Álbum desconocido",
                        artist: "Artista desconocido",
                        cover: "/public/default-album.png",
                        released: "",
                      },
              };
            });

            allReviews = processedReviews;

            // Intentar cargar detalles de álbumes faltantes
            allReviews = await loadAlbumDetailsForReviews(allReviews);

            const reviewsWithText = allReviews.filter(
              (review: Review) => review.text && review.text.trim() !== ""
            );
            console.log(
              `Total de reseñas: ${allReviews.length}, Reseñas con texto: ${reviewsWithText.length}`
            );
            console.log("Primera reseña procesada:", allReviews[0]);
            console.log(
              "Primera reseña con texto:",
              reviewsWithText[0] || "Ninguna tiene texto"
            );

            const recent = [...reviewsWithText]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 2);
            setRecentReviews(recent);

            // Establecer actividad reciente (aún mostramos todas, incluso sin texto)
            setRecentActivity(
              allReviews
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 4)
            );

            // Reseñas populares (ordenadas por likes)
            const popular = [...reviewsWithText]
              .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
              .slice(0, 2);
            setPopularReviews(popular);
          }
        } catch (err) {
          console.error("Error al cargar reseñas:", err);
        } finally {
          setReviewsLoading(false);
        }

        // Cargar listas creadas del usuario
        if (userResponse.data.lists?.length > 0) {
          try {
            const listPromises = userResponse.data.lists
              .slice(0, 2)
              .map((listId: string) =>
                axios.get(`http://localhost:4000/list/${listId}`)
              );
            const listResponses = await Promise.all(listPromises);
            const userLists = listResponses
              .map((res) => {
                // Si la respuesta tiene estructura {success: true, list: {...}}
                if (res.data.success && res.data.list) {
                  return res.data.list;
                }
                // Si la respuesta es directamente la lista
                else if (res.data._id) {
                  return res.data;
                }
                return null;
              })
              .filter((list) => list !== null);

            setRecentLists(userLists);
          } catch (err) {
            console.error("Error al cargar listas:", err);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);
        setError("No se pudo cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id, loggedUserId]);

  const navigateToFriendProfile = (friendId: string) => {
    // Navegar a la URL del amigo
    navigate(`/user/${friendId}`);
    // Forzar recarga de la página (opcional, solo si sigues teniendo problemas)
    // window.location.href = `/user/${friendId}`;
  };

  // Cargar todos los álbumes cuando se activa la pestaña de álbumes
  // Cargar todos los álbumes cuando se activa la pestaña de álbumes
  useEffect(() => {
    const loadAllAlbums = async () => {
      if (
        (activeTab === "albums" ||
          activeTab === "listenlist" ||
          activeTab === "likes") &&
        user
      ) {
        try {
          setAlbumsLoading(true);

          // Fusionar favoriteAlbums, listenList y likes
          const albumIds = [
            ...(user.favoriteAlbums || []),
            ...(user.listenList || []),
            ...(user.likes || []),
          ];

          // Eliminar duplicados
          const uniqueAlbumIds = [...new Set(albumIds)];

          if (uniqueAlbumIds.length === 0) {
            setAllUserAlbums([]);
            setAlbumsLoading(false);
            return;
          }

          const albumPromises = uniqueAlbumIds.map((albumId) =>
            axios.get(`http://localhost:4000/album/${albumId}`)
          );

          const responses = await Promise.all(albumPromises);

          const albums = responses
            .map((res) => {
              if (res.data.success && res.data.album) {
                return res.data.album;
              } else if (res.data._id) {
                return res.data;
              }
              return null;
            })
            .filter((album) => album !== null);

          setAllUserAlbums(albums);
        } catch (err) {
          console.error("Error al cargar todos los álbumes:", err);
        } finally {
          setAlbumsLoading(false);
        }
      }
    };

    loadAllAlbums();
  }, [activeTab, user]);

  // Nuevo efecto para cargar amigos cuando se selecciona la pestaña de amigos
  useEffect(() => {
    const loadFriends = async () => {
      if (activeTab === "amigos" && user && user.friends?.length) {
        try {
          setFriendsLoading(true);

          // Usar el endpoint de amigos proporcionado
          const response = await axios.get(
            `http://localhost:4000/user/${id}/friends`
          );

          if (response.data.success) {
            setUserFriends(response.data.friends || []);
          } else {
            // Si no existe un endpoint específico, cargamos cada amigo individualmente
            const friendPromises = user.friends.map((friendId) =>
              axios.get(`http://localhost:4000/user/${friendId}`)
            );

            const friendResponses = await Promise.all(friendPromises);
            const friendsData = friendResponses
              .map((res) => {
                // Si tiene el formato esperado de respuesta
                if (res.data && !res.data.mesnaje && !res.data.mensjae) {
                  return res.data;
                }
                return null;
              })
              .filter((friend) => friend !== null);

            setUserFriends(friendsData);
          }
        } catch (err) {
          console.error("Error al cargar amigos:", err);
        } finally {
          setFriendsLoading(false);
        }
      }
    };

    loadFriends();
  }, [activeTab, user, id]);

  // Método actualizado para seguir a un usuario
  const handleFollowUser = async () => {
    if (!loggedUserId) {
      navigate("/login");
      return;
    }

    try {
      // Usar el endpoint correcto según la API
      const response = await axios.post(`http://localhost:4000/friends/add`, {
        userId: loggedUserId,
        friendId: id,
      });

      if (response.data) {
        // Actualizar la UI después de seguir
        const updatedUser = { ...user } as UserData;
        if (!updatedUser.friends) updatedUser.friends = [];

        // Solo añadir si no está ya
        if (!updatedUser.friends.includes(loggedUserId)) {
          updatedUser.friends.push(loggedUserId);
        }

        setUser(updatedUser);
        // Actualizar estado de seguimiento
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error al seguir usuario:", err);
    }
  };

  // Método actualizado para dejar de seguir a un usuario
  const handleUnfollowUser = async () => {
    try {
      // Usar el endpoint según la API
      const response = await axios.post(
        `http://localhost:4000/user/${loggedUserId}/unfollow`,
        { unfollowId: id }
      );

      if (response.data.success) {
        // Actualizar la UI después de dejar de seguir
        const updatedUser = { ...user } as UserData;
        if (updatedUser.friends) {
          updatedUser.friends = updatedUser.friends.filter(
            (f) => f !== loggedUserId
          );
          setUser(updatedUser);
        }
        setIsFollowing(false);
        setShowUnfollowOption(false);
      }
    } catch (err) {
      console.error("Error al dejar de seguir usuario:", err);
    }
  };

  // Renderizar estrellas para una calificación
  const renderStars = (rating: number) => {
    return "♪".repeat(rating);
  };

  // Función para filtrar álbumes por tipo
  const filterAlbums = (type: "favoritos" | "listenList" | "likes") => {
    if (!allUserAlbums.length) return [];

    if (type === "favoritos") {
      return allUserAlbums.filter((album) =>
        user?.favoriteAlbums?.includes(album._id)
      );
    } else if (type === "likes") {
      return allUserAlbums.filter((album) => user?.likes?.includes(album._id));
    } else {
      return allUserAlbums.filter((album) =>
        user?.listenList?.includes(album._id)
      );
    }
  };

  // Función para dar formato a la fecha
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  // Renderiza notas musicales para el rating
  const renderMusicNotes = (rating: number) => {
    const notes = [];
    for (let i = 0; i < 5; i++) {
      notes.push(
        <span
          key={`note-${i}`}
          className={
            i < rating
              ? styles["music-note"] + " " + styles["filled"]
              : styles["music-note"]
          }
        >
          ♪
        </span>
      );
    }
    return notes;
  };

  // Navegar a la vista detallada de reseñas
  const navigateToAllReviews = () => {
    // Aquí implementarías la navegación a una página que muestre todas las reseñas
    navigate(`/user/${id}/reviews`);
  };

  if (loading) {
    return (
      <div className={styles["user-page"]}>
        <div className={styles["loading-container"]}>
          <div className={styles["loading-spinner"]}></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles["user-page"]}>
        <div className={styles["error-container"]}>
          <h2>Error</h2>
          <p>{error || "No se encontró el usuario"}</p>
          <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["user-page"]}>
      <div className={styles["user-profile"]}>
        {/* Cabecera del perfil con nuevo diseño */}
        <div className={styles["profile-header"]}>
          <div className={styles["profile-photo-container"]}>
            <img
              src={user.photo || "/public/default-user.png"}
              alt={user.nombre}
              className={styles["profile-photo"]}
            />
          </div>

          <div className={styles["profile-info"]}>
            <h1>{user.nombre}</h1>
            <p className={styles["user-bio"]}>{user.bio || "Sin biografía"}</p>

            {isOwnProfile && (
              <button
                className={styles["edit-profile-button"]}
                onClick={() => navigate("/edit-profile")}
              >
                Editar
              </button>
            )}

            {!isOwnProfile && (
              <div className={styles["follow-button-container"]}>
                {!loggedUserId ? (
                  <button
                    className={styles["login-to-follow-button"]}
                    onClick={() => navigate("/login")}
                  >
                    Inicia sesión para seguir
                  </button>
                ) : isFollowing ? (
                  <button
                    className={
                      showUnfollowOption
                        ? styles["unfollow-button"]
                        : styles["following-button"]
                    }
                    onClick={() => {
                      if (showUnfollowOption) {
                        handleUnfollowUser();
                      } else {
                        setShowUnfollowOption(true);
                      }
                    }}
                    onMouseEnter={() => setShowUnfollowOption(true)}
                    onMouseLeave={() => setShowUnfollowOption(false)}
                  >
                    {showUnfollowOption ? "Dejar de seguir" : "Siguiendo"}
                  </button>
                ) : (
                  <button
                    className={styles["follow-button"]}
                    onClick={handleFollowUser}
                  >
                    Seguir
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Estadísticas a la derecha */}
          <div className={styles["user-stats-container"]}>
            <div className={styles["user-stat-item"]}>
              <span className={styles["stat-number"]}>
                {user.reviews?.length || 0}
              </span>
              <span className={styles["stat-label"]}>Álbumes</span>
            </div>
            <div className={styles["user-stat-item"]}>
              <span className={styles["stat-number"]}>
                {recentLists?.length || 0}
              </span>
              <span className={styles["stat-label"]}>Listas</span>
            </div>
            <div className={styles["user-stat-item"]}>
              <span className={styles["stat-number"]}>
                {user.friends?.length || 0}
              </span>
              <span className={styles["stat-label"]}>Seguidores</span>
            </div>
            <div className={styles["user-stat-item"]}>
              <span className={styles["stat-number"]}>
                {Math.floor((user.minutesListened || 0) / 60)}
              </span>
              <span className={styles["stat-label"]}>Horas</span>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className={styles["profile-tabs"]}>
          <button
            className={`${styles["tab-button"]} ${
              activeTab === "perfil" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("perfil")}
          >
            Perfil
          </button>
          <button
            className={`${styles["tab-button"]} ${
              activeTab === "albums" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("albums")}
          >
            Favoritos
          </button>
          <button
            className={`${styles["tab-button"]} ${
              activeTab === "listenlist" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("listenlist")}
          >
            ListenList
          </button>
          <button
            className={`${styles["tab-button"]} ${
              activeTab === "likes" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("likes")}
          >
            Likes
          </button>
          <button
            className={`${styles["tab-button"]} ${
              activeTab === "listas" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("listas")}
          >
            Listas
          </button>
          <button
            className={`${styles["tab-button"]} ${
              activeTab === "amigos" ? styles["active"] : ""
            }`}
            onClick={() => setActiveTab("amigos")}
          >
            Amigos
          </button>
        </div>

        {/* Contenido del perfil (pestaña principal) */}
        {activeTab === "perfil" && (
          <div className={styles["profile-main-content"]}>
            <div className={styles["top-sections"]}>
              {/* Sección izquierda: Álbumes Favoritos */}
              <div className={styles["left-section"]}>
                <div className={styles["section-container"]}>
                  <div className={styles["section-header"]}>
                    <h3>Álbumes favoritos</h3>
                    <span
                      className={styles["section-link"]}
                      onClick={() => setActiveTab("albums")}
                    >
                      Ver más
                    </span>
                  </div>
                  <div className={styles["albums-grid"]}>
                    {favoriteAlbums && favoriteAlbums.length > 0 ? (
                      favoriteAlbums.map((album, index) => (
                        <div
                          className={styles["album-card"]}
                          key={`fav-${index}`}
                        >
                          <img
                            src={album.cover || "/public/default-album.png"}
                            alt={album.name}
                            onClick={() => navigate(`/album/${album._id}`)}
                          />
                        </div>
                      ))
                    ) : (
                      <p className={styles["empty-message"]}>
                        No hay álbumes favoritos
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles["section-container"]}>
                  <div className={styles["section-header"]}>
                    <h3>Actividad reciente</h3>
                    <span
                      className={styles["section-link"]}
                      onClick={navigateToAllReviews}
                    >
                      Ver más
                    </span>
                  </div>
                  <div className={styles["activity-grid"]}>
                    {recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((review, index) => (
                        <div
                          className={styles["activity-item"]}
                          key={`activity-${index}`}
                          onClick={() => navigate(`/review/${review._id}`)}
                        >
                          <img
                            src={
                              typeof review.albumId === "object"
                                ? review.albumId?.cover ||
                                  "/public/default-album.png"
                                : "/public/default-album.png"
                            }
                            alt={
                              typeof review.albumId === "object"
                                ? review.albumId?.name || "Álbum"
                                : "Álbum"
                            }
                            className={styles["activity-album-cover"]}
                          />
                          <div className={styles["activity-info"]}>
                            <span className={styles["activity-rating"]}>
                              {renderStars(review.rating)}
                            </span>
                            <span className={styles["activity-date"]}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles["empty-message"]}>
                        No hay actividad reciente
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección derecha: ListenList */}
              <div className={styles["right-section"]}>
                <div className={styles["section-container"]}>
                  <div className={styles["section-header"]}>
                    <h3>ListenList</h3>
                    <span
                      className={styles["section-link"]}
                      onClick={() => setActiveTab("listenlist")}
                    >
                      Ver más
                    </span>
                  </div>
                  <div className={styles["listen-list"]}>
                    {listenList && listenList.length > 0 ? (
                      <div className={styles["listen-list-grid"]}>
                        {listenList.map((album, index) => (
                          <div
                            className={styles["album-card"]}
                            key={`listen-${index}`}
                          >
                            <img
                              src={album.cover || "/public/default-album.png"}
                              alt={album.name}
                              onClick={() => navigate(`/album/${album._id}`)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles["empty-message"]}>
                        ListenList vacía
                      </p>
                    )}
                  </div>
                </div>

                <div className={styles["section-container"]}>
                  <div className={styles["section-header"]}>
                    <h3>Listas recientes</h3>
                    <span
                      className={styles["section-link"]}
                      onClick={() => setActiveTab("listas")}
                    >
                      Ver más
                    </span>
                  </div>
                  <div className={styles["recent-lists"]}>
                    {recentLists && recentLists.length > 0 ? (
                      recentLists.map((lista, index) => (
                        <div
                          className={styles["list-card"]}
                          key={`list-${index}`}
                          onClick={() => navigate(`/list/${lista._id}`)}
                        >
                          <h4>{lista.name}</h4>
                          <p>{lista.description || "Sin descripción"}</p>
                          <span>{lista.albums.length} álbumes</span>
                        </div>
                      ))
                    ) : (
                      <p className={styles["empty-message"]}>
                        No hay listas creadas
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Reviews */}
            <div className={styles["reviews-section"]}>
              <div className={styles["section-container"]}>
                <div className={styles["section-header"]}>
                  <h3>Reviews recientes</h3>
                  <span
                    className={styles["section-link"]}
                    onClick={navigateToAllReviews}
                  >
                    Ver más
                  </span>
                </div>
                <div className={styles["reviews-list"]}>
                  {reviewsLoading ? (
                    <div className={styles["loading-container"]}>
                      <div className={styles["loading-spinner"]}></div>
                      <p>Cargando reseñas...</p>
                    </div>
                  ) : recentReviews && recentReviews.length > 0 ? (
                    recentReviews.map((review, index) => (
                      <div
                        className={styles["rese-container"]}
                        key={`recent-${index}`}
                      >
                        {/* Sección superior: Foto álbum + Info usuario y álbum */}
                        <div className={styles["rese-top"]}>
                          {/* Lado izquierdo: Portada del álbum */}
                          <div className={styles["rese-top-left"]}>
                            <img
                              src={
                                typeof review.albumId === "object" &&
                                review.albumId?.cover
                                  ? review.albumId.cover
                                  : "/public/default-album.png"
                              }
                              alt={
                                typeof review.albumId === "object" &&
                                review.albumId?.name
                                  ? review.albumId.name
                                  : "Álbum"
                              }
                              className={styles["albumFoto"]}
                              onClick={() => {
                                const albumId =
                                  typeof review.albumId === "object"
                                    ? review.albumId?._id
                                    : typeof review.albumId === "string"
                                    ? review.albumId
                                    : null;
                                if (albumId) navigate(`/album/${albumId}`);
                              }}
                            />
                          </div>

                          {/* Lado derecho: Info usuario y álbum */}
                          <div className={styles["rese-top-right"]}>
                            {/* Parte superior derecha: Avatar + nombre usuario */}
                            <div className={styles["rese-top-right-top"]}>
                              <img
                                src={user.photo || "/public/default-user.png"}
                                alt={user.nombre}
                                className={styles["userPhoto"]}
                                onClick={() =>
                                  navigate(`/user/${user._id || id}`)
                                }
                              />
                              <h1 className={styles["userName"]}>
                                {user.nombre}
                              </h1>
                            </div>

                            {/* Parte inferior derecha: Título álbum + fecha */}
                            <div className={styles["rese-top-right-bottom"]}>
                              <h1 className={styles["tituloAlbum"]}>
                                {typeof review.albumId === "object" &&
                                review.albumId?.name
                                  ? review.albumId.name
                                  : "Álbum desconocido"}{" "}
                                <span className={styles["fechaAlbum"]}>
                                  {typeof review.albumId === "object" &&
                                  review.albumId?.released
                                    ? new Date(
                                        review.albumId.released
                                      ).getFullYear()
                                    : ""}
                                </span>
                              </h1>
                              <div className={styles["review-rating-row"]}>
                                {renderMusicNotes(review.rating)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sección inferior: Texto review + likes */}
                        <div className={styles["rese-bottom"]}>
                          {/* Parte superior: Texto de la reseña */}
                          <div className={styles["rese-bottom-top"]}>
                            <p className={styles["textoReseña"]}>
                              {review.text?.length > 200
                                ? `${review.text.substring(0, 200)}...`
                                : review.text || "Sin contenido"}
                            </p>
                          </div>

                          {/* Parte inferior: Botón de like */}
                          <div className={styles["rese-bottom-bottom"]}>
                            <div className={styles["review-footer"]}>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="#ffffff"
                                className={styles["like-heart-icon"]}
                              >
                                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                              </svg>
                              <span className={styles["likes-count"]}>
                                {review.likes?.length || 0} LIKES
                              </span>
                            </div>
                            <button
                              className={styles["review-details-btn"]}
                              onClick={() => navigate(`/review/${review._id}`)}
                            >
                              Ver más
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles["empty-message"]}>
                      No hay reseñas recientes con texto
                    </p>
                  )}
                </div>
              </div>

              <div className={styles["section-container"]}>
                <div className={styles["section-header"]}>
                  <h3>Reviews populares</h3>
                  <span
                    className={styles["section-link"]}
                    onClick={navigateToAllReviews}
                  >
                    Ver más
                  </span>
                </div>
                <div className={styles["reviews-list"]}>
                  {reviewsLoading ? (
                    <div className={styles["loading-container"]}>
                      <div className={styles["loading-spinner"]}></div>
                      <p>Cargando reseñas...</p>
                    </div>
                  ) : popularReviews && popularReviews.length > 0 ? (
                    popularReviews.map((review, index) => (
                      <div
                        className={styles["rese-container"]}
                        key={`popular-${index}`}
                      >
                        {/* Sección superior: Foto álbum + Info usuario y álbum */}
                        <div className={styles["rese-top"]}>
                          {/* Lado izquierdo: Portada del álbum */}
                          <div className={styles["rese-top-left"]}>
                            <img
                              src={
                                typeof review.albumId === "object" &&
                                review.albumId?.cover
                                  ? review.albumId.cover
                                  : "/public/default-album.png"
                              }
                              alt={
                                typeof review.albumId === "object" &&
                                review.albumId?.name
                                  ? review.albumId.name
                                  : "Álbum"
                              }
                              className={styles["albumFoto"]}
                              onClick={() => {
                                const albumId =
                                  typeof review.albumId === "object"
                                    ? review.albumId?._id
                                    : typeof review.albumId === "string"
                                    ? review.albumId
                                    : null;
                                if (albumId) navigate(`/album/${albumId}`);
                              }}
                            />
                          </div>

                          {/* Lado derecho: Info usuario y álbum */}
                          <div className={styles["rese-top-right"]}>
                            {/* Parte superior derecha: Avatar + nombre usuario */}
                            <div className={styles["rese-top-right-top"]}>
                              <img
                                src={user.photo || "/public/default-user.png"}
                                alt={user.nombre}
                                className={styles["userPhoto"]}
                                onClick={() =>
                                  navigate(`/user/${user._id || id}`)
                                }
                              />
                              <h1 className={styles["userName"]}>
                                {user.nombre}
                              </h1>
                            </div>

                            {/* Parte inferior derecha: Título álbum + fecha */}
                            <div className={styles["rese-top-right-bottom"]}>
                              <h1 className={styles["tituloAlbum"]}>
                                {typeof review.albumId === "object" &&
                                review.albumId?.name
                                  ? review.albumId.name
                                  : "Álbum desconocido"}{" "}
                                <span className={styles["fechaAlbum"]}>
                                  {typeof review.albumId === "object" &&
                                  review.albumId?.released
                                    ? new Date(
                                        review.albumId.released
                                      ).getFullYear()
                                    : ""}
                                </span>
                              </h1>
                              <div className={styles["review-rating-row"]}>
                                {renderMusicNotes(review.rating)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sección inferior: Texto review + likes */}
                        <div className={styles["rese-bottom"]}>
                          {/* Parte superior: Texto de la reseña */}
                          <div className={styles["rese-bottom-top"]}>
                            <p className={styles["textoReseña"]}>
                              {review.text?.length > 200
                                ? `${review.text.substring(0, 200)}...`
                                : review.text || "Sin contenido"}
                            </p>
                          </div>

                          {/* Parte inferior: Botón de like */}
                          <div className={styles["rese-bottom-bottom"]}>
                            <div className={styles["review-footer"]}>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="#ffffff"
                                className={styles["like-heart-icon"]}
                              >
                                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                              </svg>
                              <span className={styles["likes-count"]}>
                                {review.likes?.length || 0} LIKES
                              </span>
                            </div>
                            <button
                              className={styles["review-details-btn"]}
                              onClick={() => navigate(`/review/${review._id}`)}
                            >
                              Ver más
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles["empty-message"]}>
                      No hay reseñas populares con texto
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la pestaña Álbumes Favoritos */}
        {activeTab === "albums" && (
          <div className={styles["albums-page"]}>
            {activeTab === "albums" && (
              <div className={styles["albums-page"]}>
                {albumsLoading ? (
                  <div className={styles["loading-container"]}>
                    <div className={styles["loading-spinner"]}></div>
                    <p>Cargando álbumes favoritos...</p>
                  </div>
                ) : (
                  <>
                    <div className={styles["albums-section"]}>
                      <div className={styles["section-title"]}>
                        <h2>Álbumes favoritos</h2>
                      </div>
                      <div
                        className={`${styles["albums-grid"]} ${styles["large-grid"]}`}
                      >
                        {user.favoriteAlbums?.length ? (
                          filterAlbums("favoritos").map((album, index) => (
                            <div
                              className={styles["album-card-detailed"]}
                              key={`fav-full-${index}`}
                            >
                              <img
                                src={album.cover || "/public/default-album.png"}
                                alt={album.name}
                                onClick={() => navigate(`/album/${album._id}`)}
                              />
                              <div className={styles["album-info"]}>
                                <h3 className={styles["album-title"]}>
                                  {album.name}
                                </h3>
                                <p className={styles["album-artist"]}>
                                  {album.artist}
                                </p>
                                {album.year && (
                                  <p className={styles["fechaAlbum"]}>
                                    {album.year}
                                  </p>
                                )}
                                {album.rating && (
                                  <div className={styles["album-rating"]}>
                                    {renderStars(album.rating)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={styles["empty-message"]}>
                            No hay álbumes favoritos
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        {/* Contenido de la pestaña ListenList*/}
        {activeTab === "listenlist" && (
          <div className={styles["albums-page"]}>
            {albumsLoading ? (
              <div className={styles["loading-container"]}>
                <div className={styles["loading-spinner"]}></div>
                <p>Cargando lista de escucha...</p>
              </div>
            ) : (
              <>
                <div className={styles["albums-section"]}>
                  <div className={styles["section-title"]}>
                    <h2>Lista de escucha</h2>
                  </div>
                  <div
                    className={`${styles["albums-grid"]} ${styles["large-grid"]}`}
                  >
                    {user.listenList?.length ? (
                      filterAlbums("listenList").map((album, index) => (
                        <div
                          className={styles["album-card-detailed"]}
                          key={`listen-full-${index}`}
                        >
                          <img
                            src={album.cover || "/public/default-album.png"}
                            alt={album.name}
                            onClick={() => navigate(`/album/${album._id}`)}
                          />
                          <div className={styles["album-info"]}>
                            <h3 className={styles["album-title"]}>
                              {album.name}
                            </h3>
                            <p className={styles["album-artist"]}>
                              {album.artist}
                            </p>
                            {album.year && (
                              <p className={styles["fechaAlbum"]}>
                                {album.year}
                              </p>
                            )}
                            {album.rating && (
                              <div className={styles["album-rating"]}>
                                {renderStars(album.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles["empty-message"]}>
                        No hay álbumes en la lista de escucha
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Contenido de la pestaña Listas */}
        {activeTab === "listas" && (
          <div className={styles["lists-page"]}>
            {activeTab === "listas" && (
              <div className={styles["lists-page"]}>
                <div className={styles["section-title"]}>
                  <h2>
                    Listas creadas por {isOwnProfile ? "ti" : user.nombre}
                  </h2>
                </div>

                {recentLists && recentLists.length > 0 ? (
                  <div className={styles["lists-grid"]}>
                    {recentLists.map((lista, index) => (
                      <div
                        className={styles["list-card-detailed"]}
                        key={`list-detail-${index}`}
                        onClick={() => navigate(`/list/${lista._id}`)}
                      >
                        <h3 className={styles["list-title"]}>{lista.name}</h3>
                        <p className={styles["list-description"]}>
                          {lista.description || "Sin descripción"}
                        </p>
                        <div className={styles["list-meta"]}>
                          <span>{lista.albums.length} álbumes</span>
                          <span className={styles["list-date"]}>
                            {formatDate(lista.createdAt)}
                          </span>
                        </div>
                        {lista.albums.length > 0 && (
                          <div className={styles["list-album-preview"]}>
                            {lista.albums
                              .slice(0, 4)
                              .map((album, albumIndex) => (
                                <img
                                  key={`preview-${index}-${albumIndex}`}
                                  src={
                                    album.cover || "/public/default-album.png"
                                  }
                                  alt={album.name}
                                  className={styles["preview-album-cover"]}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles["empty-lists-container"]}>
                    <p className={styles["empty-message"]}>
                      {isOwnProfile
                        ? "Aún no has creado ninguna lista"
                        : `${user.nombre} aún no ha creado listas`}
                    </p>

                    {isOwnProfile && (
                      <button
                        className={styles["create-list-button"]}
                        onClick={() => navigate("/list/new")}
                      >
                        Crear nueva lista
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contenido de la pestaña Likes */}
        {activeTab === "likes" && (
          <div className={styles["albums-page"]}>
            {albumsLoading ? (
              <div className={styles["loading-container"]}>
                <div className={styles["loading-spinner"]}></div>
                <p>Cargando álbumes con like...</p>
              </div>
            ) : (
              <>
                <div className={styles["albums-section"]}>
                  <div className={styles["section-title"]}>
                    <h2>Álbumes con Like</h2>
                    <p className={styles["section-description"]}>
                      Álbumes a los que has dado like
                    </p>
                  </div>
                  <div
                    className={`${styles["albums-grid"]} ${styles["large-grid"]}`}
                  >
                    {user.likes?.length ? (
                      filterAlbums("likes").map((album, index) => (
                        <div
                          className={styles["album-card-detailed"]}
                          key={`like-${index}`}
                        >
                          <img
                            src={album.cover || "/public/default-album.png"}
                            alt={album.name}
                            onClick={() => navigate(`/album/${album._id}`)}
                          />
                          <div className={styles["album-info"]}>
                            <h3 className={styles["album-title"]}>
                              {album.name}
                            </h3>
                            <p className={styles["album-artist"]}>
                              {album.artist}
                            </p>
                            {album.year && (
                              <p className={styles["fechaAlbum"]}>
                                {album.year}
                              </p>
                            )}
                            {album.rating && (
                              <div className={styles["album-rating"]}>
                                {renderStars(album.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles["empty-message"]}>
                        No hay álbumes con like
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Pestaña de amigos */}
        {activeTab === "amigos" && (
          <div className={styles["friends-page"]}>
            {friendsLoading ? (
              <div className={styles["loading-container"]}>
                <div className={styles["loading-spinner"]}></div>
                <p>Cargando amigos...</p>
              </div>
            ) : (
              <>
                <div className={styles["section-title"]}>
                  <h2>Amigos de {user.nombre}</h2>
                </div>

                {userFriends.length > 0 ? (
                  <div className={styles["friends-grid"]}>
                    {userFriends.map((friend) => (
                      <div className={styles["friend-card"]} key={friend._id}>
                        <div
                          className={styles["friend-avatar"]}
                          onClick={() => navigate(`/user/${friend._id}`)}
                        >
                          <img
                            src={friend.photo || "/public/default-user.png"}
                            alt={friend.nombre}
                            className={styles["friend-photo"]}
                          />
                        </div>
                        <div className={styles["friend-info"]}>
                          <h3 className={styles["friend-name"]}>
                            {friend.nombre}
                          </h3>
                          <div className={styles["friend-stats"]}>
                            <span className={styles["friend-stat"]}>
                              <i className={styles["icon-reviews"]}></i>
                              {friend.reviews?.length || 0} reseñas
                            </span>
                            <span className={styles["friend-stat"]}>
                              <i className={styles["icon-listen"]}></i>
                              {friend.listenList?.length || 0} escuchados
                            </span>
                          </div>
                          <button
                            className={styles["view-profile-button"]}
                            onClick={() => navigateToFriendProfile(friend._id)}
                          >
                            Ver perfil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles["empty-friends"]}>
                    <p className={styles["empty-message"]}>
                      {isOwnProfile
                        ? "No tienes amigos aún. ¡Busca personas para seguir!"
                        : `${user.nombre} aún no tiene amigos.`}
                    </p>
                    {isOwnProfile && (
                      <button
                        className={styles["action-button"]}
                        onClick={() => navigate("/search/users")}
                      >
                        Buscar personas
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
