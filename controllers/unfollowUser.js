const Usuario = require("../model/usuario");

/**
 * Elimina a un usuario de la lista de amigos
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unfollowId } = req.body;

    if (!userId || !unfollowId) {
      return res.status(400).json({
        success: false,
        message:
          "Se requiere el ID del usuario y del usuario a dejar de seguir",
      });
    }

    // Verificar que no se intente eliminar a sí mismo
    if (userId === unfollowId) {
      return res.status(400).json({
        success: false,
        message: "No puedes dejarte de seguir a ti mismo",
      });
    }

    // Verificar que ambos usuarios existen
    const [user, friendToUnfollow] = await Promise.all([
      Usuario.findById(userId),
      Usuario.findById(unfollowId),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!friendToUnfollow) {
      return res.status(404).json({
        success: false,
        message: "El usuario que intentas dejar de seguir no existe",
      });
    }

    // Verificar si son amigos
    if (!user.friends.includes(unfollowId)) {
      return res.status(400).json({
        success: false,
        message: "No sigues a este usuario",
      });
    }

    // Eliminar de la lista de amigos
    user.friends = user.friends.filter(
      (friend) => friend.toString() !== unfollowId
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Has dejado de seguir al usuario correctamente",
      friends: user.friends,
    });
  } catch (error) {
    console.error("Error al dejar de seguir al usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al dejar de seguir al usuario",
      error: error.message,
    });
  }
};

module.exports = unfollowUser;
