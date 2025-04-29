import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./template.css";
import axios from "axios";
import Header from "./header";

const Welcome = () => {
  const [nombre, setNombre] = useState("");
  // Obtén el id del usuario logueado desde localStorage
  const loggedUserId = localStorage.getItem("userId");

  const navigate = useNavigate();

  // ¿Es el perfil del usuario logueado?

  useEffect(() => {
    axios
      .get(`http://localhost:4000/user/${loggedUserId}`)
      .then(({ data }) => {
        setNombre(data.nombre);
      })
      .catch((error) => console.error(error));
  }, [loggedUserId]);

  return (
    <>
      <div className="welcomeContainer">
        <Header loggedUserId={loggedUserId} />
        <div className="cuerpo">
          <div className="cuerpoArriba">
            <div className="cuerpoArribaTexto">
              {loggedUserId ? (
                <h1>
                  Hola {""}
                  <b>{nombre}</b> ,¿que vamos a escuchar hoy ?
                </h1>
              ) : (
                <h1>
                  <b onClick={() => navigate("/login")}>Inicia sesion</b> y
                  ponle nota a tu sonido
                </h1>
              )}
            </div>
          </div>
          <div className="cuerpoAbajo"></div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
