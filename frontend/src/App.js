import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Productos from './components/Productos';
import Carrito from './components/Carrito';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Checkout from './components/Checkout';
import Home from './components/Home';
import { AuthProvider } from './context/AuthContext';
import './styles/responsive.css';
import './styles/App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

   // Restablecer la búsqueda cuando se accede a la página de productos
  const resetSearch = () => {
    setSearchQuery('');
  };

  return (
    <AuthProvider>
      <Router>
        <Navbar onSearch={handleSearch} />
        <Routes>
          <Route path="/" element={<Home />} /> {/* Usar Home.js como página principal */}
          <Route 
            path="/productos" 
            element={<Productos searchQuery={searchQuery} onResetSearch={resetSearch} />} 
          />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;