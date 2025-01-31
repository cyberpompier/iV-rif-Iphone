import React from 'react';
import { Link } from 'react-router-dom';

function Connexion() {
  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Connexion</div>
    </div>
  );
}

export default Connexion;
