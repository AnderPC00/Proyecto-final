import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Productos from './Productos';
import Carrito from './Carrito';
import Login from './Login';
import Register from './Register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Tienda de Productos APC</h1>
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/productos">Productos</a></li>
              <li><a href="/carrito">Carrito</a></li>
              <li><a href="/login">Iniciar sesión</a></li>
              <li><a href="/register">Registrarse</a></li>
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <footer>
          <p>&copy; 2024 Tienda de Productos APC. Todos los derechos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;