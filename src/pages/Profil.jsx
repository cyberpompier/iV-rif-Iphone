import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

function Profil() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [grade, setGrade] = useState('');
  const [caserne, setCaserne] = useState('');
  const [photo, setPhoto] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          setUserId(user.uid);
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNom(userData.nom || '');
            setPrenom(userData.prenom || '');
            setGrade(userData.grade || '');
            setCaserne(userData.caserne || '');
            setPhoto(userData.photo || '');
          }
        } else {
          setMessage('Utilisateur non connecté.');
        }
      } catch (error) {
        setMessage(`Erreur de chargement du profil: ${error.message}`);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (userId) {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            nom,
            prenom,
            grade,
            caserne,
            photo
          });
        } else {
          await setDoc(userDocRef, {
            nom,
            prenom,
            grade,
            caserne,
            photo
          });
        }
        setMessage('Profil mis à jour avec succès!');
        navigate('/');
      } catch (error) {
        setMessage(`Erreur de mise à jour du profil: ${error.message}`);
      }
    } else {
      setMessage('Utilisateur non connecté.');
    }
  };

  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Profil</div>
      {loading ? (
        <p>Chargement du profil...</p>
      ) : (
        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Caserne"
            value={caserne}
            onChange={(e) => setCaserne(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Photo (URL)"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            required
          />
          <button type="submit">Valider</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Profil;
