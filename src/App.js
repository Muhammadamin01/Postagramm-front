import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from './Context/NotificationContex';
import Home from './Page/Home/Home';
import AuthForm from './Page/Auth/AuthForm';
import Profile from './Page/Profile/Profile';
import Post from './Page/Post/Post';
import Users from './Page/Users/Users';
import Notifications from './Page/Notification/Notifications';
import AdminPage from './Page/Admin/Admin';
import Navbar from './Components/Navbar/Navbar';

// Helper to conditionally render Navbar based on route
function NavbarWithRoutes() {
  const location = useLocation();
  // Hide Navbar on /auth route
  const hideNavbar = location.pathname === '/auth';

  return !hideNavbar ? <Navbar /> : null;
}


function App() {
  return (
    <NotificationProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={10000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <NavbarWithRoutes />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/post" element={<Post />} />
          <Route path="/users" element={<Users />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;