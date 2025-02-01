import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

function ParametreVehicules() {
  const [vehicules, setVehicules] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vehicles'));
        const fetchedVehicules = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVehicules(fetchedVehicules);
      } catch (error) {
        console.error("Erreur lors de la récupération des véhicules:", error);
      }
    };

    fetchVehicules();
  }, []);

  const addVehicule = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newVehicule = {
      denomination: formData.get('nom'),
      immatriculation: formData.get('immatriculation'),
      vehicleType: formData.get('type'),
      caserne: formData.get('caserne'),
      lien: formData.get('lien'),
      photo: formData.get('photo'),
      status: ''
    };
    try {
      const docRef = await addDoc(collection(db, 'vehicles'), newVehicule);
      setVehicules(prevVehicules => [...prevVehicules, { ...newVehicule, id: docRef.id }]);
      event.target.reset();
      setShowForm(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du véhicule:", error);
    }
  };

  return (
    <div className="page">
      <Link to="/parametre" className="back-button">
        <span className="chevron">‹</span> Paramètre
      </Link>
      <div className="page-title">Véhicules</div>
      <div className="add-button" onClick={toggleForm}>+</div>
      {showForm && (
        <form onSubmit={addVehicule} className="form-container">
          <h3>Ajouter un Véhicule</h3>
          <input name="nom" type="text" placeholder="denomination" required />
          <input name="immatriculation" type="text" placeholder="Immatriculation" required />
          <input name="type" type="text" placeholder="vehicleType" required />
          <input name="caserne" type="text" placeholder="Caserne" required />
          <input name="lien" type="text" placeholder="Lien (facultatif)" />
          <input name="photo" type="text" placeholder="Photo (URL)" required />
          <button type="submit">Ajouter</button>
        </form>
      )}
      <div className="label-grid">
        {vehicules.map((vehicule) => (
          <div key={vehicule.id} className="label-item">
            <img src={vehicule.photo} alt={vehicule.denomination} />
            <div className="label-title">
              {vehicule.denomination}
            </div>
            <div className="label-icons">
              <Link to={`/vehicules/${vehicule.id}`} className="edit-button">Éditer</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParametreVehicules;
