const Album = require("../model/albumes");

const getAlbumByName = async (req, res) => {
  const { albumName } = req.params;

  //verificamos que la id sea correcta
  if (albumName.length > 0) {
    await mongoose.connect("mongodb://localhost:27017/musicapp");
    console.log("MongoDB connected");

    Album.findById(albumName).then((album) => {
      if (!album) {
        return res.json({
          mesnaje: "No encontramos ningun usuario con esa id",
        });
      } else {
        const { _id, name, __v, ...resto } = album._doc;
        res.json(resto);
      }
    });
  } else {
    res.json({ mensjae: "No existe el album" });
  }
};

module.exports = getAlbumByName;
