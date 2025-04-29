const mongoose = require("mongoose");

const MONGO_URL = "mongodb://localhost:27017/autenticacionLocalYT";

const db = async () => {
  await mongoose
    .connect(MONGO_URL)
    .then(() => console.log("Conectado a la base de datos"))
    .catch((error) => console.error(error));
};

module.exports = db;
