const Review = require("../model/reviews");
const Usuario = require("../model/usuario");

/**
 * Elimina un like de una reseña (quita el ID del usuario del array de likes)
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const removeLikeFromReview = async (req, res) => {
  try {
    const { userId, reviewId } = req.body;

    // Validación de datos básicos
    if (!userId || !reviewId) {
      return res.status(400).json({
        success: false,
        message: "Se requieren IDs de usuario y reseña",
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

    // Verificar que la reseña existe
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Reseña no encontrada",
      });
    }

    // Verificar si el usuario ha dado like a esta reseña
    if (
      !review.likes ||
      !review.likes.some((id) => String(id) === String(userId))
    ) {
      return res.status(400).json({
        success: false,
        message: "El usuario no ha dado like a esta reseña",
      });
    }

    // Quitar el ID del usuario del array de likes
    review.likes = review.likes.filter((id) => String(id) !== String(userId));

    // Actualizar el contador de likes para ordenamiento
    review.likesCount = review.likes.length;

    // Guardar la reseña actualizada
    await review.save();

    return res.status(200).json({
      success: true,
      message: "Like eliminado correctamente",
      likesCount: review.likesCount,
      likes: review.likes,
    });
  } catch (error) {
    console.error("Error al quitar like de reseña:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error.message,
    });
  }
};

module.exports = removeLikeFromReview;
