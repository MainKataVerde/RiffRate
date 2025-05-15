const Usuario = require("../model/usuario");

/**
 * Verifica si un álbum está en la listenList del usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const checkUserListenList = async (req, res) => {
  try {
    const { userId, albumId } = req.params;

    // Validación de datos básicos
    if (!userId || !albumId) {
      return res.status(400).json({
        success: false,
        message: "Se requieren IDs de usuario y álbum",
      });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el álbum está en la listenList
    const isInListenList =
      usuario.listenList && usuario.listenList.includes(albumId);

    return res.status(200).json({
      success: true,
      isInListenList,
    });
  } catch (error) {
    console.error("Error al verificar listenList:", error);
    return res.status(500).json({
      success: false,
      message:
        "Error al verificar si el álbum está en la listenList del usuario",
      error: error.message,
    });
  }
};

module.exports = checkUserListenList;
