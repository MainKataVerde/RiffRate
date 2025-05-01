const mongoose = require("mongoose");
const { Schema } = mongoose;

const ListSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  cover: { type: String, default: "" },
  albums: [{ type: String, ref: "Album" }],
  user: { type: String, ref: "Usuario", required: true },
  isPublic: { type: Boolean, default: false },
  links: { type: [String], required: false, default: [] },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware para actualizar la fecha de modificación
ListSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("List", ListSchema);
