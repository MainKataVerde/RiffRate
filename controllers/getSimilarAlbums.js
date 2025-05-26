const Album = require("../model/albumes");

/**
 * Obtiene álbumes similares a un álbum específico
 * Primero busca álbumes de otros artistas con géneros similares
 * Si no encuentra suficientes, busca álbumes del mismo artista
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getSimilarAlbums = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 6; // Máximo de álbumes a devolver

    // Buscar el álbum original
    const originalAlbum = await Album.findById(id).lean();
    if (!originalAlbum) {
      return res.status(404).json({
        success: false,
        message: "Álbum no encontrado",
      });
    }

    // Buscar álbumes con géneros similares de otros artistas
    const similarAlbums = await Album.find({
      genres: { $in: originalAlbum.genres },
      artist: { $ne: originalAlbum.artist }, // Excluir el mismo artista
      _id: { $ne: id }, // También excluir el álbum original por seguridad
    })
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();

    // Si no encontramos suficientes álbumes similares de otros artistas,
    // buscar álbumes del mismo artista como fallback
    let combinedAlbums = [...similarAlbums];

    if (similarAlbums.length < limit) {
      const remainingSlots = limit - similarAlbums.length;

      // Buscar álbumes del mismo artista con géneros similares
      const sameArtistAlbums = await Album.find({
        genres: { $in: originalAlbum.genres },
        artist: originalAlbum.artist,
        _id: { $ne: id }, // Excluir el álbum original
      })
        .sort({ popularity: -1 })
        .limit(remainingSlots)
        .lean();

      // Añadir álbumes del mismo artista a los resultados
      combinedAlbums = [...similarAlbums, ...sameArtistAlbums];
    }

    return res.status(200).json({
      success: true,
      count: combinedAlbums.length,
      albums: combinedAlbums,
    });
  } catch (error) {
    console.error("Error al obtener álbumes similares:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener álbumes similares",
      error: error.message,
    });
  }
};

module.exports = getSimilarAlbums;
