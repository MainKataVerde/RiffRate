const Album = require("../model/albumes");

const getAlbumByName = async (req, res) => {
  const { albumName } = req.params;

  if (!albumName || albumName.length === 0) {
    return res.status(400).json({ mensaje: "No existe el album" });
  }

  try {
    // Busca el álbum por nombre
    const album = await Album.findOne({ name: albumName });
    if (!album) {
      return res
        .status(404)
        .json({ mensaje: "No encontramos ningún álbum con ese nombre" });
    }
    res.json(album);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al buscar el álbum", error: error.message });
  }
};

module.exports = getAlbumByName;
