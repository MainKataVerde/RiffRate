const bcrypt = require("bcrypt");
const Usuario = require("../model/usuario");

const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos, rellénelos por favor" });
  }

  try {
    const existingUsers = await Usuario.find({ $or: [{ email }, { nombre }] });

    const emailExists = existingUsers.some((u) => u.email === email);
    const nameExists = existingUsers.some((u) => u.nombre === nombre);

    if (emailExists) {
      return res
        .status(400)
        .json({ error: "Ya existe un usuario con ese correo" });
    }

    if (nameExists) {
      return res
        .status(400)
        .json({ error: "Ese nombre de usuario ya está en uso" });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = new Usuario({
      nombre,
      email,
      password: hash,
    });

    const savedUser = await newUser.save();

    res.json({ mensaje: "Usuario creado", user: savedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

module.exports = register;
