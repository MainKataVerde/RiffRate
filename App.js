const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database/db");
const controllers = require("./controllers");

app.use(cors());
app.use(express.json());

app.get("/user/:userId", controllers.getUserById);
app.post("/register", controllers.register);
app.post("/login", controllers.login);
app.get("/album/:albumName", controllers.getAlbumByName);
app.get("/search/:query", controllers.searchAll);
app.get("/artistas/:artisName", controllers.searchAll);
app.get("/popular", controllers.getPopularAlbums);
app.get("/albums", controllers.filterAlbums);
app.get("/popular/friends/:userId", controllers.getFriendsPopularAlbums);
app.post("/friends/add", controllers.addFriend);
app.get("/friends/check/:userId/:friendId", controllers.checkFriendship);
app.get("/topListeners", controllers.getTopListeners);
app.get("/topReviewers", controllers.getTopReviwers);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
  db();
});

module.exports = app;
