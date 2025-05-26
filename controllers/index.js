const register = require("./register");
const login = require("./login");
const getUserById = require("./getUserByid");
const searchAll = require("./searchALL");
const getPopularAlbums = require("./getPopularAlbums");
const filterAlbums = require("./filterAlbums");
const getFriendsPopularAlbums = require("./getFriendsPopularAlbums");
const addFriend = require("./addFriend");
const checkFriendship = require("./checkFriendship");
const getTopListeners = require("./getTopListeners");
const getTopReviwers = require("./getTopReviwers");
const getAlbum = require("./getAlbum");
const getArtistByName = require("./getArtistByName");
const getUserReviewsList = require("./getUserReviewsList");
const checkUserAlbumReview = require("./checkUserAlbumReview");
const createUpdateReview = require("./createUpdateReview");
const getAlbumReviewByUserId = require("./getAlbumReviewByUserId");
const addToLikes = require("./addToLikes");
const checkUserLiked = require("./checkUserLiked");
const deleteFromLikes = require("./deleteFromLikes");
const addToListenList = require("./addToListenList");
const checkUserListenList = require("./checkUserListenList");
const getAlbumReviewsWithText = require("./getAlbumReviewsWithText");
const getUsersWithAlbumInListenList = require("./getUsersWithAlbumInListenList");
const getFriendsAlbumReviewsWithText = require("./getFriendsAlbumReviewsWithText");
const getSimilarAlbums = require("./getSimilarAlbums");
const getPopularReviews = require("./getPopularReviews");
const getFriendReviews = require("./getFriendReviews");
const addLikeToReview = require("./addLikeToReview");
const getArtistById = require("./getArtitsById");
const getUserFriends = require("./getUserFriends");

module.exports = {
  getUserById,
  register,
  login,
  searchAll,
  getPopularAlbums,
  filterAlbums,
  getFriendsPopularAlbums,
  addFriend,
  checkFriendship,
  getTopListeners,
  getTopReviwers,
  getAlbum,
  getArtistByName,
  getUserReviewsList,
  checkUserAlbumReview,
  createUpdateReview,
  getAlbumReviewByUserId,
  addToLikes,
  checkUserLiked,
  deleteFromLikes,
  addToListenList,
  checkUserListenList,
  getAlbumReviewsWithText,
  getUsersWithAlbumInListenList,
  getFriendsAlbumReviewsWithText,
  getSimilarAlbums,
  getPopularReviews,
  getFriendReviews,
  addLikeToReview,
  getArtistById,
  getUserFriends,
};
