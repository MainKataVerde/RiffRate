const mongoose = require("mongoose");
const { Schema } = mongoose;

const AlbumSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  artist: { type: String, required: true },
  cover: { type: String, required: false, default: "" },
  genres: { type: [String], required: false, default: [] },
  tracks: { type: [String], required: false, default: [] },
  producers: { type: [String], required: false, default: [] },
  label: { type: String, required: false, default: "" },
  released: { type: Date, required: false, default: Date.now },
  description: { type: String, required: false, default: "" },
  duration: { type: Number, required: false, default: 0 },
  links: { type: [String], required: false, default: [] },
  reviews: { type: [String], required: false, default: [] },
  popularity: { type: Number, required: false, default: 0 },
  averageRating: { type: Number, required: false, default: 0 },
  totalRatings: { type: Number, required: false, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("Album", AlbumSchema);
