import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, login } from '../../API/authRequest';
import "./AuthForm.css"

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    surname: '', 
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = isSignup
        ? await register(formData)
        : await login(formData);

      const data = response.data;

      if (data && data.token && data.userId && data.user && typeof data.user.role !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId.toString());
        localStorage.setItem('role', data.user.role.toString());

        toast.success(isSignup ? 'Signup Success' : 'Login Success', {
          position: "top-right",
          autoClose: 10000,
        });
        navigate('/home', { replace: true });
      } else {
        setError(data?.message || 'Serverdan noto‘g‘ri javob keldi');
        toast.error(isSignup ? 'Signup Denied' : 'Login Denied', {
          position: "top-right",
          autoClose: 10000,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Server bilan ulanishda xatolik');
      toast.error(isSignup ? 'Signup Denied' : 'Login Denied', {
        position: "top-right",
        autoClose: 10000,
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && token !== 'null' && userId && userId !== 'null') {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h3>{isSignup ? 'Signup' : 'Login'}</h3>

        {error && <p className="error-message">{error}</p>}

        {isSignup && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="auth-input"
              onChange={handleChange}
              required
              autoComplete="username"
            />
            <input
              type="text"
              name="surname"
              placeholder="Surname"
              className="auth-input"
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="auth-input"
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="auth-input"
          onChange={handleChange}
          required
          autoComplete={isSignup ? "new-password" : "current-password"}
        />

        <button type="submit" className="auth-btn">
          {isSignup ? 'Signup' : 'Login'}
        </button>

        <p className="toggle-text">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            className="toggle-link"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Login' : 'Signup'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;