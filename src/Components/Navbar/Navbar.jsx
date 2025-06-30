import React, { useState, useContext, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NotificationContext } from '../../Context/NotificationContex';
import { FaHome, FaUser, FaPlus, FaUsers, FaBell, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { notifications } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const unreadCount = useMemo(
    () => notifications.filter((notif) => !notif.isRead).length,
    [notifications]
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/auth', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/home" className="logo" style={{ color: 'white' }}>
            <img
            width={55}
              className="logo_img"
              src="https://images.seeklogo.com/logo-png/11/2/post-logo-png_seeklogo-111042.png"
              alt=""
            />
          </Link>
        </div>
        <div className={`link-all${isMenuOpen ? ' active' : ''}`}>
          <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active-link' : ''}`}>
            <span className="nav-icon-wrapper">
              <FaHome className="nav-icon" />
            </span>
            <span className="nav-text">Home</span>
          </Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active-link' : ''}`}>
            <span className="nav-icon-wrapper">
              <FaUser className="nav-icon" />
            </span>
            <span className="nav-text">Profile</span>
          </Link>
          <Link to="/post" className={`nav-link ${location.pathname === '/post' ? 'active-link' : ''}`}>
            <span className="nav-icon-wrapper">
              <FaPlus className="nav-icon" />
            </span>
            <span className="nav-text">Post</span>
          </Link>
          <Link to="/users" className={`nav-link ${location.pathname === '/users' ? 'active-link' : ''}`}>
            <span className="nav-icon-wrapper">
              <FaUsers className="nav-icon" />
            </span>
            <span className="nav-text">Users</span>
          </Link>
          <Link to="/notifications" className={`nav-link ${location.pathname === '/notifications' ? 'active-link' : ''}`}>
            <span className="nav-icon-wrapper notification-icon-wrapper">
              <FaBell className="nav-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge right">{unreadCount}</span>
              )}
            </span>
            <span className="nav-text">Notifications</span>
          </Link>
          {role === "101" && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active-link' : ''}`}>
              <span className="nav-icon-wrapper">
                <FaUserShield className="nav-icon" />
              </span>
              <span className="nav-text">Admin</span>
            </Link>
          )}
          {token && (
            <button onClick={handleLogout} className="logout-btn">
              <span className="nav-icon-wrapper">
                <FaSignOutAlt className="nav-icon" />
              </span>
              <span className="nav-text">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;