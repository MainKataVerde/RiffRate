const Album = require("../model/albumes");
const Usuario = require("../model/usuario"); // Importa el modelo Usuario

const filterAlbums = async (req, res) => {
  try {
    // Extraer parámetros de query
    const { decade, genre, rating, sortBy, friends, userId } = req.query;

    // Construir filtro
    let filter = {};

    // Filtro especial por amigos
    if (friends === "true" && userId) {
      // Obtener el usuario y sus amigos
      const user = await Usuario.findById(userId);

      if (!user) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      // Si no tiene amigos, devolver array vacío
      if (!user.friends || user.friends.length === 0) {
        return res.json([]);
      }

      // Obtener los amigos y sus álbumes favoritos
      const friendUsers = await Usuario.find({ _id: { $in: user.friends } });

      // Extraer todos los IDs de álbumes favoritos de los amigos
      const friendsAlbumIds = [];
      friendUsers.forEach((friend) => {
        if (friend.favoriteAlbums && friend.favoriteAlbums.length > 0) {
          friendsAlbumIds.push(...friend.favoriteAlbums);
        }
      });

      // Si no hay álbumes favoritos, devolver array vacío
      if (friendsAlbumIds.length === 0) {
        return res.json([]);
      }

      // Filtrar por álbumes de amigos
      filter._id = { $in: [...new Set(friendsAlbumIds)] }; // Elimina duplicados
    }

    // Resto de filtros normales
    if (decade) {
      const startYear = parseInt(decade);
      const endYear = startYear + 9;
      filter.released = {
        $gte: new Date(`${startYear}-01-01`),
        $lte: new Date(`${endYear}-12-31`),
      };
    }

    if (genre) {
      filter.genres = { $regex: new RegExp(genre, "i") };
    }

    if (rating) {
      const minRating = parseFloat(rating);
      filter.averageRating = { $gte: minRating };
    }

    // Construir orden
    let sort = {};

    switch (sortBy) {
      case "rating":
        sort = { averageRating: -1 };
        break;
      case "recent":
        sort = { released: -1 };
        break;
      case "oldest":
        sort = { released: 1 };
        break;
      case "name":
        sort = { name: 1 };
        break;
      default:
        sort = { popularity: -1 };
    }

    // Ejecutar consulta
    const albums = await Album.find(filter).sort(sort);

    // Transformar los datos para el frontend
    const formattedAlbums = albums.map((album) => ({
      _id: album._id,
      name: album.name,
      artist: album.artist,
      year: album.released ? new Date(album.released).getFullYear() : null,
      genre: album.genres && album.genres.length > 0 ? album.genres[0] : "",
      cover: album.cover || "",
      rating: album.averageRating || 0,
    }));

    res.json(formattedAlbums);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al filtrar álbumes", error: error.message });
  }
};

module.exports = filterAlbums;
