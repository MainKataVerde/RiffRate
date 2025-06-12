const Usuario = require("../model/usuario");

/**
 * Añade un álbum a la lista de "likes" del usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const addToLikes = async (req, res) => {
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

    // Verificar si el álbum ya tiene like
    if (user.likes && user.likes.includes(albumId)) {
      return res.status(200).json({
        success: true,
        message: "Ya has dado like a este álbum",
        likes: user.likes,
      });
    }

    // Inicializar array si no existe
    if (!user.likes) {
      user.likes = [];
    }

    // Añadir álbum a likes
    user.likes.push(albumId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Has dado like al álbum",
      likes: user.likes,
    });
  } catch (error) {
    console.error("Error al dar like al álbum:", error);
    return res.status(500).json({
      success: false,
      message: "Error al dar like al álbum",
      error: error.message,
    });
  }
};

module.exports = addToLikes;
