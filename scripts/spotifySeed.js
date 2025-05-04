const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
// Importa tus modelos
const Album = require("../model/albumes");
const Artist = require("../model/artist");

// --- FUNCIÓN PARA OBTENER BIO DE LAST.FM ---
async function fetchArtistBioFromLastFM(artistName) {
  const apiKey = process.env.LASTFM_API_KEY;
  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(
    artistName
  )}&api_key=${apiKey}&format=json`;
  try {
    const res = await axios.get(url);
    return res.data.artist?.bio?.summary || "";
  } catch (err) {
    console.warn(`No se pudo obtener bio de Last.fm para ${artistName}`);
    return "";
  }
}

// --- FUNCIÓN PARA OBTENER DESCRIPCIÓN DE ÁLBUM DE LAST.FM ---
async function fetchAlbumInfoFromLastFM(artistName, albumName) {
  const apiKey = process.env.LASTFM_API_KEY;
  const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(
    artistName
  )}&album=${encodeURIComponent(albumName)}&api_key=${apiKey}&format=json`;

  try {
    const res = await axios.get(url);
    return {
      description: res.data.album?.wiki?.summary || "",
      tags: res.data.album?.tags?.tag?.map((tag) => tag.name) || [],
    };
  } catch (err) {
    console.warn(
      `No se pudo obtener info de Last.fm para álbum ${albumName} de ${artistName}`
    );
    return { description: "", tags: [] };
  }
}

// Conexión a la base de datos
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
};

// Obtener token de acceso
async function getToken() {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
}

// Buscar artista y álbumes
async function fetchArtistAndAlbums(artistName, token) {
  try {
    console.log(`Procesando artista: ${artistName}`);

    const artistSearch = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        artistName
      )}&type=artist&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const artist = artistSearch.data.artists.items[0];
    if (!artist) {
      console.log(`Artista no encontrado: ${artistName}`);
      return;
    }

    // Verificar si el artista ya existe
    const existingArtist = await Artist.findById(artist.id);
    if (existingArtist) {
      console.log(`Artista ya existe en DB: ${artistName}`);
      return;
    }

    // --- OBTENER BIO DE LAST.FM ---
    const bio = await fetchArtistBioFromLastFM(artist.name);

    const artistDoc = await Artist.create({
      _id: artist.id,
      name: artist.name,
      bio: bio,
      photo: artist.images[0]?.url || "",
      genres: artist.genres,
      albums: [],
      createdAt: new Date(),
    });

    const albumsRes = await axios.get(
      `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    for (const album of albumsRes.data.items) {
      try {
        const albumTracksRes = await axios.get(
          `https://api.spotify.com/v1/albums/${album.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // --- OBTENER DESCRIPCIÓN DE ÁLBUM DE LAST.FM ---
        const { description, tags } = await fetchAlbumInfoFromLastFM(
          artist.name,
          album.name
        );

        const trackNames = albumTracksRes.data.tracks.items.map((t) => t.name);
        const totalDuration = albumTracksRes.data.tracks.items.reduce(
          (acc, t) => acc + t.duration_ms,
          0
        );

        await Album.create({
          _id: album.id,
          name: album.name,
          artist: artist.name,
          cover: album.images[0]?.url || "",
          genres: artist.genres,
          description: description, // <-- Añadida la descripción del álbum
          tracks: trackNames,
          producers: album.artists.map((a) => a.name),
          label: album.label || "",
          released: new Date(album.release_date),
          duration: Math.round(totalDuration / 1000 / 60),
          links: [album.external_urls.spotify],
          reviews: [],
          popularity: 0,
          createdAt: new Date(),
        });

        artistDoc.albums.push(album.id);
      } catch (error) {
        console.error(`Error procesando álbum ${album.name}:`, error.message);
      }
    }

    await artistDoc.save();
    console.log(`Artista completado: ${artistName}`);
  } catch (error) {
    console.error(`Error procesando artista ${artistName}:`, error.message);
  }
}

// Función para leer artistas desde archivo
async function readArtistsFromFile() {
  const filePath = path.join(__dirname, "artistas.txt");
  const data = await fs.promises.readFile(filePath, "utf-8");
  return data.split("\n").filter((artist) => artist.trim() !== "");
}

// Lanzar todo
(async () => {
  try {
    await connectDB();
    const token = await getToken();
    const artistas = await readArtistsFromFile();

    console.log(`Total artistas a procesar: ${artistas.length}`);

    // Procesar en lotes para evitar sobrecargar la API
    const batchSize = 5;
    for (let i = 0; i < artistas.length; i += batchSize) {
      const batch = artistas.slice(i, i + batchSize);
      await Promise.all(
        batch.map((artist) => fetchArtistAndAlbums(artist.trim(), token))
      );
      console.log(`Lote completado: ${i + batchSize}/${artistas.length}`);
      // Pequeña pausa entre lotes
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("Proceso completado");
  } catch (error) {
    console.error("Error general:", error);
  } finally {
    mongoose.disconnect();
  }
})();
