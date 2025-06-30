import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardImg, Input, Button, Spinner } from 'reactstrap';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import Navbar from '../../Components/Navbar/Navbar';
import './Users.css';
import Footer from '../../Components/Footer/Footer';

// Custom fullscreen loader
const CustomLoader = () => (
  <div className="fullscreen-spinner">
    <div className="dot-spinner">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </div>
);

const API_URL = 'https://postagramm-backend.onrender.com/api/user';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth', { replace: true });
      return;
    }
    const fetchCurrentUser = async () => {
      setUserLoading(true);
      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
        setError(null);
      } catch {
        setError('Foydalanuvchi ma’lumotlari topilmadi');
      } finally {
        setUserLoading(false);
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (searchQuery.trim() !== '') return;
    setLoading(true);
    axios
      .get(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data);
        setError(null);
      })
      .catch(() => {
        setUsers([]);
        setError('Foydalanuvchilarni olishda xatolik');
      })
      .finally(() => setLoading(false));
  }, [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (searchQuery.trim() === '') return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
        setError(null);
      } catch {
        setUsers([]);
        setError('Foydalanuvchilarni qidirishda xatolik');
      }
      setLoading(false);
    }, 350);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchQuery]);

  const handleFollow = async (userId, isFollowing) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const url = `${API_URL}/${isFollowing ? 'unfollow' : 'follow'}/${userId}`;
      const response = await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.currentUser) {
        setCurrentUser(response.data.currentUser);
      } else if (response.data.following) {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                following: response.data.following,
              }
            : prev
        );
      }
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isFollowed: !isFollowing }
            : user
        )
      );
      setError(null);
    } catch {
      setError('Follow/Unfollow qilishda xatolik');
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const isFollowing = (userId) =>
    currentUser &&
    Array.isArray(currentUser.following) &&
    currentUser.following.some((id) => String(id) === String(userId));

  const filteredUsers = users.filter(
    (user) => !(currentUser && user._id === currentUser._id)
  );

  return (
    <>
      {(userLoading || loading) && <CustomLoader />}
      <div className="users-container">
        <div className="users-title">Foydalanuvchilar</div>
        {error && <div className="alert alert-danger">{error}</div>}
        <Input
          className="users-search-input"
          type="text"
          placeholder="Foydalanuvchi nomini qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        <div className="users-list">
          {!loading && filteredUsers.length === 0 && (
            <div className="users-empty">Foydalanuvchilar topilmadi</div>
          )}
          {filteredUsers.map((user) => (
            <Card
              key={user._id}
              className="user-card"
              onClick={() => handleUserClick(user._id)}
            >
              <CardBody className="user-card-body">
                <CardImg
                style={{width:"80px", height:"80px", borderRadius:"70%"}}
                  src={user.profileImage?.url ? user.profileImage.url : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_items_boosted&w=740"}
                  alt="Profile"
                  className="user-avatar"
                />
                <CardTitle
                  tag="h5"
                  className="user-username"
                >
                  {user.username}
                </CardTitle>
                {currentUser && user._id !== currentUser._id && (
                  <Button
                    className="user-follow-btn"
                    color={isFollowing(user._id) ? 'danger' : 'success'}
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      handleFollow(user._id, isFollowing(user._id));
                    }}
                    disabled={!!followLoading[user._id]}
                  >
                    {followLoading[user._id] ? (
                      <Spinner size="sm" color="secondary" />
                    ) : isFollowing(user._id) ? (
                      <>
                        <FaUserMinus /> Unfollow
                      </>
                    ) : (
                      <>
                        <FaUserPlus /> Follow
                      </>
                    )}
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      <Footer />

    </>
  );
};

export default Users;