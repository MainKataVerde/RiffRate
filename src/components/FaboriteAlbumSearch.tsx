import { useState } from "react";
import axios from "axios";
import styles from "./css/faboriteAlbumSearch.module.css";

// Definir interfaces para los datos
interface Album {
  _id: string;
  name: string;
  artist: string;
  cover: string;
  year?: string;
  genre?: string;
}

// Interfaz para los resultados de la API de búsqueda
interface SearchResult {
  id: string;
  nombre: string;
  tipo: "usuario" | "album" | "artista";
  photo: string;
}

interface AlbumSearchProps {
  onAlbumClick?: (album: Album) => void;
}

const FaboriteAlbumSearch = ({ onAlbumClick }: AlbumSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  // Función para buscar álbumes usando el endpoint general de búsqueda
  const searchAlbums = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      // Usar el mismo endpoint que usa el componente Search
      const response = await axios.get(
        `http://localhost:4000/search/${searchTerm}`
      );

      // Filtrar solo los resultados de tipo "album"
      const albumResults = response.data
        .filter((item: SearchResult) => item.tipo === "album")
        .map((album: SearchResult) => ({
          _id: album.id,
          name: album.nombre,
          cover: album.photo,
          artist: "", // Este campo no viene en la respuesta original
        }));

      setSearchResults(albumResults);

      if (albumResults.length === 0) {
        setError(`No se encontraron álbumes para "${searchTerm}"`);
      }
    } catch (error) {
      console.error("Error al buscar álbumes:", error);
      setError("Error al buscar álbumes. Intenta de nuevo.");
    } finally {
      setIsSearching(false);
    }
  };

  // Resto del componente sin cambios
  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchAlbums();
  };

  // Manejar clic en un álbum
  const handleAlbumClick = (album: Album) => {
    if (onAlbumClick) {
      onAlbumClick(album);
    }
  };

  return (
    <div className={styles.albumSearchContainer}>
      <div className={styles.searchHeader}>
        <h2>Buscar Álbumes</h2>
        <p>Encuentra tus álbumes favoritos</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchInputContainer}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de álbum o artista..."
            className={styles.searchInput}
          />
          <button
            type="submit"
            className={styles.searchButton}
            disabled={isSearching || !searchTerm.trim()}
          >
            {isSearching ? (
              <span className={styles.spinner}></span>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {searchResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3 className={styles.resultsTitle}>Resultados</h3>
          <div className={styles.albumsGrid}>
            {searchResults.map((album) => (
              <div
                key={album._id}
                className={styles.albumCard}
                onClick={() => handleAlbumClick(album)}
              >
                <div className={styles.albumImageContainer}>
                  <img
                    src={album.cover || "/default-album.png"}
                    alt={album.name}
                    className={styles.albumImage}
                  />
                </div>
                <div className={styles.albumInfo}>
                  <h4 className={styles.albumTitle}>{album.name}</h4>
                  {album.artist && (
                    <p className={styles.albumArtist}>{album.artist}</p>
                  )}
                  {album.year && (
                    <p className={styles.albumYear}>{album.year}</p>
                  )}
                  {album.genre && (
                    <p className={styles.albumGenre}>{album.genre}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaboriteAlbumSearch;
