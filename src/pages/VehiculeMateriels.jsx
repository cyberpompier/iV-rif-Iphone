import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

function VehiculeMateriels() {
  const { id } = useParams();
  const [materiels, setMateriels] = useState([]);
  const [vehicule, setVehicule] = useState(null);
  const [comments, setComments] = useState({});
  const [viewComment, setViewComment] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, index: null, id: null });
  const [user, setUser] = useState(null);
  const [popupImage, setPopupImage] = useState(null);
  const [lastVerification, setLastVerification] = useState(null);

  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'materials'));
        const fetchedMateriels = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const filteredMateriels = fetchedMateriels.filter(materiel => materiel.affection === vehicule?.denomination);
        setMateriels(filteredMateriels);
         // Récupérer les commentaires existants
        const initialComments = {};
        filteredMateriels.forEach(materiel => {
          if (materiel.comment) {
            initialComments[materiel.id] = materiel.comment;
            if (materiel.timestamp) {
              initialComments[materiel.id + '_timestamp'] = materiel.timestamp;
            }
          }
        });
        setComments(initialComments);
      } catch (error) {
        console.error("Erreur lors de la récupération des matériels:", error);
      }
    };

    const fetchVehicule = async () => {
      try {
        const vehiculeDoc = await getDoc(doc(db, 'vehicles', id));
        if (vehiculeDoc.exists()) {
          setVehicule(vehiculeDoc.data());
        } else {
          console.error("Véhicule non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du véhicule:", error);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUser(user);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur:", error);
      }
    };

    fetchVehicule();
    fetchMateriels();
    fetchUserProfile();
  }, [id, vehicule?.denomination]);

  useEffect(() => {
    if (materiels && materiels.length > 0) {
      let lastTimestamp = null;
      let lastComment = null;
      materiels.forEach(materiel => {
        if (materiel.timestamp && (!lastTimestamp || materiel.timestamp.seconds > lastTimestamp.seconds)) {
          lastTimestamp = materiel.timestamp;
          lastComment = materiel.comment;
        }
      });
      if (lastComment) {
        const parts = lastComment.split(':');
        const lastUser = parts[0];
        const lastDate = lastTimestamp ? new Date(lastTimestamp.seconds * 1000).toLocaleString() : null;
        setLastVerification({ user: lastUser, date: lastDate });
      } else {
        setLastVerification(null);
      }
    } else {
      setLastVerification(null);
    }
  }, [materiels]);

  const updateStatus = async (index, status, id) => {
    const updatedMateriels = materiels.map((materiel, i) =>
      i === index ? { ...materiel, status } : materiel
    );
    setMateriels(updatedMateriels);
    if (status === 'ok') {
      setConfirmDelete({ show: true, index, id });
    } else {
      // setCommentPopup({ show: true, index, id });
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
    const timestamp = serverTimestamp();
    setComments({ ...comments, [commentPopup.id]: signedComment, [commentPopup.id + '_timestamp']: timestamp });
    // setCommentPopup({ show: false, index: null, id: null });
    try {
      await updateDoc(doc(db, 'materials', commentPopup.id), { comment: signedComment, timestamp });
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
    }
  };

  const handleViewComment = (id) => {
    setViewComment({ comment: comments[id], timestamp: comments[id + '_timestamp'] });
  };

  const handleCancelComment = () => {
    // setCommentPopup({ show: false, index: null, id: null });
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ show: false, index: null, id: null });
  };

  const closePopup = () => {
    setViewComment(null);
  };

  return (
    <div className="page">
      <Link to="/vehicules" className="back-button">
        <span className="chevron">‹</span> Véhicules
      </Link>
      <div className="label-grid">
        {materiels.map((materiel, index) => (
          <div key={materiel.id} className="label-item">
            <img src={materiel.photo} alt={materiel.denomination} />
            <div className={`label-title ${materiel.status}`}>
              <strong>{materiel.denomination}</strong>
              {materiel.lien && (
                <a href={materiel.lien} target="_blank" rel="noopener noreferrer" className="link-icon">🔗</a>
              )}
              <br />
              Quantité: {materiel.quantity}<br />
              {materiel.affection}<br />
              {materiel.emplacement}
            </div>
            <div className="label-icons">
              {user ? (
                <>
                  <span onClick={() => updateStatus(index, 'ok', materiel.id)}>✔️</span>
                  <span onClick={() => updateStatus(index, 'anomalie', materiel.id)}>⚠️</span>
                  <span onClick={() => updateStatus(index, 'manquant', materiel.id)}>❌</span>
                </>
              ) : null}
              {comments[materiel.id] ? <span onClick={() => handleViewComment(materiel.id)}>💬</span> : null}
            </div>
          </div>
        ))}
      </div>
      {lastVerification && (
        <div className="verification-button-container">
          <button className="verification-button">
            Dernière vérification par: {lastVerification.user} le {lastVerification.date}
          </button>
        </div>
      )}
      {viewComment && (
        <div className="popup" onClick={closePopup}>
          <div className="comment-view">
            <div className="blinking-beacon">🚨</div>
            <p className={`signed-comment ${viewComment.comment && viewComment.comment.includes('manquant') ? 'manquant' : viewComment.comment && viewComment.comment.includes('anomalie') ? 'anomalie' : ''}`}>{viewComment.comment}</p>
             {viewComment.timestamp && <p className="comment-timestamp">{new Date(viewComment.timestamp?.seconds * 1000).toLocaleString()}</p>}
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
      <div className="validate-button-container">
        <button className="validate-button">Valider la vérification</button>
      </div>
    </div>
  );
}

export default VehiculeMateriels;
