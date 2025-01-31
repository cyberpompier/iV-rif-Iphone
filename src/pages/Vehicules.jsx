import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Vehicules() {
  const [showForm, setShowForm] = useState(false);
  const [vehicules, setVehicules] = useState([]);
  const [popupImage, setPopupImage] = useState(null);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const addVehicule = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newVehicule = {
      nom: formData.get('nom'),
      immatriculation: formData.get('immatriculation'),
      type: formData.get('type'),
      caserne: formData.get('caserne'),
      lien: formData.get('lien'),
      photo: formData.get('photo'),
      status: '' // Initial status
    };
    setVehicules([...vehicules, newVehicule]);
    event.target.reset();
    setShowForm(false);
  };

  const viewPhoto = (url) => {
    setPopupImage(url);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  const updateStatus = (index, status) => {
    const updatedVehicules = vehicules.map((vehicule, i) => 
      i === index ? { ...vehicule, status } : vehicule
    );
    setVehicules(updatedVehicules);
  };

  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Véhicules</div>
      <div className="add-button" onClick={toggleForm}>+</div>
      {showForm && (
        <form className="form-container" onSubmit={addVehicule}>
          <h3>Ajouter un Véhicule</h3>
          <input name="nom" type="text" placeholder="Nom" required />
          <input name="immatriculation" type="text" placeholder="Immatriculation" required />
          <input name="type" type="text" placeholder="Type" required />
          <input name="caserne" type="text" placeholder="Caserne" required />
          <input name="lien" type="text" placeholder="Lien (facultatif)" />
          <input name="photo" type="text" placeholder="Photo (URL)" required />
          <button type="submit">Ajouter</button>
        </form>
      )}
      {vehicules.map((vehicule, index) => (
        <div key={index} className="label-item">
          <img src={vehicule.photo} alt={vehicule.nom} onClick={() => viewPhoto(vehicule.photo)} />
          <div className={`label-title ${vehicule.status}`}>
            <strong>{vehicule.nom}</strong><br />
            {vehicule.immatriculation}<br />
            {vehicule.type}<br />
            {vehicule.caserne}
          </div>
          <div className="label-icons">
            <span onClick={() => updateStatus(index, 'ok')}>✔️</span>
            <span onClick={() => updateStatus(index, 'anomalie')}>⚠️</span>
            <span onClick={() => updateStatus(index, 'manquant')}>❌</span>
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

export default Vehicules;
