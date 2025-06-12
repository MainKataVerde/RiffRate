const Usuario = require("../model/usuario");

/**
 * Añade un álbum a la lista de álbumes favoritos del usuario (máximo 4)
 * Endpoint directo con albumId en la URL
 */
const addFavoriteAlbumDirect = async (req, res) => {
  try {
    const { userId, albumId } = req.params; // Extraer de params en lugar de body

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

    // Inicializar array de álbumes favoritos si no existe
    if (!user.favoriteAlbums) {
      user.favoriteAlbums = [];
    }

    // Verificar si el álbum ya está en favoritos
    if (user.favoriteAlbums.includes(albumId)) {
      return res.status(200).json({
        success: true,
        message: "Este álbum ya está en tus favoritos",
        favoriteAlbums: user.favoriteAlbums,
      });
    }

    // Verificar si ya tiene 4 álbumes favoritos
    if (user.favoriteAlbums.length >= 4) {
      return res.status(400).json({
        success: false,
        message: "Ya tienes 4 álbumes favoritos. Elimina uno para añadir otro.",
        favoriteAlbums: user.favoriteAlbums,
      });
    }

    // Añadir álbum a favoritos
    user.favoriteAlbums.push(albumId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Álbum añadido a favoritos correctamente",
      favoriteAlbums: user.favoriteAlbums,
    });
  } catch (error) {
    console.error("Error al añadir álbum a favoritos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al añadir álbum a favoritos",
      error: error.message,
    });
  }
};

module.exports = addFavoriteAlbumDirect;
