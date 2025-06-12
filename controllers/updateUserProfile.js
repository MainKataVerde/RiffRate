const Usuario = require("../model/usuario");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

console.log("CLOUDINARY CONFIG CHECK:");
console.log("Cloud name available:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key available:", !!process.env.CLOUDINARY_API_KEY);
console.log("API secret available:", !!process.env.CLOUDINARY_API_SECRET);

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Tipo de archivo no permitido. Sube JPG, PNG o WebP")
      );
    }
    cb(null, true);
  },
}).single("photo");

/**
 * Actualiza el perfil de un usuario, incluyendo la foto de perfil
 */
const updateUserProfile = async (req, res) => {
  // Usar multer como middleware para manejar la carga de archivos
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { userId } = req.params;
      const { nombre, email, bio } = req.body;

      // Validar que el usuario existe
      const user = await Usuario.findById(userId);
      if (!user) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      // Datos a actualizar
      const updateData = {};

      // Verificar si el nombre ya está en uso por otro usuario
      if (nombre && nombre !== user.nombre) {
        const existingUser = await Usuario.findOne({
          nombre: nombre,
          _id: { $ne: userId }, // Excluir al usuario actual de la búsqueda
        });

        if (existingUser) {
          // Eliminar archivo temporal si existe
          if (req.file) fs.unlinkSync(req.file.path);

          return res.status(400).json({
            success: false,
            message: "Este nombre de usuario ya está en uso",
          });
        }

        updateData.nombre = nombre;
      }

      // Actualizar el resto de campos de texto
      if (email) updateData.email = email;
      if (bio !== undefined) updateData.bio = bio;

      // Procesar la foto si se proporciona
      if (req.file) {
        try {
          // Subir imagen a Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "riffrate/users",
            transformation: [
              { width: 500, height: 500, crop: "fill" },
              { quality: "auto:good" },
            ],
          });

          // Eliminar archivo temporal
          fs.unlinkSync(req.file.path);

          // Guardar URL de la imagen
          updateData.photo = result.secure_url;
          updateData.photoPublicId = result.public_id;

          // Si el usuario ya tenía una foto, eliminarla
          if (user.photoPublicId) {
            await cloudinary.uploader
              .destroy(user.photoPublicId)
              .catch((err) =>
                console.error("Error al eliminar imagen anterior:", err)
              );
          }
        } catch (uploadError) {
          fs.unlinkSync(req.file.path);
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }
      }

      // Solo actualizar si hay cambios
      if (Object.keys(updateData).length === 0) {
        return res.status(200).json({
          success: true,
          message: "No se realizaron cambios",
          user: user,
        });
      }

      // Actualizar usuario en la base de datos
      const updatedUser = await Usuario.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      return res.status(200).json({
        success: true,
        message: "Perfil actualizado correctamente",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el perfil",
        error: error.message,
      });
    }
  });
};

module.exports = updateUserProfile;
