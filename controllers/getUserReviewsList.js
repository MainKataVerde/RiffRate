const Usuario = require("../model/usuario");
const Review = require("../model/reviews");
const Album = require("../model/albumes");

/**
 * Obtiene la lista de reviews de un usuario específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getUserReviewsList = async (req, res) => {
  try {
    const { userId } = req.params;
    // Parámetros opcionales
    const limit = parseInt(req.query.limit) || 0; // 0 = sin límite
    const withText = req.query.withText === "true"; // Filtrar por las que tienen texto
    const sortBy = req.query.sortBy || "date"; // Ordenar por fecha por defecto

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario",
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

    // Construir consulta base
    let query = { userId };

    // Si se pide filtrar por las que tienen texto
    if (withText) {
      query.text = { $exists: true, $ne: null, $not: /^\s*$/ };
    }

    // Buscar directamente reviews por userId (más eficiente)
    let reviewsQuery = Review.find(query);

    // Aplicar ordenamiento
    switch (sortBy) {
      case "rating":
        reviewsQuery = reviewsQuery.sort({ rating: -1 });
        break;
      case "likes":
        reviewsQuery = reviewsQuery.sort({ likesCount: -1 });
        break;
      case "date":
      default:
        reviewsQuery = reviewsQuery.sort({ createdAt: -1 });
        break;
    }

    // Aplicar límite si existe
    if (limit > 0) {
      reviewsQuery = reviewsQuery.limit(limit);
    }

    // Ejecutar consulta y obtener reviews
    const reviews = await reviewsQuery.lean();

    // Si no hay reviews, devolver array vacío
    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        reviews: [],
      });
    }

    // Enriquecer las reviews con datos de álbumes
    const enrichedReviews = [];

    for (const review of reviews) {
      try {
        // Buscar datos del álbum
        const album = await Album.findById(review.albumId)
          .select("name artist cover released")
          .lean();

        // Añadir review enriquecida
        enrichedReviews.push({
          ...review,
          likesCount: review.likes ? review.likes.length : 0,
          favoriteTrack: review.favoriteTracks, // Mapear al nombre singular para el frontend
          albumId: album || {
            _id: review.albumId,
            name: "Álbum desconocido",
            artist: "Artista desconocido",
            cover: "/public/default-album.png",
          },
        });
      } catch (err) {
        console.error(`Error procesando review ${review._id}:`, err);
        // Incluir la review incluso con error, para no perder datos
        enrichedReviews.push({
          ...review,
          likesCount: review.likes ? review.likes.length : 0,
          favoriteTrack: review.favoriteTracks,
          albumId: {
            _id: review.albumId,
            name: "Error al cargar álbum",
            artist: "Desconocido",
            cover: "/public/default-album.png",
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: enrichedReviews.length,
      reviews: enrichedReviews,
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
