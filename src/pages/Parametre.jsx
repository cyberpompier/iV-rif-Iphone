import React from 'react';
import { Link } from 'react-router-dom';

function Parametre() {
  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Paramètre</div>
    </div>
  );
}

export default Parametre;
