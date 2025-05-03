const Usuario = require("../model/usuario");

/**
 * Obtiene usuarios ordenados por cantidad de reseñas
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const getTopReviewers = async (req, res) => {
  try {
    // Parámetros de paginación opcionales
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const skip = page * limit;

    // Agregar campo con cantidad de reseñas y ordenar
    const topUsers = await Usuario.aggregate([
      // Añadir campo con el tamaño del array de reseñas
      { $addFields: { reviewCount: { $size: "$reviews" } } },
      // Ordenar por cantidad de reseñas (descendente)
      { $sort: { reviewCount: -1 } },
      // Paginación
      { $skip: skip },
      { $limit: limit },
    ]);

    // Total para paginación
    const total = await Usuario.countDocuments();

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      results: topUsers,
    });
  } catch (error) {
    console.error("Error al obtener top usuarios por reseñas:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

module.exports = getTopReviewers;
