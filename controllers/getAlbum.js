const Album = require("../model/albumes");

/**
 * Obtiene información detallada de un álbum por su ID
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;

    // Usar findOne en lugar de findById para mayor compatibilidad
    // con diferentes tipos de ID (ObjectId o String)
    const album = await Album.findOne({ _id: albumId });

    // Verificar si el álbum existe
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Álbum no encontrado",
      });
    }

    // Si se encuentra, devolver la información
    return res.status(200).json({
      success: true,
      album,
    });
  } catch (error) {
    console.error("Error al obtener información del álbum:", error);

    // Manejo genérico de errores
    return res.status(500).json({
      success: false,
      message: "Error al obtener información del álbum",
      error: error.message,
    });
  }
};

module.exports = getAlbum;
