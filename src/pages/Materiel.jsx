import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';

function Materiel() {
  const [showForm, setShowForm] = useState(false);
  const [materiels, setMateriels] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [commentPopup, setCommentPopup] = useState({ show: false, index: null, id: null });
  const [comments, setComments] = useState({});
  const [viewComment, setViewComment] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, index: null, id: null });

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

    fetchMateriels();
    fetchUserProfile();
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
    if (status === 'ok') {
      setConfirmDelete({ show: true, index, id });
    } else {
      setCommentPopup({ show: true, index, id });
      try {
        await updateDoc(doc(db, 'materials', id), { status });
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
      }
    }
  };

  const handleConfirmDelete = async () => {
    const { index, id } = confirmDelete;
    const updatedMateriels = materiels.map((materiel, i) =>
      i === index ? { ...materiel, status: 'ok' } : materiel
    );
    setMateriels(updatedMateriels);
    const updatedComments = { ...comments };
    delete updatedComments[id];
    setComments(updatedComments);
    try {
      await updateDoc(doc(db, 'materials', id), { status: 'ok', comment: null });
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error);
    }
    setConfirmDelete({ show: false, index: null, id: null });
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const comment = event.target.comment.value;
    const signedComment = userProfile ? `${userProfile.grade} ${userProfile.nom} ${userProfile.prenom}:\n${comment}` : comment;
    setComments({ ...comments, [commentPopup.id]: signedComment });
    setCommentPopup({ show: false, index: null, id: null });
    try {
      await updateDoc(doc(db, 'materials', commentPopup.id), { comment: signedComment });
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

  const handleCancelDelete = () => {
    setConfirmDelete({ show: false, index: null, id: null });
  };

  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Matériel</div>
      <div className="add-button" onClick={toggleForm}>+</div>
      {showForm && (
        <form onSubmit={addMateriel} className="form-container">
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
              {comments[materiel.id] ? <span onClick={() => handleViewComment(materiel.id)}>💬</span> : null}
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
            <p className="signed-comment">{viewComment}</p>
            <button onClick={closePopup}>Fermer</button>
          </div>
        </div>
      )}
      {confirmDelete.show && (
        <div className="popup">
          <div className="comment-view">
            <p>Êtes-vous sûr de vouloir supprimer ce commentaire ?</p>
            <button onClick={handleConfirmDelete}>Confirmer</button>
            <button onClick={handleCancelDelete}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Materiel;
