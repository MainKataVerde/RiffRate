const Usuario = require("../model/usuario");

/**
 * Obtiene todos los amigos de un usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getUserFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario",
      });
    }

    // Obtener el usuario con su lista de amigos
    const usuario = await Usuario.findById(userId).lean();

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Si el usuario no tiene amigos, devolver array vacío
    if (!usuario.friends || usuario.friends.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        friends: [],
      });
    }

    // Obtener detalles de todos los amigos
    const friendsList = await Usuario.find({
      _id: { $in: usuario.friends },
    })
      .select("nombre photo reviews likes listenList") // Seleccionar solo campos relevantes
      .lean();

    return res.status(200).json({
      success: true,
      count: friendsList.length,
      friends: friendsList,
    });
  } catch (error) {
    console.error("Error al obtener amigos del usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los amigos",
      error: error.message,
    });
  }
};

module.exports = getUserFriends;
