import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { auth } from '../helpers/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

import Home from '../pages/Home.jsx';
import Page404 from '../pages/Page404';

import Header from './Header';

import '../styles/style.scss';

const App = () => {
  const [user, setUser] = useState(false);
  const [gettingUser, setGettingUser] = useState(true);

  onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    currentUser && setGettingUser(false);
  });

  return (
    <BrowserRouter>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
