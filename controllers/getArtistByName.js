const Artist = require("../model/artist");

const getArtistByName = async (req, res) => {
  const { artistName } = req.params;

  if (!artistName || artistName.length === 0) {
    return res.status(400).json({ mensaje: "No existe el artista" });
  }

  try {
    const artist = await Artist.findOne({ name: artistName });
    if (!artist) {
      return res
        .status(404)
        .json({ mensaje: "No encontramos ningún artista con ese nombre" });
    }
    res.json(artist);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar el artista", error: error.message });
  }
};

module.exports = getArtistByName;
