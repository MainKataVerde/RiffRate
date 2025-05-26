const Review = require("../model/reviews");
const Usuario = require("../model/usuario");

/**
 * Obtiene reseñas con texto de los amigos del usuario, ordenadas por número de likes
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getFriendReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario",
      });
    }

    // Obtener la lista de amigos del usuario
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Si el usuario no tiene amigos, devolver array vacío
    if (!usuario.friends || usuario.friends.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        totalPages: 0,
        currentPage: page,
        reviews: [],
      });
    }

    // Consulta para obtener reseñas con texto de amigos, ordenadas por likes
    const query = {
      userId: { $in: usuario.friends },
      text: { $exists: true, $ne: null, $not: /^\s*$/ },
    };

    // Buscar reseñas ordenadas por likesCount
    const reviews = await Review.find(query)
      .sort({ likesCount: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name photo")
      .populate("albumId", "name artist cover")
      .lean();

    // Obtener el total para la paginación
    const total = await Review.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      reviews,
    });
  } catch (error) {
    console.error("Error al obtener reseñas de amigos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las reseñas de amigos",
      error: error.message,
    });
  }
};

module.exports = getFriendReviews;
