const Review = require("../model/reviews");
const Usuario = require("../model/usuario");

/**
 * Verifica si un usuario ha dado like a una reseña específica
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
// Modificar el controlador checkUserReviewLike.js
// Corrección para el controlador checkUserReviewLike.js
const checkUserReviewLike = async (req, res) => {
  try {
    const { userId, reviewId } = req.params;

    // Validación básica omitida por brevedad...
    console.log("Verificando like: userId =", userId, "reviewId =", reviewId);

    // Verificar que la reseña existe
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Reseña no encontrada",
      });
    }

    // Depuración para ver qué contiene review.likes
    console.log("Contenido de review.likes:", review.likes);
    console.log(
      "Tipos:",
      review.likes.map((id) => typeof id)
    );

    // IMPORTANTE: Convertir ambos a string para comparación consistente
    const hasLiked =
      review.likes && review.likes.some((id) => String(id) === String(userId));
    console.log("¿Ha dado like?", hasLiked);

    return res.status(200).json({
      success: true,
      hasLiked: hasLiked,
    });
  } catch (error) {
    console.error("Error al verificar like de reseña:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error.message,
    });
  }
};

module.exports = checkUserReviewLike;
