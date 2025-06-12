const Usuario = require("../model/usuario");

/**
 * Elimina un álbum de la lista de "likes" del usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const deleteFromLikes = async (req, res) => {
  try {
    const { userId, albumId } = req.body;

    if (!userId || !albumId) {
      return res.status(400).json({
        success: false,
        message: "Se requieren el ID del usuario y del álbum",
      });
    }

    // Buscar usuario
    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el álbum tiene like
    if (!user.likes || !user.likes.includes(albumId)) {
      return res.status(400).json({
        success: false,
        message: "No has dado like a este álbum",
      });
    }

    // Eliminar álbum de likes
    user.likes = user.likes.filter((id) => id !== albumId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Has quitado el like al álbum",
      likes: user.likes,
    });
  } catch (error) {
    console.error("Error al quitar like al álbum:", error);
    return res.status(500).json({
      success: false,
      message: "Error al quitar like al álbum",
      error: error.message,
    });
  }
};

module.exports = deleteFromLikes;
