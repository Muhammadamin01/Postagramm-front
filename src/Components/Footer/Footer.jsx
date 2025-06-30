import React from "react";

const Footer = () => (
  <footer className="bg-dark text-white mt-5">
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6">
          <h5>Sayt nomi</h5>
          <p>Bu yerda sayt haqida qisqacha ma'lumot yoziladi.</p>
        </div>
        <div className="col-md-3">
          <h5>Havolalar</h5>
          <ul className="list-unstyled">
            <li><a href="#" className="text-white">Bosh sahifa</a></li>
            <li><a href="#" className="text-white">Kontakt</a></li>
            <li><a href="#" className="text-white">Haqida</a></li>
          </ul>
        </div>
        <div className="col-md-3">
          <h5>Bog'lanish</h5>
          <ul className="list-unstyled">
            <li>Email: info@example.com</li>
            <li>Tel: +998 90 123 45 67</li>
          </ul>
        </div>
      </div>
      <hr className="bg-light"/>
      <div className="text-center">
        &copy; {new Date().getFullYear()} Sayt nomi. Barcha huquqlar himoyalangan.
      </div>
    </div>
  </footer>
);

export default Footer;