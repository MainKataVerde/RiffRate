const mongoose = require("mongoose");
const { Schema } = mongoose;

const ArtistSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  bio: { type: String, required: false, default: "" },
  photo: { type: String, required: false, default: "" },
  genres: { type: [String], required: false, default: [] },
  albums: { type: [String], required: false, default: [] },
  createdAt: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("Artist", ArtistSchema);
