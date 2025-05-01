const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const Usuario = require("../model/usuario");
const Album = require("../model/albumes");
const List = require("../model/lists");
const { v4: uuidv4 } = require("uuid");

// Conexión a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Función principal para generar datos de prueba
const generateTestData = async () => {
  try {
    // 1. Obtener todos los usuarios y álbumes
    const users = await Usuario.find();
    const albums = await Album.find();

    if (users.length < 3) {
      console.error("Necesitas al menos 3 usuarios en la base de datos");
      return;
    }

    if (albums.length < 10) {
      console.error("Necesitas al menos 10 álbumes en la base de datos");
      return;
    }

    console.log(`Generando datos de prueba para ${users.length} usuarios...`);

    // 2. Para cada usuario, asignar amigos aleatorios
    for (const user of users) {
      // Crear lista potencial de amigos (excluyendo al usuario actual)
      const potentialFriends = users
        .filter((u) => u._id.toString() !== user._id.toString())
        .map((u) => u._id);

      // Seleccionar número aleatorio de amigos (1-5)
      const numFriends = Math.floor(Math.random() * 5) + 1;

      // Asignar amigos aleatorios
      user.friends = [];
      for (let i = 0; i < numFriends && i < potentialFriends.length; i++) {
        const randomIndex = Math.floor(Math.random() * potentialFriends.length);
        const friendId = potentialFriends[randomIndex];

        // Evitar duplicados
        if (!user.friends.includes(friendId)) {
          user.friends.push(friendId);
        }

        // Eliminar este amigo de los potenciales para evitar duplicados
        potentialFriends.splice(randomIndex, 1);
      }

      // 3. Asignar álbumes favoritos aleatorios (5-15)
      const numFavorites = Math.floor(Math.random() * 10) + 5;
      user.favoriteAlbums = [];

      for (let i = 0; i < numFavorites; i++) {
        const randomAlbum = albums[Math.floor(Math.random() * albums.length)];

        // Evitar duplicados
        if (!user.favoriteAlbums.includes(randomAlbum._id)) {
          user.favoriteAlbums.push(randomAlbum._id);
        }
      }

      // 4. Crear una lista para cada usuario
      const newList = new List({
        _id: uuidv4(),
        name: `Lista favorita de ${user.nombre}`,
        description: "Mis álbumes favoritos de todos los tiempos",
        user: user._id,
        isPublic: Math.random() > 0.3, // 70% probabilidad de ser pública
        albums: user.favoriteAlbums.slice(0, 5), // Añadir los primeros 5 álbumes favoritos
      });

      await newList.save();

      // Añadir la lista al usuario
      user.lists = [newList._id];

      // Crear lista de escucha (listen list)
      user.listenList = albums
        .slice(0, Math.floor(Math.random() * 8) + 3)
        .map((a) => a._id);

      // Guardar los cambios
      await user.save();
      console.log(`Datos generados para usuario: ${user.nombre}`);
    }

    console.log("¡Datos de prueba generados con éxito!");
  } catch (error) {
    console.error("Error generando datos de prueba:", error);
  }
};

// Ejecutar el script
connectDB()
  .then(async () => {
    await generateTestData();
    console.log("Script finalizado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error en el script:", err);
    process.exit(1);
  });
