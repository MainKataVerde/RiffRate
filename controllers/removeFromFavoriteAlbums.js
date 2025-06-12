const Usuario = require("../model/usuario");

/**
 * Elimina un álbum de la lista de álbumes favoritos del usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const removeFromFavoriteAlbum = async (req, res) => {
  try {
    const { userId } = req.params;
    const { albumId } = req.body; // Cambiado de songId a albumId

    if (!userId || !albumId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del usuario y del álbum",
      });
    }

    // Verificar que el usuario existe
    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el usuario tiene este álbum en favoritos
    if (!user.favoriteAlbums || !user.favoriteAlbums.includes(albumId)) {
      return res.status(400).json({
        success: false,
        message: "Este álbum no está en tus favoritos",
      });
    }

    // Eliminar álbum de favoritos
    user.favoriteAlbums = user.favoriteAlbums.filter((id) => id !== albumId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Álbum eliminado de favoritos correctamente",
      favoriteAlbums: user.favoriteAlbums,
    });
  } catch (error) {
    console.error("Error al eliminar álbum de favoritos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar álbum de favoritos",
      error: error.message,
    });
  }
};

module.exports = removeFromFavoriteAlbum;
