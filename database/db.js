const mongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/autenticacionLocalYT";

const db = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("Error de conexión a MongoDB:", error);
  }
};

module.exports = db;
