const Review = require("../model/reviews");
const Usuario = require("../model/usuario");
const Album = require("../model/albumes");

/**
 * Crea una nueva reseña para un álbum
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const createUpdateReview = async (req, res) => {
  try {
    const { userId, albumId, rating, text, favoriteTracks } = req.body;

    // Validación de datos básicos
    if (!userId || !albumId) {
      return res.status(400).json({
        success: false,
        message: "Se requieren IDs de usuario y álbum",
      });
    }

    // Validar que el rating esté en el rango correcto (si se proporciona)
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "El rating debe estar entre 0 y 5",
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

    // Verificar que el álbum existe
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Álbum no encontrado",
      });
    }

    // Crear una nueva review (sin verificar si ya existe una)
    const newReview = new Review({
      userId,
      albumId,
      rating: rating !== undefined ? rating : 0,
      text: text || "",
      favoriteTracks: favoriteTracks || "",
      createdAt: new Date(), // Asegurar que tiene fecha actual
    });

    const savedReview = await newReview.save();

    // Añadir referencia de la nueva review al usuario
    usuario.reviews.push(savedReview._id);
    await usuario.save();

    // Añadir referencia de la nueva review al álbum
    album.reviews.push(savedReview._id);

    // Incrementar la popularidad del álbum en 1
    album.popularity = (album.popularity || 0) + 1;

    // Actualizar el rating promedio si se proporcionó un rating
    if (rating !== undefined) {
      // Calcular nuevo promedio: ((promedio actual * total ratings) + nuevo rating) / (total ratings + 1)
      const totalRatings = album.totalRatings || 0;
      const currentAverage = album.averageRating || 0;

      album.totalRatings = totalRatings + 1;
      album.averageRating =
        (currentAverage * totalRatings + rating) / album.totalRatings;
    }

    await album.save();

    // Incrementar contador de minutos escuchados
    if (album.duration) {
      usuario.minutesListened += album.duration || 0;
      await usuario.save();
    }

    // Respuesta exitosa
    return res.status(201).json({
      success: true,
      message: "Reseña creada exitosamente",
      review: savedReview,
    });
  } catch (error) {
    console.error("Error al crear reseña:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar la reseña",
      error: error.message,
    });
  }
};

module.exports = createUpdateReview;
