const Usuario = require("../model/usuario");
const Album = require("../model/albumes");

/**
 * Añade un álbum a la lista de likes del usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const addToLikes = async (req, res) => {
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

    // Verificar si el álbum ya está en likes para evitar duplicados
    if (usuario.likes && usuario.likes.includes(albumId)) {
      return res.status(200).json({
        success: true,
        message: "El álbum ya está en la lista de likes",
        likes: usuario.likes,
      });
    }

    // Añadir el ID del álbum al array de likes
    if (!usuario.likes) {
      usuario.likes = [];
    }
    usuario.likes.push(albumId);
    await usuario.save();

    return res.status(200).json({
      success: true,
      message: "Álbum añadido a likes correctamente",
      likes: usuario.likes,
    });
  } catch (error) {
    console.error("Error al añadir álbum a likes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error.message,
    });
  }
};

module.exports = addToLikes;
