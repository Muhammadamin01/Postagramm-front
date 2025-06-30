import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./ModalNotification.css"

const NotificationModal = ({ notification, onClose }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const senderId = notification?.senderId?._id || notification?.senderId;
    if (senderId) {
      navigate(`/profile/${senderId}`);
      onClose();
    } else {
      alert('Profilga o‘tishda xatolik yuz berdi. Sender ID topilmadi.');
    }
  };

  const username =
    notification?.senderId?.username ||
    notification?.senderUsername ||
    (typeof notification?.senderId === "string" ? notification.senderId : null) ||
    "Foydalanuvchi";

  // Comment (izoh) textini aniqlash
  const commentText =
    notification?.commentText ||
    notification?.comment?.text ||
    notification?.comment ||
    null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bg-light" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title text-center">Xabarlar</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <p>
            <strong>Turi:</strong> {notification?.type || 'Noma’lum'}
          </p>
          <p>
            <strong>Xabar:</strong> {notification?.message || 'Xabar yo‘q'}
          </p>
          <p>
            <strong>Kimdan:</strong> {username}
          </p>
          <p>
            <strong>Vaqt:</strong>{' '}
            {notification?.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : 'Noma’lum vaqt'}
          </p>
          {commentText && (
            <div style={{ margin: '10px 0' }}>
              <strong>Koment:</strong>
              <div
                style={{
                  background: '#f1f5fa',
                  borderRadius: '7px',
                  padding: '8px 12px',
                  marginTop: '4px',
                  color: '#21293c',
                  fontSize: '1.05em',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line'
                }}
              >
                {commentText}
              </div>
            </div>
          )}
          {notification?.postId && notification.postId.content ? (
            <div>
              <p><strong>Post:</strong></p>
              {notification.postId.postImage?.url && (
                <img
                  src={notification.postId.postImage?.url}
                  alt="Post"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              )}
              <p>{notification.postId.content}</p>
            </div>
          ) : notification?.type === 'follow' ? (
            <p><strong>Post:</strong> Yo‘q</p>
          ) : (
            <p><strong>Post:</strong> Post topilmadi</p>
          )}
          <button className="btn btn-primary mt-3" onClick={handleProfileClick}>
            Profilga O‘tish
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;