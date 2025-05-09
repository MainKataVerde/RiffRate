const Usuario = require("../model/usuario");
const Review = require("../model/reviews");

/**
 * Verifica si un usuario ha realizado una review de un álbum específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const checkUserAlbumReview = async (req, res) => {
  try {
    const { userId, albumId } = req.params;

    if (!userId || !albumId) {
      return res.status(400).json({
        success: false,
        message: "Se requieren IDs de usuario y álbum",
      });
    }

    // Opción 1: Si tienes el modelo Reviews
    // Buscar si existe una review para ese usuario y ese álbum
    const reviewExists = await Review.exists({
      userId: userId,
      albumId: albumId,
    });

    // Opción 2: Si solo tienes los IDs en el array del usuario
    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si alguna review del usuario corresponde al álbum
    // (Esta opción depende de cómo estén estructuradas tus reviews)
    const hasReviewedAlbum = usuario.reviews.some(
      (review) => review.albumId === albumId || review === albumId
    );

    return res.status(200).json({
      success: true,
      hasReviewed: reviewExists ? true : hasReviewedAlbum,
      // También puedes incluir la review si existe
      // review: reviewExists ? await Review.findOne({ userId, albumId }) : null
    });
  } catch (error) {
    console.error("Error al verificar review de álbum:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar si el usuario ha reseñado el álbum",
      error: error.message,
    });
  }
};

module.exports = checkUserAlbumReview;
