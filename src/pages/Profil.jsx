import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';

function Profil() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [grade, setGrade] = useState('');
  const [caserne, setCaserne] = useState('');
  const [photo, setPhoto] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMessage(`Erreur: ${error.message}`);
      } else if (data.session) {
        setUserId(data.session.user.id);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nom,
          prenom,
          grade,
          caserne,
          photo
        }, { onConflict: ['id'] });

      if (error) {
        setMessage(`Erreur: ${error.message}`);
      } else {
        setMessage('Profil mis à jour avec succès!');
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
      {message && <p>{message}</p>}
    </div>
  );
}

export default Profil;
