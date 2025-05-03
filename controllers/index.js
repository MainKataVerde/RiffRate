const register = require("./register");
const login = require("./login");
const getUserById = require("./getUserByid");
const getAlbumByName = require("./getAlbumByName");
const searchAll = require("./searchALL");
const getPopularAlbums = require("./getPopularAlbums");
const filterAlbums = require("./filterAlbums");
const getFriendsPopularAlbums = require("./getFriendsPopularAlbums");
const addFriend = require("./addFriend");
const checkFriendship = require("./checkFriendship");
const getTopListeners = require("./getTopListeners");
const getTopReviwers = require("./getTopReviwers");

module.exports = {
  getUserById,
  register,
  login,
  getAlbumByName,
  searchAll,
  getPopularAlbums,
  filterAlbums,
  getFriendsPopularAlbums,
  addFriend,
  checkFriendship,
  getTopListeners,
  getTopReviwers,
};
