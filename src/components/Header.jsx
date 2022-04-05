import React from 'react';
import { auth } from '../helpers/firebase-config';
import { signOut } from 'firebase/auth';

const Header = ({ user }) => {
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div className="bg-pale py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>Portfolio tracker</h2>
          </div>

          {user ? (
            <div className="d-flex align-items-center">
              <p className="me-3">{user.email}</p>
              <button onClick={() => logout()} className="btn btn-sm btn-danger">
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;
