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
      nombre: { $regex: query, $options: "i" },
    })
      .select("_id nombre photo")
      .lean();
    const albums = await Album.find({ name: { $regex: query, $options: "i" } })
      .select("_id name cover")
      .lean();
    const artistas = await Artist.find({
      name: { $regex: query, $options: "i" },
    })
      .select("_id name photo")
      .lean();

    const results = [
      ...usuarios.map((u) => ({
        id: u._id,
        nombre: u.nombre,
        photo: u.photo,
        tipo: "usuario",
      })),
      ...albums.map((a) => ({
        id: a._id,
        nombre: a.name,
        photo: a.cover,
        tipo: "album",
      })),
      ...artistas.map((ar) => ({
        id: ar._id,
        nombre: ar.name,
        photo: ar.photo,
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
