const Usuario = require("../model/usuario");

const getUserById = async (req, res) => {
  const { userId } = req.params;

  //verificamos que la id sea correcta
  if (userId.length === 24) {
    Usuario.findById(userId).then((user) => {
      if (!user) {
        return res.json({
          mesnaje: "No encontramos ningun usuario con esa id",
        });
      } else {
        const { _id, password, __v, ...resto } = user._doc;
        res.json(resto);
      }
    });
  } else {
    res.json({ mensjae: "Estas enviando una constraseña incorrecta" });
  }
};

module.exports = getUserById;
