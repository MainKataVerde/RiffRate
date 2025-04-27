const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  userId: { type: String, required: true },
  albumId: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  text: { type: String, required: false, default: "" },
  likes: { type: Number, required: false, default: 0 },
  createdAt: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);
