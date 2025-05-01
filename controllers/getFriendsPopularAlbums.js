const Usuario = require("../model/usuario");
const Album = require("../model/albumes");

const getFriendsPopularAlbums = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar si el userId es válido
    if (!userId) {
      return res
        .status(400)
        .json({ mensaje: "ID de usuario no proporcionado" });
    }

    // Obtener el usuario con su lista de amigos
    const user = await Usuario.findById(userId);

    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Si no tiene amigos, devolver un array vacío
    if (!user.friends.length) {
      return res.json([]);
    }

    // Obtener todos los amigos y sus álbumes favoritos
    const friends = await Usuario.find({ _id: { $in: user.friends } });

    // Crear un mapa para contar la frecuencia de cada álbum
    const albumCount = new Map();

    // Contar apariciones de cada álbum en favoritos de amigos
    friends.forEach((friend) => {
      if (friend.favoriteAlbums && friend.favoriteAlbums.length) {
        friend.favoriteAlbums.forEach((albumId) => {
          const count = albumCount.get(albumId) || 0;
          albumCount.set(albumId, count + 1);
        });
      }
    });

    // Convertir el mapa a un array y ordenar por popularidad
    const popularAlbumIds = [...albumCount.entries()]
      .sort((a, b) => b[1] - a[1]) // Ordenar por conteo descendente
      .slice(0, 10) // Limitar a los 10 más populares
      .map((entry) => entry[0]); // Obtener solo los IDs

    // Obtener detalles completos de los álbumes
    const popularAlbums = await Album.find({ _id: { $in: popularAlbumIds } });

    // Formatear respuesta para el frontend
    const formattedAlbums = popularAlbums.map((album) => ({
      _id: album._id,
      name: album.name,
      artist: album.artist,
      year: album.released ? new Date(album.released).getFullYear() : null,
      genre: album.genres && album.genres.length > 0 ? album.genres[0] : "",
      cover: album.cover || "",
      rating: album.averageRating || 0,
      popularity: albumCount.get(album._id), // Añadir cuántos amigos tienen este álbum
    }));

    // Mantener el orden original por popularidad
    formattedAlbums.sort((a, b) => b.popularity - a.popularity);

    res.json(formattedAlbums);
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Error al obtener álbumes populares entre amigos",
        error: error.message,
      });
  }
};

module.exports = getFriendsPopularAlbums;
