import Header from "./Header";
import { useParams } from "react-router-dom";
import "./template.css";

const Album = () => {
  const loggedUserId = localStorage.getItem("userId");
  const { id } = useParams();

  return (
    <div>
      <Header loggedUserId={loggedUserId}></Header>
      <div className="cuerpo">asdas</div>
    </div>
  );
};

export default Album;
