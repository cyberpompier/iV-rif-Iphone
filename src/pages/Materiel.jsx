import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

function Materiel() {
  const [showForm, setShowForm] = useState(false);
  const [materiels, setMateriels] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [commentPopup, setCommentPopup] = useState({ show: false, index: null, id: null });
  const [comments, setComments] = useState({});
  const [viewComment, setViewComment] = useState(null);

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

    fetchMateriels();
  }, []);

  const addMateriel = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newMateriel = {
      denomination: formData.get('nom'),
      quantity: formData.get('quantite'),
      affection: formData.get('affection'),
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

  const viewPhoto = (url) => {
    setPopupImage(url);
  };

  const closePopup = () => {
    setPopupImage(null);
    setViewComment(null);
  };

  const updateStatus = async (index, status, id) => {
    const updatedMateriels = materiels.map((materiel, i) =>
      i === index ? { ...materiel, status } : materiel
    );
    setMateriels(updatedMateriels);
    try {
      const materielDocRef = doc(db, 'materials', id);
      await updateDoc(materielDocRef, { status });
      if (status === 'ok') {
        const updatedComments = { ...comments };
        delete updatedComments[id];
        setComments(updatedComments);
        await updateDoc(materielDocRef, { comment: null });
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
    setComments({ ...comments, [commentPopup.id]: comment });
    setCommentPopup({ show: false, index: null, id: null });
    try {
      await updateDoc(doc(db, 'materials', commentPopup.id), { comment });
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
      <div className="label-grid">
        {materiels.map((materiel, index) => (
          <div key={materiel.id} className="label-item">
            <img src={materiel.photo} alt={materiel.denomination} onClick={() => viewPhoto(materiel.photo)} />
            <div className={`label-title ${materiel.status}`}>
              <strong>{materiel.denomination}</strong><br />
              Quantité: {materiel.quantity}<br />
              Affection: {materiel.affection}<br />
              Emplacement: {materiel.emplacement}
            </div>
            <div className="label-icons">
              <span onClick={() => updateStatus(index, 'ok', materiel.id)}>✔️</span>
              <span onClick={() => updateStatus(index, 'anomalie', materiel.id)}>⚠️</span>
              <span onClick={() => updateStatus(index, 'manquant', materiel.id)}>❌</span>
              {comments[materiel.id] && <span onClick={() => handleViewComment(materiel.id)}>💬</span>}
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

export default Materiel;
