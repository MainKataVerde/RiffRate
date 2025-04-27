import { useEffect, useState } from "react";
import "./template.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Welcome = () => {
  const [name, setName] = useState("");

  const navegate = useNavigate();

  //esto nos devuleve la ultima parte de la url es decir la id
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`http://localhost:4000/user/${id}`)
      .then(({ data }) => setName(data.nombre))
      .catch((error) => console.error(error));
  }, [id]); //esto hace que se ejecute cada vez que se cambia la url

  return <div>Welcome {name}</div>;
};

export default Welcome;
