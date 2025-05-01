const Usuario = require("../model/usuario");

const addFriend = async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res
        .status(400)
        .json({ mensaje: "Se requieren ambos IDs de usuario" });
    }

    // Verificar que no se intente añadir a sí mismo como amigo
    if (userId === friendId) {
      return res
        .status(400)
        .json({ mensaje: "No puedes añadirte a ti mismo como amigo" });
    }

    // Verificar que ambos usuarios existen
    const [user, friend] = await Promise.all([
      Usuario.findById(userId),
      Usuario.findById(friendId),
    ]);

    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (!friend) {
      return res
        .status(404)
        .json({ mensaje: "El amigo que intentas añadir no existe" });
    }

    // Verificar si ya son amigos
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ mensaje: "Ya sois amigos" });
    }

    // Añadir a la lista de amigos
    user.friends.push(friendId);
    await user.save();

    res.status(200).json({
      mensaje: "Amigo añadido correctamente",
      friends: user.friends,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al añadir amigo", error: error.message });
  }
};

module.exports = addFriend;
