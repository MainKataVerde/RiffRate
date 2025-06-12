const Usuario = require("../model/usuario");

/**
 * Obtiene usuarios ordenados por tiempo de escucha (excluyendo los que tienen 0 minutos)
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
const getTopListeners = async (req, res) => {
  try {
    // Parámetros de paginación opcionales
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const skip = page * limit;

    // Buscar usuarios con minutos escuchados > 0, ordenados por descendente
    const topUsers = await Usuario.find({ minutesListened: { $gt: 0 } })
      .sort({ minutesListened: -1 })
      .skip(skip)
      .limit(limit);

    // Total para paginación (solo usuarios con tiempo de escucha)
    const total = await Usuario.countDocuments({ minutesListened: { $gt: 0 } });

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      results: topUsers,
    });
  } catch (error) {
    console.error("Error al obtener top usuarios por escucha:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

module.exports = getTopListeners;
