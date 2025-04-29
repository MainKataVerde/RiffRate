const register = require("./register");
const login = require("./login");
const getUserById = require("./getUserByid");
const getAlbumByName = require("./getAlbumByName");
const searchAll = require("./searchALL");
const getPopularAlbums = require("./getPopularAlbums");

module.exports = {
  getUserById,
  register,
  login,
  getAlbumByName,
  searchAll,
  getPopularAlbums,
};
