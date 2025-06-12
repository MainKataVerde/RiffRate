import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./css/editprofile.module.css";
import Cropper from "react-easy-crop";
import FaboriteAlbumSearch from "./FaboriteAlbumSearch";
import { getCroppedImg } from "../utils/cropImage.tsx";
import { useNavigate } from "react-router-dom";

interface Album {
  _id: string;
  name: string;
  artist: string;
  cover: string;
  year?: string;
  genre?: string;
}
const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nombre: "",
    bio: "",
    photo: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("userId");

  // Estados para la gestión de favoritos
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  // Estados para el recortador de imágenes
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        const response = await axios.get(
          `http://localhost:4000/user/${userId}`
        );
        const userData = response.data;

        setUser({
          nombre: userData.nombre || "",
          bio: userData.bio || "",
          photo: userData.photo || "",
        });

        if (userData.photo) {
          setPreviewImage(userData.photo);
        }

        // Cargar álbumes favoritos
        if (userData.favoriteAlbums && userData.favoriteAlbums.length > 0) {
          fetchFavoriteAlbums(userData.favoriteAlbums);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Cargar los detalles de los álbumes favoritos
  const fetchFavoriteAlbums = async (albumIds) => {
    try {
      const albumPromises = albumIds.map((id) =>
        axios.get(`http://localhost:4000/album/${id}`)
      );

      const responses = await Promise.all(albumPromises);
      const albums = responses
        .map((res) => {
          if (res.data && res.data._id) {
            return res.data;
          } else if (res.data.album) {
            return res.data.album;
          }
          return null;
        })
        .filter((album) => album !== null);

      setFavoriteAlbums(albums);
    } catch (error) {
      console.error("Error al cargar álbumes favoritos:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear URL para la imagen seleccionada
      const imageUrl = URL.createObjectURL(file);

      // Mostrar el recortador
      setCropImage(imageUrl);
      setShowCropper(true);
    }
  };

  // Funciones para el recortador de imágenes
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(cropImage, croppedAreaPixels);

      // Actualizar la vista previa
      setPreviewImage(croppedImage);

      // Convertir la imagen recortada a un archivo Blob para subir
      fetch(croppedImage)
        .then((res) => res.blob())
        .then((blob) => {
          // Crear un archivo desde el blob
          const file = new File([blob], "profile-image.jpg", {
            type: "image/jpeg",
          });

          // Crear un nuevo FileList (no se puede modificar el existente)
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          // Reemplazar los archivos en el input
          if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files;
          }
        });

      // Cerrar el recortador
      setShowCropper(false);
    } catch (error) {
      console.error("Error al recortar la imagen:", error);
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setCropImage(null);

    // Limpiar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append("nombre", user.nombre);
      formData.append("bio", user.bio);

      // Añadir foto si se seleccionó una
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        formData.append("photo", fileInputRef.current.files[0]);
      }

      const response = await axios.put(
        `http://localhost:4000/user/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Mostrar mensaje de éxito
        alert("Perfil actualizado correctamente");

        // Redirigir a la página de perfil después de actualizar
        navigate(`/user/${userId}`); // Ajusta la ruta según la estructura de tu aplicación
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // Añadir álbum a favoritos
  const addToFavorites = async (albumId) => {
    // Verificar si ya tiene 4 favoritos
    if (favoriteAlbums.length >= 4) {
      alert("Ya tienes 4 álbumes favoritos. Elimina alguno para añadir otro.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:4000/user/${userId}/favorite/${albumId}`
      );

      // Actualizar la lista de favoritos
      const albumResponse = await axios.get(
        `http://localhost:4000/album/${albumId}`
      );
      const newAlbum = albumResponse.data.album || albumResponse.data;

      setFavoriteAlbums([...favoriteAlbums, newAlbum]);

      // Limpiar el término de búsqueda después de añadir
      setSearchTerm("");
    } catch (error) {
      console.error("Error al añadir a favoritos:", error);
      alert("Error al añadir el álbum a favoritos");
    }
  };

  const removeFromFavorites = async (albumId: string) => {
    try {
      // Usar POST en lugar de DELETE y la URL correcta
      await axios.post(
        `http://localhost:4000/user/${userId}/songs/favorites/remove`,
        {
          songId: albumId, // El backend espera songId en el body
          albumId: albumId, // El backend también espera albumId
        }
      );

      // Actualizar la interfaz de usuario inmediatamente
      setFavoriteAlbums(
        favoriteAlbums.filter((album) => album._id !== albumId)
      );
    } catch (error) {
      console.error("Error al eliminar de favoritos:", error);
      // Mostrar un mensaje más descriptivo
      alert("No se pudo eliminar el álbum de favoritos");
    }
  };

  // Función para manejar cuando se selecciona un álbum del componente FaboriteAlbumSearch
  const handleFavoriteAlbumSelected = (album: Album) => {
    // Verificar límite
    if (favoriteAlbums.length >= 4) {
      alert("Ya tienes 4 álbumes favoritos. Elimina alguno para añadir otro.");
      return;
    }

    // Verificar si ya está en favoritos
    if (favoriteAlbums.some((favAlbum) => favAlbum._id === album._id)) {
      alert("Este álbum ya está en tus favoritos");
      return;
    }

    // Añadir a favoritos
    addToFavorites(album._id);
  };

  if (loadingUser) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando datos del perfil...</p>
      </div>
    );
  }

  return (
    <div className={styles.editProfileContainer}>
      {/* Pestañas de navegación */}
      <div className={styles.backButtonContainer}>
        <button
          className={styles.backButton}
          onClick={() => navigate(`/user/${userId}`)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Volver a mi perfil</span>
        </button>
      </div>
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "perfil" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("perfil")}
        >
          Datos de perfil
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "favoritos" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("favoritos")}
        >
          Álbumes Favoritos
        </button>
      </div>

      {/* Contenido de la pestaña Perfil */}
      {activeTab === "perfil" && (
        <form onSubmit={handleSubmit} className={styles.profileForm}>
          {/* Modal de recorte de imagen */}
          {showCropper && (
            <div className={styles.cropperModal}>
              <div className={styles.cropperContainer}>
                <div className={styles.cropperHeader}>
                  <h3>Recortar imagen de perfil</h3>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={cancelCrop}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.cropperContent}>
                  <Cropper
                    image={cropImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape="round"
                    showGrid={false}
                  />
                </div>
                <div className={styles.cropperControls}>
                  <div className={styles.zoomControl}>
                    <label>Zoom</label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className={styles.zoomSlider}
                    />
                  </div>
                  <div className={styles.cropperActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={cancelCrop}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={styles.applyButton}
                      onClick={applyCrop}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Vista previa"
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.emptyAvatar}>
                  <span>
                    {user.nombre ? user.nombre.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
              )}
              <div className={styles.imageOverlay}>
                <label htmlFor="photo" className={styles.uploadButton}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 16L12 8"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 11L12 8 15 11"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 18H16"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Cambiar foto</span>
                </label>
              </div>
            </div>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className={styles.hiddenInput}
            />
          </div>

          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                value={user.nombre}
                onChange={(e) => setUser({ ...user, nombre: e.target.value })}
                className={styles.input}
                placeholder="Tu nombre"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Biografía
                <span className={styles.charCount}>
                  {user.bio ? user.bio.length : 0}/500
                </span>
              </label>
              <textarea
                value={user.bio}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                className={styles.textarea}
                placeholder="Cuéntanos sobre ti..."
                maxLength={500}
                rows={4}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  <span>Actualizando...</span>
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Contenido de la pestaña Favoritos */}
      {activeTab === "favoritos" && (
        <div className={styles.favoritesSection}>
          <h3 className={styles.sectionTitle}>Gestionar Álbumes Favoritos</h3>

          {/* Contador de favoritos */}
          <div className={styles.favoritesCounter}>
            <span
              className={`${styles.counter} ${
                favoriteAlbums.length >= 4 ? styles.counterFull : ""
              }`}
            >
              {favoriteAlbums.length}/4
            </span>
            <span className={styles.counterLabel}>
              {favoriteAlbums.length >= 4
                ? "Has alcanzado el límite de favoritos"
                : `Puedes añadir ${4 - favoriteAlbums.length} más`}
            </span>
          </div>

          {/* Buscador de álbumes - Usando el componente FaboriteAlbumSearch */}
          {favoriteAlbums.length < 4 ? (
            <FaboriteAlbumSearch onAlbumClick={handleFavoriteAlbumSelected} />
          ) : (
            <div className={styles.limitMessage}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 8V12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <p>
                Has alcanzado el límite de 4 álbumes favoritos. Elimina alguno
                para añadir otros.
              </p>
            </div>
          )}

          {/* Lista de álbumes favoritos actuales */}
          <div className={styles.currentFavoritesContainer}>
            <h4 className={styles.favoritesTitle}>
              Tus álbumes favoritos
              <span className={styles.favoritesCount}>
                ({favoriteAlbums.length}/4)
              </span>
            </h4>

            {favoriteAlbums.length === 0 ? (
              <p className={styles.emptyMessage}>
                No tienes álbumes favoritos. ¡Busca y añade algunos!
              </p>
            ) : (
              <div className={styles.albumsGrid}>
                {favoriteAlbums.map((album) => (
                  <div key={album._id} className={styles.albumCard}>
                    <div className={styles.albumImageContainer}>
                      <img
                        src={album.cover || "/default-album.png"}
                        alt={album.name}
                        className={styles.albumImage}
                      />
                    </div>
                    <div className={styles.albumInfo}>
                      <h5 className={styles.albumTitle}>{album.name}</h5>
                      <p className={styles.albumArtist}>{album.artist}</p>
                      <button
                        onClick={() => removeFromFavorites(album._id)}
                        className={styles.removeButton}
                      >
                        Quitar de favoritos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
