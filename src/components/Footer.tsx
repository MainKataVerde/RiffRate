import { Link } from "react-router-dom";
import "./css/footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>RiffRate</h4>
          <ul>
            <li>
              <Link to="/about">Acerca de</Link>
            </li>
            <li>
              <Link to="/team">Equipo</Link>
            </li>
            <li>
              <Link to="/contact">Contáctanos</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Recursos</h4>
          <ul>
            <li>
              <Link to="/help">Centro de Ayuda</Link>
            </li>
            <li>
              <Link to="/api">API</Link>
            </li>
            <li>
              <Link to="/faq">Preguntas Frecuentes</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li>
              <Link to="/terms">Términos de Servicio</Link>
            </li>
            <li>
              <Link to="/privacy">Privacidad</Link>
            </li>
            <li>
              <Link to="/cookies">Política de cookies</Link>
            </li>
            <li>
              <Link to="/copyright">Copyright</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} RiffRate. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
