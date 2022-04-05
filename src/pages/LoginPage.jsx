import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = ({ auth, setGettingUser }) => {
  const initialFormState = {
    name: '',
    password: '',
  };

  const [formState, setFormState] = useState(initialFormState);
  const [formError, setFormError] = useState(false);

  const handeInputChange = e => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const login = async (email, password) => {
    try {
      setGettingUser(true);
      await signInWithEmailAndPassword(auth, email, password);
      setGettingUser(false);
    } catch (e) {
      console.log(e);
      setFormError(true);
    } finally {
      setGettingUser(false);
    }
  };

  const handleFormSubmit = async () => {
    setFormError(false);
    const { email, password } = formState;

    if (email === ' ' || password === '') {
      setFormError(true);
      return;
    }

    await login(email, password);
  };

  return (
    <div className="container py-5 py-lg-7">
      <div className="row">
        <div className="offset-md-4 col-md-4">
          <h1 className="text-center">Login</h1>
          {formError ? (
            <div className="alert alert-danger" role="alert">
              Invalid data
            </div>
          ) : null}
          <div className="mb-4">
            <label htmlFor="">Email</label>
            <input
              onChange={e => handeInputChange(e)}
              className="form-control"
              type="text"
              name="email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="">Password</label>
            <input
              onChange={e => handeInputChange(e)}
              className="form-control"
              type="password"
              name="password"
            />
          </div>
          <div className="d-flex justify-content-center">
            <button onClick={() => handleFormSubmit()} className="btn btn-primary">
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
