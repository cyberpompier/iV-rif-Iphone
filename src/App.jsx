import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Connexion from './pages/Connexion';
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

  return (
    <div className="app-container">
      <TransitionGroup>
        <CSSTransition key={location.key} classNames="slide" timeout={300}>
          <Routes location={location}>
            <Route path="/" element={
              <div className="settings-menu">
                <h1>iVérif</h1>
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
