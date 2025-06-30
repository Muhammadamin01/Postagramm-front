import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import CommentModal from '../CommentModal';
import HomeCard from "../../Components/HomeCard/PostHomeCard";
import "./Home.css";
import Footer from '../../Components/Footer/Footer';

// Custom fullscreen dot loader
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

const socket = io('https://postagramm-backend.onrender.com', { reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000 });
const API_URL = 'https://postagramm-backend.onrender.com/api/post';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [commentError, setCommentError] = useState(null);

  const [likeLoadingMap, setLikeLoadingMap] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentDeleteLoading, setCommentDeleteLoading] = useState({});
  const [commentUpdateLoading, setCommentUpdateLoading] = useState({});

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token.trim() === '') {
      navigate('/auth', { replace: true });
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Postlarni yuklashda xatolik');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/auth', { replace: true });
        }
      }
    };
    fetchPosts();

    socket.on('newComment', (comment) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === comment.postId
            ? {
                ...post,
                comments: post.comments?.some((c) => c._id === comment._id)
                  ? post.comments
                  : [...(post.comments || []), comment]
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === comment.postId
          ? {
              ...prev,
              comments: prev.comments?.some((c) => c._id === comment._id)
                ? prev.comments
                : [...(prev.comments || []), comment]
            }
          : prev
      );
    });

    socket.on('deletedComment', ({ postId, commentId }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, comments: post.comments?.filter((c) => c._id !== commentId) }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === postId
          ? { ...prev, comments: prev.comments?.filter((c) => c._id !== commentId) }
          : prev
      );
    });

    socket.on('updatedComment', (comment) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === comment.postId
            ? {
                ...post,
                comments: post.comments?.map((c) =>
                  c._id === comment._id ? { ...c, text: comment.text } : c
                )
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev && prev._id === comment.postId
          ? {
              ...prev,
              comments: prev.comments?.map((c) =>
                c._id === comment._id ? { ...c, text: comment.text } : c
              )
            }
          : prev
      );
    });

    return () => {
      socket.off('newComment');
      socket.off('deletedComment');
      socket.off('updatedComment');
    };
  }, [navigate]);

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    setLikeLoadingMap((prev) => ({ ...prev, [postId]: true }));
    try {
      const response = await axios.put(
        `${API_URL}/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map((post) => (post._id === postId ? response.data.post : post)));
      setSelectedPost((prev) =>
        prev && prev._id === postId ? response.data.post : prev
      );
    } catch (err) {
      setError(err.message || 'Like qo‘yishda xatolik');
    } finally {
      setLikeLoadingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const openCommentModal = (post) => {
    setSelectedPost(post);
    setCommentModalOpen(true);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentError(null);
  };
  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedPost(null);
    setCommentText('');
    setEditingCommentId(null);
    setEditingCommentText('');
    setCommentError(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    setCommentLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://postagramm-backend.onrender.com/api/comment',
        { postId: selectedPost._id, text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      setCommentError(null);
      const post = posts.find((p) => p._id === selectedPost._id);
      if (post && post.userId?._id && userId !== post.userId._id) {
        socket.emit('newNotification', {
          receiverId: post.userId._id,
          senderId: userId,
          type: 'comment',
          message: `${username || 'User'} sizning postingizga komment yozdi: "${post.content.substring(0, 20)}..."`,
          postId: selectedPost._id,
        });
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Komment yozishda xatolik');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Kommentni o‘chirishni xohlaysizmi?")) return;
    setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://postagramm-backend.onrender.com/api/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) =>
        prev.map((post) =>
          post._id === selectedPost._id
            ? { ...post, comments: post.comments?.filter((c) => c._id !== commentId) }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev
          ? { ...prev, comments: prev.comments?.filter((c) => c._id !== commentId) }
          : prev
      );

      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
      socket.emit('deleteComment', { postId: selectedPost._id, commentId });
    } catch (err) {
      setCommentError('Komment o‘chirishda xatolik');
      setCommentDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleUpdateComment = async () => {
    if (!editingCommentText.trim()) {
      setCommentError('Komment bo‘sh bo‘lmasligi kerak!');
      return;
    }
    setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://postagramm-backend.onrender.com/api/comment/${editingCommentId}`,
        { text: editingCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post._id === selectedPost._id
            ? {
                ...post,
                comments: post.comments?.map((c) =>
                  c._id === editingCommentId ? { ...c, text: editingCommentText } : c
                )
              }
            : post
        )
      );
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments?.map((c) =>
                c._id === editingCommentId ? { ...c, text: editingCommentText } : c
              )
            }
          : prev
      );

      setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: false }));
      setEditingCommentId(null);
      setEditingCommentText('');
      setCommentError(null);
      socket.emit('updateComment', {
        postId: selectedPost._id,
        commentId: editingCommentId,
        text: editingCommentText
      });
    } catch (err) {
      setCommentError('Komment tahrirlashda xatolik');
      setCommentUpdateLoading((prev) => ({ ...prev, [editingCommentId]: false }));
    }
  };

  return (
    <div className="home-page-wrapper d-flex flex-column min-vh-100">
      <h3 className='text-center success mt-5'>Barcha Postlar</h3>
      <div className="container flex-grow-1">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="post-grid">
          {loading ? (
            <CustomLoader />
          ) : posts.length === 0 ? (
            <div className="custom-spinner-center">
              <div className="empty-message">Postlar yo‘q</div>
            </div>
          ) : (
            [...posts]
              .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
              .map((post) => {
                const isLiked = Array.isArray(post.likes) && post.likes.includes(userId);
                return (
                  <HomeCard
                    key={post._id}
                    post={post}
                    onLike={() => handleLike(post._id)}
                    onComment={() => openCommentModal(post)}
                    likeLoading={!!likeLoadingMap[post._id]}
                    isLiked={isLiked}
                  />
                );
              })
          )}
        </div>

        {selectedPost && (
          <CommentModal
            isOpen={commentModalOpen}
            toggle={closeCommentModal}
            post={selectedPost}
            commentText={commentText}
            setCommentText={setCommentText}
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            editingCommentText={editingCommentText}
            setEditingCommentText={setEditingCommentText}
            commentLoading={commentLoading}
            commentDeleteLoading={commentDeleteLoading}
            commentUpdateLoading={commentUpdateLoading}
            commentError={commentError}
            onCommentSubmit={handleCommentSubmit}
            onCommentDelete={handleDeleteComment}
            onCommentUpdate={handleUpdateComment}
            userId={userId}
          />
        )}
      </div>

      {/* Footer faqat loading tugaganda chiqadi */}
      {!loading && <Footer />}
    </div>
  );
};

export default Home;