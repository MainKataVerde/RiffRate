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

  // Función para extraer el enlace de Last.fm de la descripción
  const extractLastFmLink = (description: string): string | null => {
    const match = description.match(
      /<a\s+href="(https:\/\/www\.last\.fm\/music\/[^"]+)"[^>]*>([^<]+)<\/a>/i
    );
    return match ? match[1] : null;
  };

  // Añadir esta función después de las otras funciones de navegación
  const navigateToProducer = (producerName: string) => {
    // Navega a la búsqueda del productor
    navigate(`/search?q=${encodeURIComponent(producerName)}&type=artist`);
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

          // Intentar cargar reseñas de amigos si hay un usuario logueado
          if (loggedUserId) {
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
      return "Año desconocido";
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
                      <div key={index} className="track-item" title={track}>
                        {track}
                      </div>
                    ))}
                    {/* Botón "More..." cuando hay más de 4 tracks y no se están mostrando todos */}
                    {album.tracks.length > 4 && !showAllTracks && (
                      <div
                        className="tracks-more"
                        onClick={() => setShowAllTracks(true)}
                      >
                        More...
                      </div>
                    )}
                    {/* Botón "Less" cuando se están mostrando todos los tracks y hay más de 4 */}
                    {album.tracks.length > 4 && showAllTracks && (
                      <div
                        className="tracks-more"
                        onClick={() => setShowAllTracks(false)}
                      >
                        Less...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="track-item">No hay tracks disponibles</div>
                )}
              </div>
            </div>
          </div>

          <div className="album-right">
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
                          More...
                        </span>
                      ) : (
                        <span
                          className="description-more"
                          onClick={() => setShowFullDescription(false)}
                        >
                          Less...
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
            {/* Estrellas <div className="album-rating">
              {renderStars(Math.round(album.averageRating || 0))}
            </div>*/}

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
        </div>
      </div>
    </div>
  );
};

export default Album;
