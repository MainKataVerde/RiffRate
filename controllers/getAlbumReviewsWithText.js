const Review = require("../model/reviews");

/**
 * Obtiene todas las reseñas con texto para un álbum específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getAlbumReviewsWithText = async (req, res) => {
  try {
    const { albumId } = req.params;

    if (!albumId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del álbum",
      });
    }

    // Busca reviews del álbum cuyo campo text no sea vacío ni solo espacios
    const reviews = await Review.find({
      albumId,
      text: { $exists: true, $ne: null, $not: /^\s*$/ },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error al obtener reseñas con texto:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las reseñas con texto",
      error: error.message,
    });
  }
};

module.exports = getAlbumReviewsWithText;
