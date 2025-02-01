import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

function ParametreMateriel() {
  const [materiels, setMateriels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [vehicules, setVehicules] = useState([]);
  const [availableEmplacements, setAvailableEmplacements] = useState([]);
  const [selectedVehicule, setSelectedVehicule] = useState('');

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'materials'));
        const fetchedMateriels = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMateriels(fetchedMateriels);
      } catch (error) {
        console.error("Erreur lors de la récupération des matériels:", error);
      }
    };

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

    fetchMateriels();
    fetchVehicules();
  }, []);

  useEffect(() => {
    if (selectedVehicule) {
      const selectedVehiculeData = vehicules.find(vehicule => vehicule.denomination === selectedVehicule);
      if (selectedVehiculeData && selectedVehiculeData.emplacements) {
        setAvailableEmplacements(selectedVehiculeData.emplacements.split(',').map(item => item.trim()));
      } else {
        setAvailableEmplacements([]);
      }
    } else {
      setAvailableEmplacements([]);
    }
  }, [selectedVehicule, vehicules]);

  const addMateriel = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newMateriel = {
      denomination: formData.get('nom'),
      quantity: formData.get('quantite'),
      affection: selectedVehicule,
      lien: formData.get('lien'),
      emplacement: formData.get('emplacement'),
      photo: formData.get('photo'),
      status: ''
    };
    try {
      const docRef = await addDoc(collection(db, 'materials'), newMateriel);
      setMateriels(prevMateriels => [...prevMateriels, { ...newMateriel, id: docRef.id }]);
      event.target.reset();
      setShowForm(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du matériel:", error);
    }
  };

  const handleVehiculeChange = (event) => {
    setSelectedVehicule(event.target.value);
  };

  return (
    <div className="page">
      <Link to="/parametre" className="back-button">
        <span className="chevron">‹</span> Paramètre
      </Link>
      <div className="page-title">Matériels</div>
      <div className="add-button" onClick={toggleForm}>+</div>
      {showForm && (
        <form onSubmit={addMateriel} className="form-container">
          <h3>Ajouter un Matériel</h3>
          <input name="nom" type="text" placeholder="Nom" required />
          <input name="quantite" type="number" placeholder="Quantité" required />
          <select
            name="affection"
            value={selectedVehicule}
            onChange={handleVehiculeChange}
            required
          >
            <option value="">Sélectionner une affection</option>
            {vehicules.map((vehicule) => (
              <option key={vehicule.id} value={vehicule.denomination}>
                {vehicule.denomination}
              </option>
            ))}
          </select>
          <select
            name="emplacement"
            required
          >
            <option value="">Sélectionner un emplacement</option>
            {availableEmplacements.map((emplacementOption, index) => (
              <option key={index} value={emplacementOption}>
                {emplacementOption}
              </option>
            ))}
          </select>
          <input name="lien" type="text" placeholder="Lien (facultatif)" />
          <input name="photo" type="text" placeholder="Photo (URL)" required />
          <button type="submit">Ajouter</button>
        </form>
      )}
      <div className="label-grid">
        {materiels.map((materiel) => (
          <div key={materiel.id} className="label-item">
            <img src={materiel.photo} alt={materiel.denomination} />
            <div className="label-title">
              {materiel.denomination}
            </div>
            <div className="label-icons">
              <Link to={`/materiel/${materiel.id}`} className="edit-button">Éditer</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParametreMateriel;
