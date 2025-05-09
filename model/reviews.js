const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  userId: { type: String, required: true },
  albumId: { type: String, required: true },
  rating: { type: Number, required: false, min: 0, max: 5 },
  text: { type: String, required: false, default: "" },
  likes: { type: [String], required: false, default: [] },
  favoriteTracks: { type: String, required: false, default: "" },
  createdAt: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);
