import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register.tsx";
import Login from "./components/Login.tsx";
import Welcome from "./components/Welcome.tsx";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome/:id" element={<Welcome />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
