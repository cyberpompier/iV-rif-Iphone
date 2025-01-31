import React from 'react';
import { Link } from 'react-router-dom';

function Connexion() {
  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Connexion</div>
      <div className="auth-links">
        <Link to="/signup" className="auth-link">S'inscrire</Link>
        <Link to="/login" className="auth-link">Se connecter</Link>
      </div>
    </div>
  );
}

export default Connexion;
