// Footer.jsx
import React from 'react';
import './Footer.css'; // We'll create this file for styling

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-section">
        <h3>About Us</h3>
        <p>We are a company dedicated to providing the best services.</p>
      </div>
      <div className="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="#privacy">Privacy Policy</a></li>
        </ul>
      </div>
      <div className="footer-section">
        <h3>Contact Us</h3>
        <p>Email: info@example.com</p>
        <p>Phone: +123 456 7890</p>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;