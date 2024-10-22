import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.scss';

const Navbar = ({ onSearch }) => {
  const { usuario, logout, carritoCount } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (typeof onSearch === 'function') {
      onSearch(searchQuery);
    }

    if (searchQuery.trim() !== '') {
      navigate(`/productos?nombre=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-home"></i> Inicio
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/productos">
                <i className="fas fa-box"></i> Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/carrito">
                <i className="fas fa-shopping-cart"></i> Carrito
                {carritoCount > 0 && (
                  <span className="badge bg-primary ms-2">{carritoCount}</span>
                )}
              </Link>
            </li>
          </ul>
          {/* Asegura que el form y el botón estén alineados */}
          <form className="d-flex search-form align-items-center" onSubmit={handleSearch}>
            <input
              className="form-control"
              type="search"
              placeholder="Buscar productos"
              aria-label="Buscar productos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-success" type="submit" aria-label="Buscar">
              <i className="fas fa-search"></i>
            </button>
          </form>
          <ul className="navbar-nav ms-auto align-items-center">
            {usuario ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text bienvenido-text">Bienvenido</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger ms-3" onClick={logout}>
                    <i className="fas fa-sign-out-alt"></i> Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt"></i> Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <i className="fas fa-user-plus"></i> Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;