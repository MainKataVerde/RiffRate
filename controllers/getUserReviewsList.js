const Usuario = require("../model/usuario");
const Review = require("../model/reviews"); // Asumiendo que tienes un modelo Review

/**
 * Obtiene la lista de reviews de un usuario específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getUserReviewsList = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario",
      });
    }

    // Buscar el usuario
    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Si no tiene reviews, devolver array vacío
    if (!usuario.reviews || usuario.reviews.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        reviews: [],
      });
    }

    // Buscar todas las reviews del usuario
    const reviews = await Review.find({
      _id: { $in: usuario.reviews },
    }).populate("albumId", "name cover artist"); // Obtener datos básicos del álbum

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error al obtener reviews del usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las reviews del usuario",
      error: error.message,
    });
  }
};

module.exports = getUserReviewsList;
