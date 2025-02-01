import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

function EditMateriel() {
  const { id } = useParams();
  const [materiel, setMateriel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denomination, setDenomination] = useState('');
  const [quantity, setQuantity] = useState('');
  const [affection, setAffection] = useState('');
  const [lien, setLien] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [photo, setPhoto] = useState('');
  const [vehicules, setVehicules] = useState([]);
  const [availableEmplacements, setAvailableEmplacements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMateriel = async () => {
      setLoading(true);
      try {
        const materielDoc = await getDoc(doc(db, 'materials', id));
        if (materielDoc.exists()) {
          const materielData = materielDoc.data();
          setMateriel(materielData);
          setDenomination(materielData.denomination || '');
          setQuantity(materielData.quantity || '');
          setAffection(materielData.affection || '');
          setLien(materielData.lien || '');
          setEmplacement(materielData.emplacement || '');
          setPhoto(materielData.photo || '');
        } else {
          console.error("Matériel non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du matériel:", error);
      }
      setLoading(false);
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

    fetchMateriel();
    fetchVehicules();
  }, [id]);

  useEffect(() => {
    if (affection && vehicules.length > 0) {
      const selectedVehicule = vehicules.find(vehicule => vehicule.denomination === affection);
      if (selectedVehicule && selectedVehicule.emplacements) {
        setAvailableEmplacements(selectedVehicule.emplacements.split(',').map(item => item.trim()));
      } else {
        setAvailableEmplacements([]);
      }
    } else {
      setAvailableEmplacements([]);
    }
  }, [affection, vehicules]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateDoc(doc(db, 'materials', id), {
        denomination,
        quantity,
        affection,
        lien,
        emplacement,
        photo
      });
      navigate('/parametre/materiel');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du matériel:", error);
    }
  };

  const handleCancel = () => {
    navigate('/parametre/materiel');
  };

  if (loading) {
    return <div className="page">Chargement du matériel...</div>;
  }

  if (!materiel) {
    return <div className="page">Matériel non trouvé.</div>;
  }

  return (
    <div className="page">
      <Link to="/parametre/materiel" className="back-button">
        <span className="chevron">‹</span> Retour
      </Link>
      <div className="page-title">Éditer le matériel</div>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="text"
          placeholder="Nom"
          value={denomination}
          onChange={(e) => setDenomination(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantité"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <select
          value={affection}
          onChange={(e) => {
            setAffection(e.target.value);
            setEmplacement('');
          }}
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
          value={emplacement}
          onChange={(e) => setEmplacement(e.target.value)}
          required
        >
          <option value="">Sélectionner un emplacement</option>
          {availableEmplacements.map((emplacementOption, index) => (
            <option key={index} value={emplacementOption}>
              {emplacementOption}
            </option>
          ))}
        </select>
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

export default EditMateriel;
