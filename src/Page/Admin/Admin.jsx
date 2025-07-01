import React, { useState, useEffect, useRef } from 'react';
import axios from '../../API/instance';
import { useNavigate, Link } from 'react-router-dom';
import './Admin.css';

const API = '/api/admin';

// Fullscreen page loader (custom for all page)
const FullPageLoader = () => (
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

const LoaderMini = () => <span className="admin-spinner-mini"></span>;
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="admin-modal-bg" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <span>{title}</span>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [tab, setTab] = useState('posts');
  const [err, setErr] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [deleting, setDeleting] = useState({});
  const [saving, setSaving] = useState(false);
  // State to track if image should be removed
  const [deleteCurrentPostImage, setDeleteCurrentPostImage] = useState(false); 

  const fileInputRef = useRef();
  const navigate = useNavigate();

  const activePosts = posts.filter(p => !p.deleted && !p.isDeleted);

  const activeComments = comments.filter(c => {
    let postId = (typeof c.postId === "object" && c.postId !== null) ? c.postId._id : c.postId;
    return (
      postId &&
      activePosts.find(p => String(p._id) === String(postId)) &&
      !c.deleted && !c.isDeleted
    );
  });

  const activeLikes = activePosts.reduce((sum, p) => sum + (Array.isArray(p.likes) ? p.likes.length : 0), 0);

  const status = {
    posts: activePosts.length,
    comments: activeComments.length,
    users: users.filter(u => u.role !== 101 && u.role !== "101").length,
    likes: activeLikes,
  };

  // User search
  const normalUsers = users.filter(u => u.role !== 101 && u.role !== "101");
  const filteredUsers = userSearch.trim()
    ? normalUsers.filter(u =>
        u.username?.toLowerCase().includes(userSearch.trim().toLowerCase())
      )
    : normalUsers;

  // Ma'lumotlarni olish
  const fetchAll = async () => {
    setLoading(true);
    setErr('');
    try {
      const [usersR, postsR, commentsR] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/posts`),
        axios.get(`${API}/comments`),
      ]);
      setUsers(usersR.data);
      setPosts(postsR.data);
      setComments(commentsR.data);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Xatolik");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Post, comment, userni darhol frontdan o'chirish
  const handleDelete = async (type, id) => {
    if (!window.confirm('Ishonchingiz komilmi?')) return;
    setErr('');
    setDeleting({ type, id });
    try {
      await axios.delete(`${API}/${type}/${id}`);
      if (type === "post") {
        setPosts(prev => prev.filter(item => item._id !== id));
        setComments(prev => prev.filter(c => {
          let postId = (typeof c.postId === "object" && c.postId !== null) ? c.postId._id : c.postId;
          return String(postId) !== String(id);
        }));
      } else if (type === "comment") {
        setComments(prev => prev.filter(item => item._id !== id));
      } else if (type === "user") {
        setUsers(prev => prev.filter(item => item._id !== id));
        setPosts(prev => prev.filter(item => item.userId?._id !== id));
        setComments(prev => prev.filter(item => item.userId?._id !== id));
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
    setDeleting({});
  };

  // Edit modal ochish
  const handleEdit = (type, data) => {
    setModal({ type, data });
    setEditData({ 
      ...data, 
      password: "", 
      hobby: data.hobby || "", 
      job: data.job || "" 
    });
    setImgPreview(data.profileImage?.url || data.postImage?.url || '');
    // Reset the deleteCurrentPostImage state when a new modal opens
    setDeleteCurrentPostImage(false); 
  };

  // Edit modal inputlar
  const handleEditChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'file' && files && files[0]) {
      setEditData(prev => ({ ...prev, [name]: files[0] }));
      setImgPreview(URL.createObjectURL(files[0]));
      // If a new file is selected, ensure delete checkbox is unchecked
      setDeleteCurrentPostImage(false); 
    } else if (name === 'deleteCurrentPostImage') { // Handle the new checkbox
      setDeleteCurrentPostImage(checked);
      // If delete is checked, clear any selected new file
      if (checked) {
        setEditData(prev => ({ ...prev, postImage: undefined })); // Clear the file data
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input visual
        setImgPreview(''); // Clear image preview
      }
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Darhol frontdan update qilish
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const fd = new FormData();
      for (let key in editData) {
        if (
          editData[key] !== undefined &&
          (key !== "password" || editData.password) // Only include password if it's not empty
        ) {
          fd.append(key, editData[key]);
        }
      }

      // Add the deleteCurrentPostImage flag to FormData if it's a post and checked
      if (modal.type === 'post' && deleteCurrentPostImage) {
        fd.append('deleteCurrentPostImage', true);
      }

      const url = `${API}/${modal.type}/${editData._id}`;
      const res = await axios.put(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (modal.type === "post") {
        setPosts(prev => prev.map(item =>
          item._id === editData._id
            ? { ...item, ...res.data.post }
            : item
        ));
      } else if (modal.type === "user") {
        setUsers(prev => prev.map(item =>
          item._id === editData._id
            ? { ...item, ...res.data.user }
            : item
        ));
      } else if (modal.type === "comment") {
        setComments(prev => prev.map(item =>
          item._id === editData._id
            ? { ...item, ...res.data }
            : item
        ));
      }
      setModal(null); 
      setImgPreview('');
      setDeleteCurrentPostImage(false); // Reset this state
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    }
    setSaving(false);
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== "101") navigate('/home', { replace: true });
  }, [navigate]);

  const closeModal = () => { 
    setModal(null); 
    setImgPreview(''); 
    setDeleteCurrentPostImage(false); // Also reset on close
  };
  const isAdmin = user => (user.role === 101 || user.role === '101'); // This function is not used in the provided code.

  return (
    <div className="admin-container">
      {loading && <FullPageLoader />}
      {err && <div className="admin-alert">{err}</div>}
      {!loading && (
        <>
          <ul className="admin-tabs pt-5">
            <li>
              <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>
                Postlar <span className="admin-tab-count">{status.posts}</span>
              </button>
            </li>
            <li>
              <button className={tab === 'comments' ? 'active' : ''} onClick={() => setTab('comments')}>
                Kommentlar <span className="admin-tab-count">{status.comments}</span>
              </button>
            </li>
            <li>
              <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
                Foydalanuvchilar <span className="admin-tab-count">{status.users}</span>
              </button>
            </li>
          </ul>

          {/* USER SEARCH */}
          {tab === 'users' && (
            <div className="admin-users-search-bar">
              <input
                className="admin-users-search-input"
                type="text"
                placeholder="Foydalanuvchi nomini qidirish..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            filteredUsers.length === 0 ? (
              <div className="admin-no-users-message">
                <span>Bunday foydalanuvchi yo‘q</span>
              </div>
            ) : (
              <div className="admin-card-list">
                {filteredUsers.map(user => (
                  <div className="admin-card" key={user._id}>
                    <div className="admin-card-left">
                      <div className="admin-card-avatar">
                        {user.profileImage?.url
                          ? <img src={user.profileImage.url} alt="avatar" />
                          : <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740' />
                        }
                      </div>
                      <div>
                        <Link to={`/profile/${user._id}`} className="admin-card-username">{user.username}</Link>
                        <div className="admin-card-date">{user.email}</div>
                      </div>
                    </div>
                    <div className="admin-card-body">
                      <div className="admin-card-role">Kasb: {user.job || ''}</div>
                      <div className="admin-card-role">Hobby: {user.hobby || ''}</div>
                    </div>
                    <div className="admin-card-actions">
                      <button className="admin-table-btn warning me-1"
                        onClick={() => handleEdit('user', user)}
                      >Edit</button>
                      <button className="admin-table-btn danger"
                        onClick={() => handleDelete('user', user._id)} disabled={deleting.type === 'user' && deleting.id === user._id}>
                        {deleting.type === 'user' && deleting.id === user._id ? <LoaderMini /> : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* POSTS */}
          {tab === 'posts' && (
            <div className="admin-card-list">
              {activePosts.map(post => (
                <div className="admin-card" key={post._id}>
                  <div className="admin-card-left">
                    <div className="admin-card-avatar">
                      {post.userId?.profileImage?.url
                        ? <img src={post.userId.profileImage.url} alt="avatar" />
                        : <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740'/>
                      }
                    </div>
                    <div>
                      <div className="admin-card-username">{post.userId?.username}</div>
                      <div className="admin-card-date">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="admin-card-body">
                    {post.postImage?.url &&
                      <img className="admin-card-image" src={post.postImage.url} alt="post" />
                    }
                    <div className="admin-card-text">{post.content}</div>
                  </div>
                  <div className="admin-card-actions">
                    <div>
                      <span className="admin-card-likes">❤️ {Array.isArray(post.likes) ? post.likes.length : 0}</span>
                      <span className="admin-card-comments">💬 {activeComments.filter(c => {
                        let cid = (typeof c.postId === "object" && c.postId !== null) ? c.postId._id : c.postId;
                        return String(cid) === String(post._id);
                      }).length}</span>
                    </div>
                    <div>
                      <button className="admin-table-btn warning me-1" onClick={() => handleEdit('post', post)}>Edit</button>
                      <button className="admin-table-btn danger" onClick={() => handleDelete('post', post._id)} disabled={deleting.type === 'post' && deleting.id === post._id}>
                        {deleting.type === 'post' && deleting.id === post._id ? <LoaderMini /> : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* COMMENTS */}
          {tab === 'comments' && (
            <div className="admin-card-list">
              {activeComments.map(c => (
                <div className="admin-card" key={c._id}>
                  <div className="admin-card-left">
                    <div className="admin-card-avatar">
                      <img src={c.userId?.profileImage?.url || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740"} alt="avatar" />
                    </div>
                    <div>
                      <Link to={`/profile/${c.userId?._id}`} className="admin-card-username">{c.userId?.username}</Link>
                      <div className="admin-card-date">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="admin-card-body">
                    <div className="admin-card-comment">{c.text}</div>
                    <div className="admin-card-post">
                      <span style={{ color: "#888" }}>Post:</span> {typeof c.postId === 'object' && c.postId?.content
                        ? c.postId.content.slice(0, 50)
                        : activePosts.find(p => String(p._id) === String(c.postId))
                          ? activePosts.find(p => String(p._id) === String(c.postId)).content.slice(0, 50)
                          : <span className="text-danger">[Post o'chirilgan]</span>}
                    </div>
                  </div>
                  <div className="admin-card-actions">
                    <button className="admin-table-btn warning me-1" onClick={() => handleEdit('comment', c)}>Edit</button>
                    <button className="admin-table-btn danger" onClick={() => handleDelete('comment', c._id)} disabled={deleting.type === 'comment' && deleting.id === c._id}>
                      {deleting.type === 'comment' && deleting.id === c._id ? <LoaderMini /> : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal for Edit */}
          <Modal
            show={!!modal}
            onClose={closeModal}
            title={modal ? `Edit ${modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}` : ""}
          >
            {modal && (
              <form className="admin-modal-form" onSubmit={handleEditSubmit} encType="multipart/form-data">
                {modal.type === 'user' && (
                  <>
                    <label>Username:
                      <input className="admin-form-control" name="username" value={editData.username || ""}
                        onChange={handleEditChange} required />
                    </label>
                    <label>Email:
                      <input className="admin-form-control" name="email" value={editData.email || ""}
                        onChange={handleEditChange} required />
                    </label>
                    <label>Kasb:
                      <input className="admin-form-control" name="job" value={editData.job || ""}
                        onChange={handleEditChange} />
                    </label>
                    <label>Hobby:
                      <input className="admin-form-control" name="hobby" value={editData.hobby || ""}
                        onChange={handleEditChange} />
                    </label>
                    <label>Password:
                      <input className="admin-form-control" name="password" type="password" value={editData.password || ""}
                        onChange={handleEditChange} />
                      <span className="admin-modal-hint">To‘ldirsangiz, parol yangilanadi</span>
                    </label>
                    <label>Avatar:
                      <input className="admin-form-control" type="file" name="profileImage"
                        ref={fileInputRef}
                        onChange={handleEditChange} />
                      {imgPreview && <img src={imgPreview} alt="preview" width={30} height={30} style={{ borderRadius: "50%", objectFit: "cover" }} />}
                    </label>
                  </>
                )}
                {modal.type === 'post' && (
                  <>
                    <label>Matn: <textarea className="admin-form-control" name="content" value={editData.content || ""}
                      onChange={handleEditChange} required /></label>
                    <label>Rasm:
                      <input className="admin-form-control" type="file" name="postImage"
                        ref={fileInputRef}
                        onChange={handleEditChange}
                        disabled={deleteCurrentPostImage} // Disable if delete checkbox is checked
                      />
                      {/* Show preview only if delete checkbox is NOT checked and there's a preview */}
                      {!deleteCurrentPostImage && imgPreview && <img src={imgPreview} alt="preview" width={30} height={30} style={{ borderRadius: "50%", objectFit: "cover" }} />}
                    </label>
                    {/* New checkbox for deleting the current image */}
                    {modal.data.postImage?.url && ( // Only show if there's an existing image
                      <label className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          name="deleteCurrentPostImage"
                          checked={deleteCurrentPostImage}
                          onChange={handleEditChange}
                        />
                        <span>Hozirgi rasmni o‘chirish</span>
                      </label>
                    )}
                  </>
                )}
                {modal.type === 'comment' && (
                  <>
                    <label>Matn: <textarea className="admin-form-control" name="text" value={editData.text || ""}
                      onChange={handleEditChange} required /></label>
                  </>
                )}
                <button className="admin-modal-btn primary" type="submit" disabled={saving}>
                  {saving ? <LoaderMini /> : "Saqlash"}
                </button>
                <button type="button" className="admin-modal-btn" onClick={closeModal}>Orqaga</button>
              </form>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default AdminPage;