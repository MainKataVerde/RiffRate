const Album = require("../model/albumes");

const filterAlbums = async (req, res) => {
  try {
    // Extraer parámetros de query
    const { decade, genre, rating, sortBy } = req.query;

    // Construir filtro
    let filter = {};

    // Filtro por década
    if (decade) {
      const startYear = parseInt(decade);
      const endYear = startYear + 9;
      filter.released = {
        $gte: new Date(`${startYear}-01-01`),
        $lte: new Date(`${endYear}-12-31`),
      };
    }

    // Filtro por género (case insensitive)
    if (genre) {
      filter.genres = { $regex: new RegExp(genre, "i") };
    }

    // Filtro por rating (nota)
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
        sort = { released: 1 }; // Ordenar por fecha (más antiguo primero)
        break;
      case "name":
        sort = { name: 1 }; // Ordenar alfabéticamente A-Z
        break;
      default:
        sort = { popularity: -1 }; // Orden por defecto (popularidad)
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
