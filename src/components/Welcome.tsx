import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./template.css";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

interface Album {
  _id: string;
  name: string;
  artist: string;
  year?: number;
  popularity: number;
  cover: string;
  rating?: number;
  averageRating?: number;
}

const Welcome = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [friendsAlbums, setFriendsAlbums] = useState<Album[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<Album[]>([]);
  const [topRatedAlbums, setTopRatedAlbums] = useState<Album[]>([]);
  const [nombre, setNombre] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const loggedUserId = localStorage.getItem("userId");

  const navigate = useNavigate();

  // Función para normalizar los datos del álbum
  const normalizeAlbum = (album: Album): Album => {
    return {
      ...album,
      // Usar rating si existe, sino averageRating, sino 0
      rating: album.averageRating || 0,
      // Asegurar que year esté presente
      year: album.year,
    };
  };

  // Función para obtener la calificación de forma segura
  const getRating = (album: Album): number => {
    return album.rating || album.averageRating || 0;
  };

  // Función para renderizar estrellas
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push("★");
    }

    if (halfStar) {
      stars.push("½");
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push("☆");
    }

    return <div className="stars">{stars.join("")}</div>;
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        // Obtener datos del usuario si está logueado
        if (loggedUserId) {
          const userResponse = await axios.get(
            `http://localhost:4000/user/${loggedUserId}`
          );
          setNombre(userResponse.data.nombre);
        }

        // Obtener álbumes populares
        const popularResponse = await fetch("http://localhost:4000/popular");
        const popularData = await popularResponse.json();
        setAlbums(popularData.map(normalizeAlbum));

        // Obtener álbumes recientes
        const recentResponse = await fetch(
          "http://localhost:4000/albums?sortBy=recent&limit=10"
        );
        const recentData = await recentResponse.json();
        setRecentAlbums(recentData.map(normalizeAlbum));

        // Obtener álbumes mejor calificados
        const ratedResponse = await fetch(
          "http://localhost:4000/albums?sortBy=rating&limit=10"
        );
        const ratedData = await ratedResponse.json();
        setTopRatedAlbums(ratedData.map(normalizeAlbum));

        // Obtener álbumes populares entre amigos si hay usuario logueado
        if (loggedUserId) {
          const friendsResponse = await fetch(
            `http://localhost:4000/popular/friends/${loggedUserId}`
          );
          const friendsData = await friendsResponse.json();
          setFriendsAlbums(friendsData.map(normalizeAlbum));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loggedUserId]);

  return (
    <div className="container">
      <Header loggedUserId={loggedUserId} />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            {loggedUserId ? (
              <div className="welcome-message fade-in">
                <h1>
                  Bienvenido, <span className="accent-text">{nombre}</span>
                </h1>
                <p>¿Qué vas a descubrir hoy?</p>
              </div>
            ) : (
              <div className="welcome-message fade-in">
                <h1>Descubre, Califica y Comparte</h1>
                <p>Únete a la comunidad de amantes de la música</p>
                <div className="hero-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/login")}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate("/register")}
                  >
                    Registrarse
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando contenido...</p>
          </div>
        ) : (
          <>
            {/* Populares */}
            <section className="albums-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="section-title-icon">🔥</span>
                  <h2>Populares Ahora</h2>
                </div>
                <Link to="/albums/popularity" className="section-link">
                  Ver todos <span>→</span>
                </Link>
              </div>
              <hr className="section-divider" />
              <div className="albums-carousel">
                <div className="albums-carousel-inner">
                  {albums.map((album) => (
                    <div
                      key={album._id}
                      className="carousel-album-card"
                      onClick={() => navigate(`/album/${album._id}`)}
                    >
                      <div className="album-poster-container">
                        <img
                          src={album.cover || "https://via.placeholder.com/220"}
                          alt={album.name}
                          className="album-cover"
                        />
                        <div className="album-hover-info">
                          <div className="album-rating">
                            {renderStars(getRating(album))}
                            <span className="rating-value">
                              {getRating(album).toFixed(1)}
                            </span>
                          </div>
                          <div className="view-details">Ver detalles</div>
                        </div>
                      </div>
                      <div className="album-info">
                        <h3 className="album-title">{album.name}</h3>
                        <p className="album-artist">{album.artist}</p>
                        {album.year && (
                          <p className="album-year">{album.year}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recientes */}
            <section className="albums-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="section-title-icon">✨</span>
                  <h2>Novedades</h2>
                </div>
                <Link to="/albums/newest" className="section-link">
                  Ver todos <span>→</span>
                </Link>
              </div>
              <hr className="section-divider" />
              <div className="albums-carousel">
                <div className="albums-carousel-inner">
                  {recentAlbums.map((album) => (
                    <div
                      key={album._id}
                      className="carousel-album-card"
                      onClick={() => navigate(`/album/${album._id}`)}
                    >
                      <div className="album-poster-container">
                        <img
                          src={album.cover || "https://via.placeholder.com/220"}
                          alt={album.name}
                          className="album-cover"
                        />
                        <div className="album-hover-info">
                          <div className="album-rating">
                            {renderStars(getRating(album))}
                            <span className="rating-value">
                              {getRating(album).toFixed(1)}
                            </span>
                          </div>
                          <div className="view-details">Ver detalles</div>
                        </div>
                      </div>
                      <div className="album-info">
                        <h3 className="album-title">{album.name}</h3>
                        <p className="album-artist">{album.artist}</p>
                        {album.year && (
                          <p className="album-year">{album.year}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Mejor Valorados */}
            <section className="albums-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="section-title-icon">⭐</span>
                  <h2>Mejor Valorados</h2>
                </div>
                <Link to="/albums/rating" className="section-link">
                  Ver todos <span>→</span>
                </Link>
              </div>
              <hr className="section-divider" />
              <div className="albums-carousel">
                <div className="albums-carousel-inner">
                  {topRatedAlbums.map((album) => (
                    <div
                      key={album._id}
                      className="carousel-album-card"
                      onClick={() => navigate(`/album/${album._id}`)}
                    >
                      <div className="album-poster-container">
                        <img
                          src={album.cover || "https://via.placeholder.com/220"}
                          alt={album.name}
                          className="album-cover"
                        />
                        <div className="album-hover-info">
                          <div className="album-rating">
                            {renderStars(getRating(album))}
                            <span className="rating-value">
                              {getRating(album).toFixed(1)}
                            </span>
                          </div>
                          <div className="view-details">Ver detalles</div>
                        </div>
                      </div>
                      <div className="album-info">
                        <h3 className="album-title">{album.name}</h3>
                        <p className="album-artist">{album.artist}</p>
                        {album.year && (
                          <p className="album-year">{album.year}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Albums de amigos - solo se muestra si hay usuario logueado */}
            {loggedUserId && friendsAlbums.length > 0 && (
              <section className="albums-section">
                <div className="section-header">
                  <div className="section-title">
                    <span className="section-title-icon">👥</span>
                    <h2>Favoritos de tus Amigos</h2>
                  </div>
                  <Link
                    to="/albums/popularity?friends=true"
                    className="section-link"
                  >
                    Ver todos <span>→</span>
                  </Link>
                </div>
                <hr className="section-divider" />
                <div className="albums-carousel">
                  <div className="albums-carousel-inner">
                    {friendsAlbums.map((album) => (
                      <div
                        key={album._id}
                        className="carousel-album-card"
                        onClick={() => navigate(`/album/${album._id}`)}
                      >
                        <div className="album-poster-container">
                          <img
                            src={
                              album.cover || "https://via.placeholder.com/220"
                            }
                            alt={album.name}
                            className="album-cover"
                          />
                          <div className="album-hover-info">
                            <div className="album-rating">
                              {renderStars(getRating(album))}
                              <span className="rating-value">
                                {getRating(album).toFixed(1)}
                              </span>
                            </div>
                            <div className="view-details">Ver detalles</div>
                          </div>
                        </div>
                        <div className="album-info">
                          <h3 className="album-title">{album.name}</h3>
                          <p className="album-artist">{album.artist}</p>
                          {album.year && (
                            <p className="album-year">{album.year}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Explorar por géneros */}
            <section className="genres-section">
              <div className="section-header">
                <div className="section-title">
                  <span className="section-title-icon">🎵</span>
                  <h2>Explorar por Género</h2>
                </div>
              </div>
              <hr className="section-divider" />

              <div className="genres-grid">
                {["Rock", "Pop", "Hip Hop", "R&B", "Electronic", "Jazz"].map(
                  (genre) => (
                    <div
                      key={genre}
                      className="genre-card"
                      onClick={() =>
                        navigate(`/albums/popularity?genre=${genre}`)
                      }
                    >
                      <h3>{genre}</h3>
                    </div>
                  )
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Welcome;
