import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import "./template.css";

interface Album {
  _id: string;
  name: string;
  artist: string;
  year: number;
  genre: string;
  cover: string;
  rating: number;
}

const FilteredAlbums = () => {
  const { filter } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const loggedUserId = localStorage.getItem("userId");

  // Estados para los filtros
  const [decade, setDecade] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popularity");

  // Estado para los álbumes
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 12; // Cantidad de álbumes por página

  // Opciones para los filtros
  const decades = ["1960", "1970", "1980", "1990", "2000", "2010", "2020"];
  const genres = [
    "Rock",
    "Pop",
    "Hip Hop",
    "R&B",
    "Electronic",
    "Jazz",
    "Classical",
    "Metal",
    "Reggae",
    "Folk",
  ];

  // Cálculos para la paginación
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = albums.slice(indexOfFirstAlbum, indexOfLastAlbum);
  const totalPages = Math.ceil(albums.length / albumsPerPage);

  // Inicializar filtros desde URL al cargar
  useEffect(() => {
    // Obtener parámetros de la URL actual
    const params = new URLSearchParams(location.search);

    // Establecer filtros basados en parámetros de la URL
    if (params.get("decade")) setDecade(params.get("decade") || "");
    if (params.get("genre")) setGenre(params.get("genre") || "");
    if (params.get("rating")) setRating(params.get("rating") || "");

    // Mapear el parámetro de ruta al sortBy correcto
    if (filter) {
      switch (filter) {
        case "rating":
          setSortBy("rating");
          break;
        case "newest":
          setSortBy("newest"); // Corregido de "recent" a "newest"
          break;
        case "oldest":
          setSortBy("oldest"); // Añadido
          break;
        case "name":
          setSortBy("name"); // Añadido
          break;
        default:
          setSortBy("popularity");
      }
    }
  }, [location.search, filter]);

  // Reset a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, decade, genre, rating]);

  // Cargar álbumes cuando cambien los filtros
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const url = "http://localhost:4000/albums";

        // Todos los parámetros se pasan como query params
        const params = new URLSearchParams();
        if (decade) params.append("decade", decade);
        if (genre) params.append("genre", genre);
        if (rating) params.append("rating", rating);

        // Convertir el "filter" frontend al "sortBy" del backend
        let backendSortBy;
        switch (filter) {
          case "rating":
            backendSortBy = "rating";
            break;
          case "newest":
            backendSortBy = "recent"; // En el backend sigue siendo "recent"
            break;
          case "oldest":
            backendSortBy = "oldest";
            break;
          case "name":
            backendSortBy = "name";
            break;
          default:
            backendSortBy = "popularity";
        }
        params.append("sortBy", backendSortBy);

        const finalUrl = `${url}?${params.toString()}`;
        console.log("Consultando URL:", finalUrl);

        const response = await axios.get(finalUrl);
        console.log("Datos recibidos:", response.data);

        setAlbums(response.data);
        setError("");
      } catch (err) {
        console.error("Error completo:", err);
        setError("No se pudieron cargar los álbumes");
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [filter, decade, genre, rating]);

  // Cambiar el ordenamiento
  const handleSortChange = (value: string) => {
    setSortBy(value);

    // Actualizar query params para el nuevo filtro
    const params = new URLSearchParams();
    if (decade) params.append("decade", decade);
    if (genre) params.append("genre", genre);
    if (rating) params.append("rating", rating);

    navigate(`/albums/${value}?${params.toString()}`);
  };

  // Resetear filtros
  const handleReset = () => {
    setDecade("");
    setGenre("");
    setRating("");
    setSortBy("popularity");
    setCurrentPage(1);
    navigate("/albums/popularity");
  };

  // Componente para la paginación
  const Pagination = () => {
    const pageNumbers = [];

    // Generar números de página (limita a 5 páginas visibles)
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="page-btn"
        >
          &laquo; Anterior
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => setCurrentPage(1)} className="page-number">
              1
            </button>
            {startPage > 2 && <span className="ellipsis">...</span>}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`page-number ${currentPage === number ? "active" : ""}`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="ellipsis">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="page-number"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          Siguiente &raquo;
        </button>
      </div>
    );
  };

  // Función para renderizar estrellas según la calificación
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

  return (
    <div className="welcomeContainer">
      <Header loggedUserId={loggedUserId} />
      <div className="cuerpo">
        <div className="cuerpoArriba">
          <div className="cuerpoArribaTexto">
            <h1>Explorar Álbumes</h1>
          </div>
        </div>
        <div className="cuerpoAbajo">
          {/* Panel de filtros */}
          <div className="filters-panel">
            <div className="filter-group">
              <label>Década:</label>
              <select
                value={decade}
                onChange={(e) => {
                  setDecade(e.target.value);
                  setTimeout(() => {
                    const params = new URLSearchParams();
                    if (e.target.value) params.append("decade", e.target.value);
                    if (genre) params.append("genre", genre);
                    if (rating) params.append("rating", rating);
                    navigate(
                      `/albums/${filter || "popularity"}?${params.toString()}`
                    );
                  }, 300);
                }}
              >
                <option value="">Todas las décadas</option>
                {decades.map((d) => (
                  <option key={d} value={d}>
                    {d}s
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Género:</label>
              <select
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  setTimeout(() => {
                    const params = new URLSearchParams();
                    if (decade) params.append("decade", decade);
                    if (e.target.value) params.append("genre", e.target.value);
                    if (rating) params.append("rating", rating);
                    navigate(
                      `/albums/${filter || "popularity"}?${params.toString()}`
                    );
                  }, 300);
                }}
              >
                <option value="">Todos los géneros</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Calificación:</label>
              <select
                value={rating}
                onChange={(e) => {
                  setRating(e.target.value);
                  setTimeout(() => {
                    const params = new URLSearchParams();
                    if (decade) params.append("decade", decade);
                    if (genre) params.append("genre", genre);
                    if (e.target.value) params.append("rating", e.target.value);
                    navigate(
                      `/albums/${filter || "popularity"}?${params.toString()}`
                    );
                  }, 300);
                }}
              >
                <option value="">Todas</option>
                <option value="5">5 estrellas</option>
                <option value="4">4+ estrellas</option>
                <option value="3">3+ estrellas</option>
                <option value="2">2+ estrellas</option>
                <option value="1">1+ estrellas</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="popularity">Popularidad</option>
                <option value="rating">Mejor calificados</option>
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="name">Alfabético A-Z</option>
              </select>
            </div>

            <button onClick={handleReset} className="reset-button">
              Resetear filtros
            </button>
          </div>
          {/* Nuevo contenedor de álbumes y paginación */}
          <div className="albums-content-wrapper">
            <div className="albums-grid-container">
              {loading ? (
                <p className="loading">Cargando álbumes...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : albums.length === 0 ? (
                <p className="no-results">
                  No se encontraron álbumes con estos filtros
                </p>
              ) : (
                <div className="albums-grid">
                  {currentAlbums.map((album) => (
                    <div
                      key={album._id}
                      className="album-card"
                      onClick={() => navigate(`/album/${album._id}`)}
                    >
                      <img
                        src={album.cover || "https://via.placeholder.com/300"}
                        alt={album.name}
                        className="album-cover"
                      />
                      <div className="album-info">
                        <div className="album-title-container">
                          <h3 className="album-title">{album.name}</h3>
                        </div>
                        <p className="album-artist">{album.artist}</p>
                        <p className="album-year">{album.year}</p>
                        <div className="album-rating">
                          {renderStars(album.rating)}
                          <span className="rating-value">
                            {album.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paginación */}
            {!loading && !error && albums.length > 0 && (
              <div className="pagination-container">
                <Pagination />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilteredAlbums;
