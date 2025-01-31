import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Connexion réussie!');
      navigate('/');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage('Déconnexion réussie!');
      navigate('/connexion');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page">
      <Link to="/" className="back-button">
        <span className="chevron">‹</span> iVérif
      </Link>
      <div className="page-title">Connexion</div>
      <form onSubmit={handleLogin} className="form-container">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      {message && <p>{message}</p>}
      <div className="auth-links">
        <Link to="/signup" className="auth-link auth-button">S'inscrire</Link>
        <button onClick={handleLogout} className="auth-link auth-button">Déconnexion</button>
      </div>
    </div>
  );
}

export default Connexion;
