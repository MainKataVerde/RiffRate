import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./template.css";
import axios from "axios";
import Header from "./header";

const Welcome = () => {
  // Obtén el id del usuario logueado desde localStorage
  const loggedUserId = localStorage.getItem("userId");

  // ¿Es el perfil del usuario logueado?

  useEffect(() => {
    axios
      .get(`http://localhost:4000/user/${loggedUserId}`)
      .then(({ data }) => {
        //setPhoto(data.photo);
      })
      .catch((error) => console.error(error));
  }, [loggedUserId]);

  return (
    <>
      <div className="welcomeContainer">
        <Header loggedUserId={loggedUserId} />
        <div className="cuerpo">
          <div className="cuerpoArriba">
            {loggedUserId ? <p>Estas loggeado</p> : <p>No estas loggeado</p>}
          </div>
          <div className="cuerpoAbajo"></div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
