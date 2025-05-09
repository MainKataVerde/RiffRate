const Usuario = require("../model/usuario");
const Album = require("../model/albumes");

/**
 * Elimina un álbum de la lista de likes del usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const deleteFromLikes = async (req, res) => {
  try {
    const { userId, albumId } = req.body;

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

    // Verificar que el álbum existe
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Álbum no encontrado",
      });
    }

    // Verificar si el álbum está en likes
    if (!usuario.likes || !usuario.likes.includes(albumId)) {
      return res.status(404).json({
        success: false,
        message: "El álbum no está en la lista de likes del usuario",
      });
    }

    // Eliminar el ID del álbum del array de likes
    usuario.likes = usuario.likes.filter((id) => id !== albumId);
    await usuario.save();

    return res.status(200).json({
      success: true,
      message: "Álbum eliminado de likes correctamente",
      likes: usuario.likes,
    });
  } catch (error) {
    console.error("Error al eliminar álbum de likes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error.message,
    });
  }
};

module.exports = deleteFromLikes;
