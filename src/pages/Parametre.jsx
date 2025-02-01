import React from 'react';
import { Link } from 'react-router-dom';

function Parametre() {
  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Paramètre</div>
      <div className="parametre-container">
        <Link to="/parametre/vehicules" className="parametre-button">Véhicules</Link>
        <Link to="/parametre/materiel" className="parametre-button">Matériels</Link>
      </div>
    </div>
  );
}

export default Parametre;
