const Review = require("../model/reviews");
const Usuario = require("../model/usuario");
const Album = require("../model/albumes");

/**
 * Obtiene todas las reseñas que un usuario ha hecho para un álbum específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getAlbumReviewByUserId = async (req, res) => {
  try {
    const { userId, albumId } = req.params;

    // Validación de parámetros
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

    // Buscar todas las reseñas específicas, ordenadas por fecha (más recientes primero)
    const reviews = await Review.find({ userId, albumId }).sort({
      createdAt: -1,
    });

    // Si no hay reseñas para este usuario y álbum
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron reseñas de este usuario para este álbum",
      });
    }

    // Devolver las reseñas encontradas
    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error al obtener reseñas del usuario para el álbum:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las reseñas",
      error: error.message,
    });
  }
};

module.exports = getAlbumReviewByUserId;
