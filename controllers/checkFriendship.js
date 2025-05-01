const Usuario = require("../model/usuario");

const checkFriendship = async (req, res) => {
  try {
    const { userId, friendId } = req.params;

    if (!userId || !friendId) {
      return res
        .status(400)
        .json({ mensaje: "Se requieren ambos IDs de usuario" });
    }

    const user = await Usuario.findById(userId);

    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Comprobar si el friendId está en la lista de amigos
    const isFriend = user.friends.includes(friendId);

    res.status(200).json({
      isFriend,
      mensaje: isFriend ? "Es tu amigo" : "No es tu amigo",
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al verificar amistad", error: error.message });
  }
};

module.exports = checkFriendship;
