const Review = require("../model/reviews");
const Usuario = require("../model/usuario");

/**
 * Devuelve las reseñas con texto de los amigos para un álbum específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getFriendsAlbumReviewsWithText = async (req, res) => {
  try {
    const { userId, albumId } = req.params;

    if (!userId || !albumId) {
      return res.status(400).json({
        success: false,
        message: "Se requieren los IDs de usuario y álbum",
      });
    }

    // Obtener la lista de amigos del usuario
    const usuario = await Usuario.findById(userId);
    if (!usuario || !usuario.friends) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado o sin amigos",
      });
    }

    // Buscar reseñas de los amigos con texto no vacío
    const reviews = await Review.find({
      albumId,
      userId: { $in: usuario.friends },
      text: { $exists: true, $ne: null, $not: /^\s*$/ },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error al obtener reseñas con texto de amigos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las reseñas de amigos",
      error: error.message,
    });
  }
};

module.exports = getFriendsAlbumReviewsWithText;
