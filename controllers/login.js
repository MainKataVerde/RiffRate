const bcrypt = require("bcrypt");
const Usuario = require("../model/usuario");

const login = async (req, res) => {
  const { email, password } = req.body;

  Usuario.findOne({ email }).then((user) => {
    if (!user) {
      res.status(400).json({ error: "Usuario no encontrado" });
    } else {
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          const { id, nombre } = user;
          res.json({
            mensaje: "Usuario logueado: ",
            usuario: {
              id,
              nombre,
            },
          });
        } else {
          res.json({ mensaje: "Contraseña incorrecta" });
        }
      });
    }
  });
};

module.exports = login;
