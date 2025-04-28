import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register.tsx";
import Login from "./components/Login.tsx";
import Welcome from "./components/Welcome.tsx";
import User from "./components/User.tsx";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Welcome />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
