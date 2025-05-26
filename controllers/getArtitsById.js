const Artist = require("../model/artist");
const Album = require("../model/albumes");
const Review = require("../model/reviews");

/**
 * Devuelve toda la información de un artista por su ID
 * Si se proporciona userId, incluye estadísticas de escucha
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getArtistById = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { userId } = req.query; // userId es opcional como parámetro de consulta

    if (!artistId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del artista",
      });
    }

    // Obtener información del artista
    const artist = await Artist.findById(artistId).lean();

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artista no encontrado",
      });
    }

    // Adaptar los campos para el frontend
    artist.biography = artist.bio || ""; // Añadir el campo biography que espera el frontend

    // Obtener información completa de los álbumes para responder directamente
    let albumsData = [];
    if (artist.albums && artist.albums.length > 0) {
      albumsData = await Album.find({ _id: { $in: artist.albums } })
        .select("name cover released popularity")
        .lean();
    }

    // Respuesta base con artista y álbumes
    const response = {
      success: true,
      artist,
      albums: albumsData,
    };

    // Si se proporcionó userId, añadir estadísticas de escucha
    if (userId) {
      // Valores por defecto en caso de no tener álbumes
      let statistics = {
        totalAlbums: 0,
        listenedAlbums: 0,
        percentage: 0,
        listenedAlbumsList: [],
      };

      // Si el artista tiene álbumes, calcular estadísticas
      if (artist.albums && artist.albums.length > 0) {
        // Obtener álbumes ÚNICOS reseñados por el usuario (sin duplicados)
        const distinctAlbumIds = await Review.distinct("albumId", {
          userId: userId,
          albumId: { $in: artist.albums },
        });

        // Calcular estadísticas con álbumes únicos
        const totalAlbums = artist.albums.length;
        const listenedAlbums = distinctAlbumIds.length;
        const percentage = Math.round((listenedAlbums / totalAlbums) * 100);

        // Obtener información básica de los álbumes escuchados
        const listenedAlbumsList = await Album.find({
          _id: { $in: distinctAlbumIds },
        })
          .select("name cover released")
          .lean();

        statistics = {
          totalAlbums,
          listenedAlbums,
          percentage,
          listenedAlbumsList,
        };
      }

      // Añadir estadísticas a la respuesta
      response.listeningStats = statistics;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener artista por ID:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener el artista",
      error: error.message,
    });
  }
};

module.exports = getArtistById;
