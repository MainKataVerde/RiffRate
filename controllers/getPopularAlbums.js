const Album = require("../model/albumes");

const getPopularAlbums = async (req, res) => {
  try {
    const albums = await Album.find().sort({ popularity: -1 }).limit(10);
    res.json(albums);
  } catch (error) {
    res
      .status(500)
      .json({
        mensaje: "Error al obtener álbumes populares",
        error: error.message,
      });
  }
};

module.exports = getPopularAlbums;
