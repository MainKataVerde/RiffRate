const Usuario = require("../model/usuario");

/**
 * Devuelve solo los amigos del usuario que tienen un álbum en su listenList, ordenados por número de likes (descendente)
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getUsersWithAlbumInListenList = async (req, res) => {
  try {
    const { albumId, userId } = req.params;

    if (!albumId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Se requieren los IDs de usuario y álbum",
      });
    }

    // Obtener el usuario para acceder a su lista de amigos
    const usuario = await Usuario.findById(userId).lean();
    if (!usuario || !usuario.friends) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado o sin amigos",
      });
    }

    // Buscar solo los amigos que tengan el álbum en su listenList
    const users = await Usuario.find({
      _id: { $in: usuario.friends },
      listenList: albumId,
    }).lean();

    // Ordenar manualmente por número de likes (descendente)
    users.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error al obtener amigos con el álbum en listenList:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};

module.exports = getUsersWithAlbumInListenList;
