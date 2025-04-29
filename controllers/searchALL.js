const Usuario = require("../model/usuario");
const Album = require("../model/albumes");
const Artist = require("../model/artist");

const searchAll = async (req, res) => {
  const { query } = req.params;

  if (!query || query.length === 0) {
    return res.status(400).json({ mensaje: "No se ha proporcionado búsqueda" });
  }

  try {
    const usuarios = await Usuario.find({
      name: { $regex: query, $options: "i" },
    })
      .select("_id name")
      .lean();
    const albums = await Album.find({ name: { $regex: query, $options: "i" } })
      .select("_id name")
      .lean();
    const artistas = await Artist.find({
      name: { $regex: query, $options: "i" },
    })
      .select("_id name")
      .lean();

    const results = [
      ...usuarios.map((u) => ({ id: u._id, nombre: u.name, tipo: "usuario" })),
      ...albums.map((a) => ({ id: a._id, nombre: a.name, tipo: "album" })),
      ...artistas.map((ar) => ({
        id: ar._id,
        nombre: ar.name,
        tipo: "artista",
      })),
    ];

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en la búsqueda", error: error.message });
  }
};

module.exports = searchAll;
