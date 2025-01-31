import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Materiel() {
  const [showForm, setShowForm] = useState(false);
  const [materiels, setMateriels] = useState([]);
  const [popupImage, setPopupImage] = useState(null);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const addMateriel = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newMateriel = {
      nom: formData.get('nom'),
      quantite: formData.get('quantite'),
      affection: formData.get('affection'),
      lien: formData.get('lien'),
      emplacement: formData.get('emplacement'),
      photo: formData.get('photo')
    };
    setMateriels([...materiels, newMateriel]);
    event.target.reset();
    setShowForm(false);
  };

  const viewPhoto = (url) => {
    setPopupImage(url);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Matériel</div>
      <div className="add-button" onClick={toggleForm}>+</div>
      {showForm && (
        <form className="form-container" onSubmit={addMateriel}>
          <h3>Ajouter un Matériel</h3>
          <input name="nom" type="text" placeholder="Nom" required />
          <input name="quantite" type="number" placeholder="Quantité" required />
          <input name="affection" type="text" placeholder="Affection" required />
          <input name="lien" type="text" placeholder="Lien (facultatif)" />
          <input name="emplacement" type="text" placeholder="Emplacement" required />
          <input name="photo" type="text" placeholder="Photo (URL)" required />
          <button type="submit">Ajouter</button>
        </form>
      )}
      {materiels.map((materiel, index) => (
        <div key={index} className="label-item">
          <img src={materiel.photo} alt={materiel.nom} onClick={() => viewPhoto(materiel.photo)} />
          <div>
            <strong>{materiel.nom}</strong><br />
            Quantité: {materiel.quantite}<br />
            Affection: {materiel.affection}<br />
            Emplacement: {materiel.emplacement}
          </div>
          <div className="label-icons">
            <span>✔️</span>
            <span>⚠️</span>
            <span>❌</span>
          </div>
        </div>
      ))}
      {popupImage && (
        <div className="popup" onClick={closePopup}>
          <img src={popupImage} alt="Popup" />
        </div>
      )}
    </div>
  );
}

export default Materiel;
