import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

function Vehicules() {
  const [showForm, setShowForm] = useState(false);
  const [vehicules, setVehicules] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [commentPopup, setCommentPopup] = useState({ show: false, index: null, id: null });
  const [comments, setComments] = useState({});
  const [viewComment, setViewComment] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

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

    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur:", error);
      }
    };

    fetchVehicules();
    fetchUserProfile();
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

  const viewPhoto = (url) => {
    setPopupImage(url);
  };

  const closePopup = () => {
    setPopupImage(null);
    setViewComment(null);
  };

  const updateStatus = async (index, status, id) => {
    const updatedVehicules = vehicules.map((vehicule, i) =>
      i === index ? { ...vehicule, status } : vehicule
    );
    setVehicules(updatedVehicules);
    try {
      await updateDoc(doc(db, 'vehicles', id), { status });
      if (status === 'ok') {
        const updatedComments = { ...comments };
        delete updatedComments[id];
        setComments(updatedComments);
        await updateDoc(doc(db, 'vehicles', id), { comment: null });
      } else {
        setCommentPopup({ show: true, index, id });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const comment = event.target.comment.value;
    const signedComment = userProfile ? `${userProfile.grade} ${userProfile.nom}: ${comment}` : comment;
    setComments({ ...comments, [commentPopup.id]: signedComment });
    setCommentPopup({ show: false, index: null, id: null });
    try {
      await updateDoc(doc(db, 'vehicles', commentPopup.id), { comment: signedComment });
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
    }
  };

  const handleViewComment = (id) => {
    setViewComment(comments[id]);
  };

  const handleCancelComment = () => {
    setCommentPopup({ show: false, index: null, id: null });
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
        {vehicules.map((vehicule, index) => (
          <div key={vehicule.id} className="label-item">
            <img src={vehicule.photo} alt={vehicule.denomination} onClick={() => viewPhoto(vehicule.photo)} />
            <div className={`label-title ${vehicule.status}`}>
              <strong>{vehicule.denomination}</strong><br />
              {vehicule.immatriculation}<br />
              {vehicule.vehicleType}<br />
              {vehicule.caserne}
            </div>
            <div className="label-icons">
              <span onClick={() => updateStatus(index, 'ok', vehicule.id)}>✔️</span>
              <span onClick={() => updateStatus(index, 'anomalie', vehicule.id)}>⚠️</span>
              <span onClick={() => updateStatus(index, 'manquant', vehicule.id)}>❌</span>
              {comments[vehicule.id] && <span onClick={() => handleViewComment(vehicule.id)}>💬</span>}
            </div>
          </div>
        ))}
      </div>
      {popupImage && (
        <div className="popup" onClick={closePopup}>
          <img src={popupImage} alt="Popup" />
        </div>
      )}
      {commentPopup.show && (
        <div className="popup">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea name="comment" placeholder="Ajouter un commentaire" required></textarea>
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={handleCancelComment}>Annuler</button>
          </form>
        </div>
      )}
      {viewComment && (
        <div className="popup" onClick={closePopup}>
          <div className="comment-view">
            <p>{viewComment}</p>
            <button onClick={closePopup}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicules;
