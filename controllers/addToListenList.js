const Usuario = require("../model/usuario");
const Album = require("../model/albumes");
const Review = require("../model/reviews");

/**
 * Añade un álbum a la lista de escucha del usuario siempre que no se haya escrito una reseña
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const addToListenList = async (req, res) => {
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

    // Verificar si el usuario ya tiene una reseña de este álbum
    const existingReview = await Review.findOne({ userId, albumId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede añadir a listenList porque ya has escrito una reseña para este álbum",
      });
    }

    // Verificar si el álbum ya está en listenList para evitar duplicados
    if (usuario.listenList && usuario.listenList.includes(albumId)) {
      return res.status(200).json({
        success: true,
        message: "El álbum ya está en la lista de escucha",
        listenList: usuario.listenList,
      });
    }

    // Añadir el ID del álbum al array de listenList
    if (!usuario.listenList) {
      usuario.listenList = [];
    }
    usuario.listenList.push(albumId);
    await usuario.save();

    return res.status(200).json({
      success: true,
      message: "Álbum añadido a la lista de escucha correctamente",
      listenList: usuario.listenList,
    });
  } catch (error) {
    console.error("Error al añadir álbum a la lista de escucha:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error.message,
    });
  }
};

module.exports = addToListenList;
