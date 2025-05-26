import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/artist.css";
import Header from "./Header";

interface Album {
  _id: string;
  name: string;
  cover: string;
  released: string;
  popularity?: number;
}

interface Artist {
  _id: string;
  name: string;
  photo: string;
  biography: string;
  albums: string[];
}

interface ListeningStats {
  totalAlbums: number;
  listenedAlbums: number;
  percentage: number;
  listenedAlbumsList: Album[];
}

const Artist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loggedUserId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [stats, setStats] = useState<ListeningStats | null>(null);
  const [sortBy, setSortBy] = useState("popularity");
  const [decade, setDecade] = useState("all");

  console.log(
    "[Artist] useEffect ejecutándose con artistId:",
    id,
    "y loggedUserId:",
    loggedUserId
  );

  useEffect(() => {
    if (!id) {
      console.error("[Artist] No se encontró ID de artista en la URL");
      setError("ID de artista no encontrado");
      setLoading(false);
      return;
    }

    const fetchArtistData = async () => {
      try {
        setLoading(true);
        console.log("[Artist] Realizando petición");

        // URL con userId si está disponible

        const url = loggedUserId
          ? `http://localhost:4000/artist/${id}?userId=${loggedUserId}`
          : `http://localhost:4000/artist/${id}`;

        console.log("Realizando petición a:", url);
        const response = await axios.get(url);

        if (response.data.success) {
          setArtist(response.data.artist);
          setAlbums(response.data.albums || []);

          // Establecer estadísticas si están disponibles
          if (response.data.listeningStats) {
            setStats(response.data.listeningStats);
          }
        } else {
          setError("No se pudo cargar la información del artista");
        }
      } catch (err) {
        console.error("[Artist] Error completo:", err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("[Artist] Respuesta de error:", {
              status: err.response.status,
              data: err.response.data,
            });
            setError(
              `Error ${err.response.status}: ${
                err.response.data.message || "Error del servidor"
              }`
            );
          } else if (err.request) {
            console.error("[Artist] No se recibió respuesta");
            setError("No se pudo conectar al servidor");
          } else {
            setError(`Error: ${err.message}`);
          }
        } else {
          setError("Error desconocido al cargar datos del artista");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id, loggedUserId]);

  // Filtrar y ordenar álbumes
  const filteredAlbums = [...albums]
    .filter((album) => {
      if (decade === "all") return true;
      const albumYear = new Date(album.released).getFullYear();
      const decadeStart = parseInt(decade);
      return albumYear >= decadeStart && albumYear < decadeStart + 10;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return (b.popularity || 0) - (a.popularity || 0);
        case "newest":
          return (
            new Date(b.released).getTime() - new Date(a.released).getTime()
          );
        case "oldest":
          return (
            new Date(a.released).getTime() - new Date(b.released).getTime()
          );
        default:
          return 0;
      }
    });

  // Extraer décadas únicas de los álbumes
  const decades = [
    ...new Set(
      albums.map((album) => {
        const year = new Date(album.released).getFullYear();
        return Math.floor(year / 10) * 10;
      })
    ),
  ].sort();

  if (loading) {
    return (
      <>
        <Header loggedUserId={loggedUserId} />
        <div className="artist-loading">
          Cargando información del artista...
        </div>
      </>
    );
  }

  if (error || !artist) {
    return (
      <>
        <Header loggedUserId={loggedUserId} />
        <div className="artist-error">
          <h2>Error al cargar artista</h2>
          <p>{error || "No se pudo cargar la información del artista"}</p>
          <button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
          <div className="error-details">
            <p>ID Artista: {id || "No disponible"}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="artist-page">
      <Header loggedUserId={loggedUserId} />

      <div className="artist-container">
        <header className="artist-header">
          <h1>
            ÁLBUMES DE <span>{artist.name}</span>
          </h1>
        </header>

        <div className="artist-content">
          {/* Filtros */}
          <div className="artist-filters">
            <div className="filter-group">
              <span className="filter-label">DÉCADA</span>
              <select
                value={decade}
                onChange={(e) => setDecade(e.target.value)}
              >
                <option value="all">Todas</option>
                {decades.map((d) => (
                  <option key={d} value={d}>
                    {d}s
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">ORDENAR POR</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Popularidad</option>
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>
            </div>
          </div>

          <div className="artist-main-content">
            {/* Grid de álbumes */}
            <div className="albums-grid">
              {filteredAlbums.length > 0 ? (
                filteredAlbums.map((album) => (
                  <div
                    key={album._id}
                    className="album-item"
                    onClick={() => navigate(`/album/${album._id}`)}
                  >
                    <div className="album-cover">
                      <img
                        src={
                          album.cover ||
                          "https://via.placeholder.com/300?text=No+Cover"
                        }
                        alt={album.name}
                      />
                    </div>
                    <div className="album-info">
                      <h3>{album.name}</h3>
                      <p>{new Date(album.released).getFullYear()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-albums">No se encontraron álbumes</div>
              )}
            </div>

            {/* Información del artista */}
            <div className="artist-info-panel">
              <div className="artist-photo">
                <img
                  src={
                    artist.photo ||
                    "https://via.placeholder.com/400?text=No+Photo"
                  }
                  alt={artist.name}
                />
              </div>

              <div className="artist-bio">
                <p>{artist.biography || "No hay biografía disponible."}</p>
              </div>

              {/* Estadísticas de escucha */}
              {stats && (
                <div className="listening-stats">
                  <div className="stats-header">Has escuchado</div>
                  <div className="percentage">{stats.percentage}%</div>
                  <div className="stats-detail">
                    {stats.listenedAlbums} de {stats.totalAlbums} álbumes
                  </div>

                  {stats.listenedAlbumsList.length > 0 && (
                    <div className="listened-albums">
                      <h4>Álbumes escuchados:</h4>
                      <div className="mini-albums-grid">
                        {stats.listenedAlbumsList.map((album) => (
                          <div
                            key={album._id}
                            className="mini-album"
                            onClick={() => navigate(`/album/${album._id}`)}
                          >
                            <img
                              src={
                                album.cover ||
                                "https://via.placeholder.com/100?text=No+Cover"
                              }
                              alt={album.name}
                              title={`${album.name} (${new Date(
                                album.released
                              ).getFullYear()})`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artist;
