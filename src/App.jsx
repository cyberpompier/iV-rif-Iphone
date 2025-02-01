import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Connexion from './pages/Connexion';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Vehicules from './pages/Vehicules';
import Materiel from './pages/Materiel';
import Parametre from './pages/Parametre';

function App() {
  const menuItems = [
    { name: 'Connexion', icon: '📶', path: '/connexion' },
    { name: 'Profil', icon: '👤', path: '/profil' },
    { name: 'Véhicules', icon: '🚗', path: '/vehicules' },
    { name: 'Matériel', icon: '🛠️', path: '/materiel' },
    { name: 'Paramètre', icon: '⚙️', path: '/parametre' }
  ];

  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfilePhoto(userData.photo || null);
          }
        } else {
          setUser(null);
          setProfilePhoto(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur:", error);
      }
    };

    fetchUser();

    const unsubscribe = auth.onAuthStateChanged(fetchUser);
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <h1>iVérif</h1>
          {user && profilePhoto && (
            <div className="profile-bubble">
              <img src={profilePhoto} alt="Profile" />
            </div>
          )}
          <div className="rotating-beacon">🚨</div>
        </div>
      </div>
      <TransitionGroup>
        <CSSTransition key={location.key} classNames="slide" timeout={300}>
          <Routes location={location}>
            <Route path="/" element={
              <div className="settings-menu">
                <ul>
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link to={item.path} className="menu-item">
                        <span className="icon">{item.icon}</span> {item.name}
                        <span className="chevron">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            } />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/vehicules" element={<Vehicules />} />
            <Route path="/materiel" element={<Materiel />} />
            <Route path="/parametre" element={<Parametre />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default App;
