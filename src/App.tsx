import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register.tsx";
import Login from "./components/Login.tsx";
import Welcome from "./components/Welcome.tsx";
import User from "./components/User.tsx";
import Album from "./components/Album.tsx";
import Search from "./components/Search.tsx";
import FilteredAlbums from "./components/FilteredAlbums.tsx";
import Artist from "./components/Artist.tsx";
import Friends from "./components/Friends.tsx";
import EditProfile from "./components/EditProfile.tsx";
import Layout from "./components/Layout";
import Footer from "./components/Footer.tsx";

import "./components/template.css";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          {/* Páginas de autenticación sin anuncios */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* El resto de páginas con Layout y anuncios */}
          <Route
            path="/"
            element={
              <Layout>
                <Welcome />
              </Layout>
            }
          />
          <Route
            path="/user/:id"
            element={
              <Layout>
                <User />
              </Layout>
            }
          />
          <Route
            path="/album/:id"
            element={
              <Layout>
                <Album />
              </Layout>
            }
          />
          <Route
            path="/search/:query"
            element={
              <Layout>
                <Search />
              </Layout>
            }
          />
          <Route
            path="/albums/:filter"
            element={
              <Layout>
                <FilteredAlbums />
              </Layout>
            }
          />
          <Route path="/artist/:id" element={<Artist />} />
          <Route
            path="/user/:userId/friends"
            element={
              <Layout>
                <Friends />
              </Layout>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <Layout>
                <EditProfile />
              </Layout>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
