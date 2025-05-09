const mongoose = require("mongoose");
const lists = require("./lists");
const { Schema } = mongoose;

const UsuarioSchema = new Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: {
    type: String,
    required: false,
    default: "/public/default_photo.jpg",
  },
  bio: { type: String, required: false, default: "" },
  minutesListened: { type: Number, required: false, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
  friends: { type: [String], required: false, default: [] },
  favoriteAlbums: { type: [String], required: false, default: [] },
  lists: { type: [String], required: false, default: [] },
  likes: { type: [String], required: false, default: [] },
  listenList: { type: [String], required: false, default: [] },
  reviews: { type: [String], required: false, default: [] },
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
