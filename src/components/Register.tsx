import { useNavigate } from "react-router-dom";
import "./template.css";
import { useState } from "react";
import axios from "axios";
const Register = () => {
  const [inputs, setInputs] = useState({
    email: "",
    nombre: "",
    password: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, nombre, password } = inputs;

  //cogemos los inputs donde esta la info
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nombre !== "" && email !== "" && password !== "") {
      const Usuario = {
        nombre,
        email,
        password,
      };
      setLoading(true);
      await axios
        .post("http://localhost:4000/register", Usuario)
        .then(({ data }) => {
          setMensaje(data.mensaje);
          setInputs({
            email: "",
            nombre: "",
            password: "",
          });
          setTimeout(() => {
            setMensaje("");
            navigate("/login");
            setLoading(false);
          }, 1500);
        })
        .catch((err) => {
          console.error(err);
          setMensaje(err.response.data.error);
          setTimeout(() => {
            setMensaje("");
            setLoading(false);
          }, 3000);
        });
    }
  };

  const navigate = useNavigate();
  return (
    <>
      <div className="formContainer">
        <h3>Registrate , haz amigos y</h3>
        <h2>Ponle nota a tu sonido</h2>
        <form onSubmit={onSubmit}>
          <div className="inputContainer">
            <div className="left">
              <label htmlFor="nombre">Nombre</label>
              <input
                value={nombre}
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Nombre..."
                autoComplete="off"
                onChange={(e) => onChange(e)}
              />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="black"
            >
              <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
            </svg>
          </div>
          <div className="inputContainer">
            <div className="left">
              <label htmlFor="email">Correo</label>
              <input
                value={email}
                type="email"
                id="email"
                name="email"
                placeholder="Correo..."
                autoComplete="off"
                onChange={(e) => onChange(e)}
              />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="black"
            >
              <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
            </svg>
          </div>
          <div className="inputContainer">
            <div className="left">
              <label htmlFor="password">Contraseña</label>
              <input
                value={password}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Contraseña..."
                autoComplete="off"
                onChange={(e) => onChange(e)}
              />
            </div>
            <svg
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)}
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="black"
            >
              {showPassword ? (
                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
              ) : (
                <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
              )}
            </svg>
          </div>
          <button type="submit">
            {loading ? "Cargando..." : "Resgistrarme"}
          </button>
          <p>
            Ya tengo cuenta?{" "}
            <b onClick={() => navigate("/login")}>Iniciar sesión</b>
          </p>
        </form>
      </div>
      {mensaje && <div className="toast">{mensaje}</div>}
    </>
  );
};

export default Register;
