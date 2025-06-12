const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database/db");
const controllers = require("./controllers");

app.use(cors());
app.use(express.json());

//posts
app.post("/friends/add", controllers.addFriend);
app.post("/register", controllers.register);
app.post("/login", controllers.login);
app.post("/reviews/create", controllers.createUpdateReview);
app.post("/likes/add", controllers.addToLikes);
app.post("/likes/remove", controllers.deleteFromLikes);
app.post("/listenlist/add", controllers.addToListenList);
app.post("/reviews/like/add", controllers.addLikeToReview);
app.post("/user/:userId/unfollow", controllers.unfollowUser);
app.post("/user/:userId/favorite/:albumId", controllers.addFavoriteAlbumDirect);
app.post(
  "/user/:userId/songs/favorites/remove",
  controllers.removeFromFavoriteAlbum
);
app.post("/reviews/like/remove", controllers.removeLikeFromReview);

//gets
app.get("/user/:userId", controllers.getUserById);
app.get("/search/:query", controllers.searchAll);
app.get("/popular", controllers.getPopularAlbums);
app.get("/albums", controllers.filterAlbums);
app.get("/popular/friends/:userId", controllers.getFriendsPopularAlbums);
app.get("/friends/check/:userId/:friendId", controllers.checkFriendship);
app.get("/topListeners", controllers.getTopListeners);
app.get("/topReviewers", controllers.getTopReviwers);
app.get("/topReviewers", controllers.getTopReviwers);
app.get("/album/:albumId", controllers.getAlbum);
app.get("/artistName/:artistName", controllers.getArtistByName);
app.get("/user/:userId/reviews", controllers.getUserReviewsList);
app.get(
  "/user/:userId/album/:albumId/hasReview",
  controllers.checkUserAlbumReview
);
app.get(
  "/user/:userId/album/:albumId/inListenList",
  controllers.checkUserListenList
);
app.get(
  "/user/:userId/album/:albumId/review",
  controllers.getAlbumReviewByUserId
);
app.get("/user/:userId/album/:albumId/liked", controllers.checkUserLiked);
app.get("/album/:albumId/reviewsWithText", controllers.getAlbumReviewsWithText);
app.get(
  "/album/:albumId/listenListFriends/:userId",
  controllers.getUsersWithAlbumInListenList
);
app.get(
  "/album/:albumId/friendsReviewsWithText/:userId",
  controllers.getFriendsAlbumReviewsWithText
);
app.get("/album/:id/similar", controllers.getSimilarAlbums);
app.get("/reviews/popular", controllers.getPopularReviews);
app.get("/artist/:artistId", controllers.getArtistById);
app.get("/user/:userId/friends", controllers.getUserFriends);
app.get("/review/:reviewId", controllers.getReviewById);
app.get("/user/:userId/friends/reviews", controllers.getFriendReviews);
app.get(
  "/user/:userId/review/:reviewId/hasLiked",
  controllers.checkUserReviewLike
);

//put
app.put("/user/:userId", controllers.updateUserProfile);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
  db();
});

module.exports = app;
