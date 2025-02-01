import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function EditVehicule() {
  const { id } = useParams();
  const [vehicule, setVehicule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denomination, setDenomination] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [caserne, setCaserne] = useState('');
  const [lien, setLien] = useState('');
  const [photo, setPhoto] = useState('');
  const [emplacements, setEmplacements] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicule = async () => {
      setLoading(true);
      try {
        const vehiculeDoc = await getDoc(doc(db, 'vehicles', id));
        if (vehiculeDoc.exists()) {
          const vehiculeData = vehiculeDoc.data();
          setVehicule(vehiculeData);
          setDenomination(vehiculeData.denomination || '');
          setImmatriculation(vehiculeData.immatriculation || '');
          setVehicleType(vehiculeData.vehicleType || '');
          setCaserne(vehiculeData.caserne || '');
          setLien(vehiculeData.lien || '');
          setPhoto(vehiculeData.photo || '');
          setEmplacements(vehiculeData.emplacements || '');
        } else {
          console.error("Véhicule non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du véhicule:", error);
      }
      setLoading(false);
    };

    fetchVehicule();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateDoc(doc(db, 'vehicles', id), {
        denomination,
        immatriculation,
        vehicleType,
        caserne,
        lien,
        photo,
        emplacements
      });
      navigate('/parametre/vehicules');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du véhicule:", error);
    }
  };

  const handleCancel = () => {
    navigate('/parametre/vehicules');
  };

  if (loading) {
    return <div className="page">Chargement du véhicule...</div>;
  }

  if (!vehicule) {
    return <div className="page">Véhicule non trouvé.</div>;
  }

  return (
    <div className="page">
      <Link to="/parametre/vehicules" className="back-button">
        <span className="chevron">‹</span> Retour
      </Link>
      <div className="page-title">Éditer le véhicule</div>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Dénomination"
          value={denomination}
          onChange={(e) => setDenomination(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Immatriculation"
          value={immatriculation}
          onChange={(e) => setImmatriculation(e.target.value)}
          required
        />
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          required
        >
          <option value="">Sélectionner un type</option>
          <option value="Incendie">Incendie</option>
          <option value="Sanitaire">Sanitaire</option>
          <option value="Operations diverses">Opérations diverses</option>
        </select>
        <input
          type="text"
          placeholder="Caserne"
          value={caserne}
          onChange={(e) => setCaserne(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Emplacements disponibles"
          value={emplacements}
          onChange={(e) => setEmplacements(e.target.value)}
        />
        <input
          type="text"
          placeholder="Lien (facultatif)"
          value={lien}
          onChange={(e) => setLien(e.target.value)}
        />
        <input
          type="text"
          placeholder="Photo (URL)"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          required
        />
        <button type="submit">Enregistrer</button>
        <button type="button" onClick={handleCancel}>Annuler</button>
      </form>
    </div>
  );
}

export default EditVehicule;
