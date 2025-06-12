const Review = require("../model/reviews");
const Usuario = require("../model/usuario");
const Album = require("../model/albumes");

/**
 * Obtiene una reseña por su ID con datos de usuario y álbum
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID de la reseña",
      });
    }

    // Buscar la reseña por ID
    const review = await Review.findById(reviewId).lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Reseña no encontrada",
      });
    }

    // Buscar datos del usuario
    const user = await Usuario.findById(review.userId)
      .select("name photo")
      .lean();

    // Buscar datos del álbum
    const album = await Album.findById(review.albumId)
      .select("name artist cover released")
      .lean();

    // Crear objeto enriquecido para el frontend
    const enrichedReview = {
      ...review,
      likesCount: review.likes ? review.likes.length : 0,
      favoriteTrack: review.favoriteTracks, // Mapear al nombre singular que espera el frontend
      userId: user || { _id: review.userId }, // Proporcionar objeto incluso si no se encuentra el usuario
      albumId: album || { _id: review.albumId }, // Proporcionar objeto incluso si no se encuentra el álbum
    };

    return res.status(200).json({
      success: true,
      review: enrichedReview,
    });
  } catch (error) {
    console.error("Error al obtener reseña por ID:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la reseña",
      error: error.message,
    });
  }
};

module.exports = getReviewById;
