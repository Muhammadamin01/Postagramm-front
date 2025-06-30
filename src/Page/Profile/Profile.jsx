import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';
import Footer from '../../Components/Footer/Footer';

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

const API_URL = 'https://postagramm-backend.onrender.com/api';

const Profile = () => {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [showImgModal, setShowImgModal] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editJob, setEditJob] = useState('');
  const [editHobby, setEditHobby] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editImgFile, setEditImgFile] = useState(null);
  const [editImgPreview, setEditImgPreview] = useState(null);
  const [editMsg, setEditMsg] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [likeLoading, setLikeLoading] = useState({});
  const [followLoading, setFollowLoading] = useState(false);

  // For cache busting profile image (so image changes are shown instantly)
  const [imgCacheBust, setImgCacheBust] = useState(Date.now());

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !loggedInUserId) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth', { replace: true });
        return;
      }
      const targetUserId = paramUserId || loggedInUserId;
      try {
        const userResponse = await fetch(`${API_URL}/user/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error(await userResponse.text());
        setUser(await userResponse.json());

        const meResponse = await fetch(`${API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meResponse.ok) setCurrentUser(await meResponse.json());

        const postsResponse = await fetch(`${API_URL}/post/my-posts/${targetUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!postsResponse.ok) throw new Error(await postsResponse.text());
        setPosts(await postsResponse.json());

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (err.message?.includes('401')) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/auth', { replace: true });
        }
      }
    };
    fetchUserData();
  }, [token, loggedInUserId, paramUserId, navigate]);

  // LIKE/UNLIKE
  const handleLike = async (postId, liked) => {
    setLikeLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const url = `${API_URL}/post/${liked ? "unlike" : "like"}/${postId}`;
      const response = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(await response.text());
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
              ...post,
              likes: liked
                ? post.likes.filter((id) => id !== loggedInUserId)
                : [...post.likes, loggedInUserId],
            }
            : post
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // COMMENTS MODAL
  const openCommentsModal = async (post) => {
    setModalPost(post);
    setNewComment('');
    setCommentError('');
    setShowCommentsModal(true);
    try {
      const response = await fetch(`${API_URL}/comment/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.text());
      setComments(await response.json());
    } catch {
      setComments([]);
    }
  };
  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setModalPost(null);
    setComments([]);
    setNewComment('');
    setCommentError('');
  };
  const handleCommentSubmit = async () => {
    if (!modalPost || !newComment.trim()) return;
    setCommentError('');
    setCommentLoading(true);
    try {
      const response = await fetch(`${API_URL}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: modalPost._id, text: newComment }),
      });
      if (!response.ok) {
        setCommentError(await response.text());
        setCommentLoading(false);
        return;
      }
      const addedComment = await response.json();
      setComments((prev) => [addedComment, ...prev]);
      setNewComment('');
    } catch {
      setCommentError('Komment qo‘shishda xatolik');
    } finally {
      setCommentLoading(false);
    }
  };

  // FOLLOW/UNFOLLOW LOGIC
  const isOwnProfile = loggedInUserId === user?._id;
  const isFollowing = !!currentUser?.following?.some(id => String(id) === String(user?._id));

  const handleFollow = async (targetUserId) => {
    setFollowLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/follow/${targetUserId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUser(data.user);
      setCurrentUser(data.currentUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    setFollowLoading(true);
    try {
      const response = await fetch(`${API_URL}/user/unfollow/${targetUserId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUser(data.user);
      setCurrentUser(data.currentUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const openImgModal = () => {
    setShowImgModal(true);
    setImgFile(null);
    setImgPreview(null);
  };
  const closeImgModal = () => {
    setShowImgModal(false);
    setImgFile(null);
    setImgPreview(null);
  };
  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleImgUpload = async (e) => {
    e.preventDefault();
    if (!imgFile) return;
    setImgLoading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', imgFile);
      formData.append('username', user.username);
      formData.append('surname', user.surname);
      if (user.job) formData.append('job', user.job);
      if (user.hobby) formData.append('hobby', user.hobby);

      const response = await fetch(`${API_URL}/user/${user._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUser((prev) => ({
        ...prev,
        profileImage: data.user.profileImage,
      }));
      setImgCacheBust(Date.now());
      closeImgModal();
    } catch (err) {
      setError("Rasm yuklashda xatolik: " + err.message);
    }
    setImgLoading(false);
  };

  // EDIT INFO MODAL
  const openEditModal = () => {
    setEditUsername(user.username || "");
    setEditSurname(user.surname || "");
    setEditEmail(user.email || "");
    setEditJob(user.job || "");
    setEditHobby(user.hobby || "");
    setEditCurrentPassword('');
    setEditNewPassword('');
    setEditImgFile(null);
    setEditImgPreview(user.profileImage?.url || "");
    setEditMsg('');
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditMsg('');
    setEditImgFile(null);
    setEditImgPreview(user.profileImage?.url || "");
    setEditCurrentPassword('');
    setEditNewPassword('');
  };

  const handleEditImgChange = (e) => {
    const file = e.target.files[0];
    setEditImgFile(file);
    if (file) setEditImgPreview(URL.createObjectURL(file));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg('');
    try {
      const formData = new FormData();
      formData.append('username', editUsername);
      formData.append('surname', editSurname);
      formData.append('email', editEmail);
      formData.append('job', editJob);
      formData.append('hobby', editHobby);
      if (editImgFile) formData.append('profileImage', editImgFile);
      if (editCurrentPassword) formData.append('currentPassword', editCurrentPassword);
      if (editNewPassword) formData.append('newPassword', editNewPassword);

      const res = await fetch(`${API_URL}/user/${user._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik");
      setUser(data.user);
      setImgCacheBust(Date.now());
      setEditMsg("Profil yangilandi!");
      closeEditModal();
    } catch (err) {
      setEditMsg(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <CustomLoader />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="profile-error">
          <div className="error">Xatolik yuz berdi: {error}</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="profile-error">
          <div className="error">Foydalanuvchi ma’lumotlari topilmadi</div>
        </div>
      </>
    );
  }

  return (
    <div className="profile-page-ig d-flex flex-column min-vh-100">
      {/* Orqaga qaytish buttoni faqat boshqa user profilida korinsin */}
      {!isOwnProfile && (
        <button
          className="profile-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Orqaga qaytish
        </button>
      )}
      <div className="profile-ig-header">
        <div style={{ position: 'relative' }}>
          <img
            src={
              user.profileImage && user.profileImage.url
                ? `${user.profileImage.url}?t=${imgCacheBust}`
                : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_items_boosted&w=740"
            }
            alt="Profile"
            className="profile-ig-avatar"
            onClick={isOwnProfile ? openImgModal : undefined}
            style={{ cursor: isOwnProfile ? 'pointer' : 'default', border: isOwnProfile ? '2px solid #3897f0' : undefined }}
            title={isOwnProfile ? "Rasmni o'zgartirish" : ""}
          />
        </div>
        <div className="profile-ig-info">
          <div className="profile-ig-username-row">
            <span className="profile-ig-username">{user.username}</span>
            {isOwnProfile ? (
              <button className="profile-ig-edit-btn" onClick={openEditModal}>
                Profilni tahrirlash
              </button>
            ) : (
              isFollowing ? (
                <button className="profile-ig-edit-btn" onClick={() => handleUnfollow(user._id)} disabled={followLoading}>
                  {followLoading ? <span className="btn-small-loader"></span> : "Unfollow"}
                </button>
              ) : (
                <button className="profile-ig-edit-btn" onClick={() => handleFollow(user._id)} disabled={followLoading}>
                  {followLoading ? <span className="btn-small-loader"></span> : "Follow"}
                </button>
              )
            )}
          </div>
          <div className="profile-ig-stats">
            <div className="profile-ig-stat"><span className="profile-ig-stat-value">{posts.length}</span><span className="profile-ig-stat-label">posts</span></div>
            <div className="profile-ig-stat"><span className="profile-ig-stat-value">{user.followers?.length || 0}</span><span className="profile-ig-stat-label">followers</span></div>
            <div className="profile-ig-stat"><span className="profile-ig-stat-value">{user.following?.length || 0}</span><span className="profile-ig-stat-label">following</span></div>
          </div>
          <div className="profile-ig-jobhobby-row">
            <div><b>Kasbi:</b> <span>{user.job ? user.job : "Ko'rsatilmagan"}</span></div>
            <div><b>Hobby:</b> <span>{user.hobby ? user.hobby : "Ko'rsatilmagan"}</span></div>
          </div>
          <div className="profile-ig-jobsurname-row">
            <div><b>Lastname:</b> <span>{user.surname ? user.surname : "Ko'rsatilmagan"}</span></div>
            <div><b>Email:</b> <span>{user.email}</span></div>
          </div>
        </div>
      </div>
      <div className="profile-ig-posts flex-grow-1">
        <h3 className='h3-post'>Postlar</h3>
        {posts.length > 0 ? (
          <div className="profile-ig-posts-list">
            {posts.map((post) => (
              <div key={post._id} className="profile-ig-post-card">
                {post.postImage && post.postImage.url && (
                  <img src={post.postImage.url} alt="Post" className="profile-ig-post-image" />
                )}
                <div className="profile-ig-post-content">{post.content}</div>
                <div className="profile-ig-post-likecomment">
                  <button
                    className={`like-btn ${post.likes && post.likes.includes(loggedInUserId) ? "liked" : ""}`}
                    onClick={() => handleLike(post._id, post.likes && post.likes.includes(loggedInUserId))}
                    disabled={!!likeLoading[post._id]}
                  >
                    {likeLoading[post._id] ?
                      <span className="btn-small-loader"></span>
                      :
                      <>❤️ {post.likes?.length || 0}</>
                    }
                  </button>
                  <button
                    className="open-comments-btn"
                    onClick={() => openCommentsModal(post)}
                  >
                    💬 Kommentlar
                  </button>
                </div>
                <div className="profile-ig-post-date">
                  {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Noma’lum vaqt'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-ig-no-posts">Hozircha postlar yo‘q</p>
        )}
      </div>

      {/* --- IMAGE MODAL --- */}
      {showImgModal && (
        <div className="comments-modal-backdrop" onClick={closeImgModal}>
          <div className="comments-modal" onClick={e => e.stopPropagation()}>
            <div className="comments-modal-header">
              <span>Profil rasmni yuklash</span>
              <button className="close-comments-btn" onClick={closeImgModal}>✖</button>
            </div>
            <form className="comments-modal-body" onSubmit={handleImgUpload}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImgChange}
                style={{ marginBottom: 16 }}
                disabled={imgLoading}
              />
              {imgPreview && (
                <img src={imgPreview} alt="preview" style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 16 }} />
              )}
              <button className="modal-add-comment-btn" type="submit" disabled={imgLoading} style={{ width: "100%" }}>
                {imgLoading ? <span className="btn-small-loader"></span> : "Saqlash"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && (
        <div className="comments-modal-backdrop" onClick={closeEditModal}>
          <div className="comments-modal" onClick={e => e.stopPropagation()}>
            <div className="comments-modal-header">
              <span>Profilni tahrirlash</span>
              <button className="close-comments-btn" onClick={closeEditModal}>✖</button>
            </div>
            <form className="comments-modal-body" onSubmit={handleEditSave}>
              <label>
                Username:
                <input
                  type="text"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="modal-comment-input"
                  required
                  style={{ marginBottom: 12 }}
                  disabled={editLoading}
                />
              </label>
              <label>
                Lastname
                <input
                  type="text"
                  value={editSurname}
                  onChange={e => setEditSurname(e.target.value)}
                  className="modal-comment-input"
                  required
                  style={{ marginBottom: 12 }}
                  disabled={editLoading}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="modal-comment-input"
                  required
                  style={{ marginBottom: 12 }}
                  disabled={editLoading}
                />
              </label>
              <label>
                Kasbi:
                <input
                  type="text"
                  value={editJob}
                  onChange={e => setEditJob(e.target.value)}
                  className="modal-comment-input"
                  placeholder="Kasbingiz"
                  disabled={editLoading}
                />
              </label>
              <label>
                Hobby:
                <input
                  type="text"
                  value={editHobby}
                  onChange={e => setEditHobby(e.target.value)}
                  className="modal-comment-input"
                  placeholder="Hobbiyingiz"
                  disabled={editLoading}
                />
              </label>
              <label>
                Profil rasmi:
                <input
                  type="file"
                  accept="image/*"
                  style={{ marginTop: 12 }}
                  onChange={handleEditImgChange}
                  disabled={editLoading}
                />
              </label>
              {editImgPreview && (
                <img src={editImgPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', margin: '10px auto', display: 'block' }} />
              )}
              <label className='mb-1 text-center d-block'>eski parolni kiriting ( yangisini qoyish uchun):</label>
              <input className='input-parol'
                type="password"
                value={editCurrentPassword}
                onChange={e => setEditCurrentPassword(e.target.value)}
                disabled={editLoading}
              />
              <label className='d-block text-center'>Yangi parolni kiriting:</label>
              <input className='input-parol'
                type="password"
                value={editNewPassword}
                onChange={e => setEditNewPassword(e.target.value)}
                disabled={editLoading}
              />
              <button className="modal-add-comment-btn" type="submit" disabled={editLoading} style={{ marginTop: 14, width: "100%" }}>
                {editLoading ? <span className="btn-small-loader"></span> : "Saqlash"}
              </button>
              {editMsg && <div className="modal-comment-error">{editMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {showCommentsModal && modalPost && (
        <div className="comments-modal-backdrop" onClick={closeCommentsModal}>
          <div className="comments-modal" onClick={e => e.stopPropagation()}>
            <div className="comments-modal-header">
              <span>Komentlar</span>
              <button className="close-comments-btn" onClick={closeCommentsModal}>✖</button>
            </div>
            <div className="comments-modal-body">
              {comments.length > 0 ? (
                <div className="modal-comment-list">
                  {comments.map((c) => (
                    <div key={c._id} className="modal-comment-item">
                      <img
                        src={c.userId?.profileImage?.url ? c.userId.profileImage.url : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_items_boosted&w=740"}
                        alt="avatar"
                        className="modal-comment-avatar"
                        style={{ width: 28, height: 28, borderRadius: "50%", marginRight: 8 }}
                      />
                      <span className="modal-comment-user">{c.userId?.username || "user"}:</span>
                      <span className="modal-comment-text">{c.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="modal-no-comments">Kommentlar yo‘q</div>
              )}
            </div>
            <div className="comments-modal-footer">
              <input
                type="text"
                className="modal-comment-input"
                placeholder="Komment yozish..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCommentSubmit(); }}
                disabled={commentLoading}
              />
              <button className="modal-add-comment-btn" onClick={handleCommentSubmit} disabled={commentLoading}>
                {commentLoading ? <span className="btn-small-loader"></span> : "Qo‘shish"}
              </button>
            </div>
            {commentError && <div className="modal-comment-error">{commentError}</div>}
          </div>
        </div>
      )}

      {/* Footer faqat postlar yuklab bolgandan keyin va har doim pastda */}
      {!loading && <Footer />}
    </div>
  );
};

export default Profile;