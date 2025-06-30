import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegHeart, FaHeart, FaRegCommentDots } from 'react-icons/fa';
import './PostHomeCard.css';

const HomeCard = ({
  post,
  onLike,
  onComment,
  likeLoading = false,
  isLiked = false,
}) => {
  const navigate = useNavigate();

  const avatar =
    post.userId?.profileImage?.url ||
    post.userId?.profileImage ||
    'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740';

  // User profilega o'tkazish uchun handler
  const goToProfile = (e) => {
    e.stopPropagation();
    if (post.userId?._id) {
      navigate(`/profile/${post.userId._id}`);
    }
  };

  return (
    <div className="home-post-card">
      <div className="home-post-header">
        <img
          src={avatar}
          alt={`${post.userId?.username || 'Anonim'} avatar`}
          className="home-post-avatar"
          style={{ cursor: post.userId?._id ? "pointer" : "default" }}
          onClick={post.userId?._id ? goToProfile : undefined}
        />
        <div className="home-post-header-userinfo">
          <h5
            style={{ cursor: post.userId?._id ? "pointer" : "default", margin: 0 }}
            onClick={post.userId?._id ? goToProfile : undefined}
          >
            {post.userId?.username || 'Anonim'}
          </h5>
          <div className="home-post-user-extra">
            {post.userId?.surname && (
              <span>
                <b>Familiya:</b> {post.userId.surname}
              </span>
            )}
            {post.userId?.email && (
              <span style={{ marginLeft: 8 }}>
                {post.userId.email}
              </span>
            )}
          </div>
        </div>
        <div className="home-post-date">
          <span>
            {post.createdAt
              ? new Date(post.createdAt).toLocaleString('uz-UZ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              : 'Nomaʼlum vaqt'}
          </span>
        </div>
      </div>
      <div className="home-post-content">
        <p>{post.content}</p>
        {post.postImage && (
          typeof post.postImage === "string" ? (
            <img src={post.postImage} alt="Post" className="home-post-image" />
          ) : post.postImage.url ? (
            <img src={post.postImage.url} alt="Post" className="home-post-image" />
          ) : null
        )}
      </div>
      <div className="home-post-actions">
        <button
          className={`home-like-btn${isLiked ? ' liked' : ''}${likeLoading ? ' loading' : ''}`}
          onClick={onLike}
          disabled={likeLoading}
          title="Like"
        >
          {likeLoading ? (
            <span className="like-loader"></span>
          ) : isLiked ? (
            <FaHeart style={{ color: '#ff5252', fontSize: 22 }} />
          ) : (
            <FaRegHeart style={{ color: '#ff5252', fontSize: 22 }} />
          )}
          <span style={{ fontWeight: 500, color: '#444', marginLeft: 4 }}>
            {post.likes?.length || 0}
          </span>
        </button>
        <button
          className="home-comment-btn"
          onClick={onComment}
          title="Komment"
        >
          <FaRegCommentDots style={{ color: '#0ea5e9', fontSize: 22 }} />
          <span style={{ fontWeight: 500, color: '#444', marginLeft: 4 }}>
            {post.comments?.length || 0}
          </span>
        </button>
      </div>
    </div>
  );
};

export default HomeCard;