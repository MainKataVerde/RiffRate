const Review = require("../model/reviews");
const Usuario = require("../model/usuario");
const Album = require("../model/albumes");

/**
 * Obtiene reseñas populares por número de likes
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getPopularReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const withText = req.query.withText === "true";
    const shouldPopulate = req.query.populate === "true";

    // Construir query base
    let query = {};

    // Filtrar por texto si se solicita
    if (withText) {
      query.text = { $exists: true, $ne: null, $not: /^\s*$/ };
    }

    // Pipeline de agregación para calcular likesCount
    const aggregationPipeline = [
      { $match: query },
      { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
      { $sort: { likesCount: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // Ejecutar agregación
    let reviews = await Review.aggregate(aggregationPipeline);

    // Si se solicita populate, hacemos lookups manuales en lugar de usar populate
    if (shouldPopulate) {
      // Array para almacenar las promesas de búsqueda
      const lookupPromises = [];

      // Para cada review, buscar su usuario y álbum
      for (const review of reviews) {
        // Buscar usuario
        const userPromise = Usuario.findById(review.userId)
          .select("nombre photo")
          .lean()
          .then((user) => {
            review.user = user; // Añadir los datos de usuario
          })
          .catch(() => {
            review.user = null; // Si no se encuentra, usar null
          });

        // Buscar álbum
        const albumPromise = Album.findById(review.albumId)
          .select("name artist cover released")
          .lean()
          .then((album) => {
            review.album = album; // Añadir los datos de álbum
          })
          .catch(() => {
            review.album = null; // Si no se encuentra, usar null
          });

        // Añadir ambas promesas al array
        lookupPromises.push(userPromise, albumPromise);
      }

      // Esperar a que se completen todas las búsquedas
      await Promise.all(lookupPromises);
    }

    // Contar total para paginación (en una consulta separada)
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
    console.error("Error al obtener reseñas populares:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las reseñas populares",
      error: error.message,
    });
  }
};

module.exports = getPopularReviews;
