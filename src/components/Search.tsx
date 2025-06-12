import Header from "./Header";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/search.css";

// Define la interfaz para los resultados de búsqueda
interface SearchResult {
  id: string;
  nombre: string;
  tipo: "usuario" | "album" | "artista";
  photo: string;
}

const Search = () => {
  const loggedUserId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const { query } = useParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // Para debug - ver lo que está pasando
    console.log("Buscando:", query);

    setLoading(true);
    axios
      .get(`http://localhost:4000/search/${query}`)
      .then((response) => {
        console.log("Resultados:", response.data);
        setResults(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error en la búsqueda:", err);
        setError("No se pudieron cargar los resultados");
        setLoading(false);
      });
  }, [query]);

  // Función para manejar clicks en resultados
  const handleResultClick = (result: SearchResult) => {
    switch (result.tipo) {
      case "usuario":
        navigate(`/user/${result.id}`); // Cambiado de /profile/ a /user/ para coincidir con tu App.tsx
        break;
      case "album":
        navigate(`/album/${result.id}`);
        break;
      case "artista":
        navigate(`/artist/${result.id}`);
        break;
    }
  };

  return (
    <div className="welcomeContainer">
      <div className="cuerpoSearch">
        <div className="cuerpoArriba">
          <div className="cuerpoArribaTexto">
            Mostrando resultados para {""}
            <b>{query}</b>
          </div>
        </div>

        {loading ? (
          <p>Cargando resultados...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : results.length === 0 ? (
          <p>No se encontraron resultados para "{query}"</p>
        ) : (
          <div className="searchResults">
            {/* Usuarios */}
            {results.filter((r) => r.tipo === "usuario").length > 0 && (
              <div className="resultSection">
                <h2>Usuarios</h2>
                <div className="resultList">
                  {results
                    .filter((r) => r.tipo === "usuario")
                    .map((result) => (
                      <div
                        key={result.id}
                        className="resultItem"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="resultItemPhoto">
                          {result.photo ? (
                            <img src={result.photo} alt={result.nombre} />
                          ) : (
                            <div className="resultItemPhotoPlaceholder"></div>
                          )}
                        </div>
                        {result.nombre}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Álbumes */}
            {results.filter((r) => r.tipo === "album").length > 0 && (
              <div className="resultSection">
                <h2>Álbumes</h2>
                <div className="resultList">
                  {results
                    .filter((r) => r.tipo === "album")
                    .map((result) => (
                      <div
                        key={result.id}
                        className="resultItem"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="resultItemPhoto">
                          {result.photo ? (
                            <img src={result.photo} alt={result.nombre} />
                          ) : (
                            <div className="resultItemPhotoPlaceholder"></div>
                          )}
                        </div>
                        {result.nombre}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Artistas */}
            {results.filter((r) => r.tipo === "artista").length > 0 && (
              <div className="resultSection">
                <h2>Artistas</h2>
                <div className="resultList">
                  {results
                    .filter((r) => r.tipo === "artista")
                    .map((result) => (
                      <div
                        key={result.id}
                        className="resultItem"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="resultItemPhoto">
                          {result.photo ? (
                            <img src={result.photo} alt={result.nombre} />
                          ) : (
                            <div className="resultItemPhotoPlaceholder"></div>
                          )}
                        </div>
                        {result.nombre}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
