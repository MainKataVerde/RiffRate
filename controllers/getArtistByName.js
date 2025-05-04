const Artist = require("../model/artist");

const getArtistByName = async (req, res) => {
  const { artistName } = req.params;

  if (!artistName || artistName.length === 0) {
    return res.status(400).json({ mensaje: "No existe el artista" });
  }

  try {
    console.log(`Buscando artista con nombre: "${artistName}"`);

    // Usar una expresión regular para hacer la búsqueda insensible a mayúsculas/minúsculas
    const artist = await Artist.findOne({
      name: { $regex: new RegExp(`^${artistName}$`, "i") },
    });

    if (!artist) {
      console.log(`No se encontró ningún artista con nombre: "${artistName}"`);
      return res
        .status(404)
        .json({ mensaje: "No encontramos ningún artista con ese nombre" });
    }

    console.log(`Artista encontrado: ${artist.name}`);
    res.json(artist);
  } catch (error) {
    console.error(`Error al buscar artista: ${error.message}`);
    res
      .status(500)
      .json({ mensaje: "Error al buscar el artista", error: error.message });
  }
};

module.exports = getArtistByName;
