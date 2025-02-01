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
import ParametreVehicules from './pages/ParametreVehicules';
import EditVehicule from './pages/EditVehicule';
import ParametreMateriel from './pages/ParametreMateriel';
import EditMateriel from './pages/EditMateriel';
import VehiculeMateriels from './pages/VehiculeMateriels';

function App() {
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const location = useLocation();
  const allowedEmail = 'sebastien.dupressoir@icloud.com';
  const [currentTitle, setCurrentTitle] = useState('iVérif');

  const menuItems = [
    { name: 'Connexion', icon: '📶', path: '/connexion' },
    { name: 'Profil', icon: '👤', path: '/profil' },
    { name: 'Véhicules', icon: '🚗', path: '/vehicules' },
    { name: 'Matériel', icon: '🛠️', path: '/materiel' },
    ...(user && user.email === allowedEmail ? [{ name: 'Paramètre', icon: '⚙️', path: '/parametre' }] : [])
  ];

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

  useEffect(() => {
    if (location.pathname === '/vehicules/:id/materiels') {
      setCurrentTitle('Vérification Journalière');
    } else {
      setCurrentTitle('iVérif');
    }
  }, [location]);

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <h1 className={currentTitle === 'Vérification Journalière' ? 'blinking-title' : ''}>{currentTitle}</h1>
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
            {user && user.email === allowedEmail && <Route path="/parametre" element={<Parametre />} />}
            {user && user.email === allowedEmail && <Route path="/parametre/vehicules" element={<ParametreVehicules />} />}
            {user && user.email === allowedEmail && <Route path="/vehicules/:id" element={<EditVehicule />} />}
            {user && user.email === allowedEmail && <Route path="/parametre/materiel" element={<ParametreMateriel />} />}
            {user && user.email === allowedEmail && <Route path="/materiel/:id" element={<EditMateriel />} />}
            {user && user.email === allowedEmail && <Route path="/vehicules/:id/materiels" element={<VehiculeMateriels />} />}
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default App;
