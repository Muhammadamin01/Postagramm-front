import React from 'react';
import { Modal, ModalHeader, ModalBody, Spinner, Form } from 'reactstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPaperPlane } from 'react-icons/fa';

const CommentModal = ({
  isOpen,
  toggle,
  post,
  commentText,
  setCommentText,
  editingCommentId,
  setEditingCommentId,
  editingCommentText,
  setEditingCommentText,
  commentLoading,
  commentDeleteLoading,
  commentUpdateLoading,
  commentError,
  onCommentSubmit,
  onCommentDelete,
  onCommentUpdate,
  userId,
}) => (
  <Modal isOpen={isOpen} toggle={toggle} size="md" centered className="comment-modal">
    <ModalHeader toggle={toggle}>Kommentlar</ModalHeader>
    <ModalBody>
      <div className="comment-list">
        {post?.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-top">
                <div>
                  <span className="comment-username">{comment.userId?.username || "Anonim"}:</span>
                  {editingCommentId === comment._id ? (
                    <input
                      className="comment-input"
                      value={editingCommentText}
                      onChange={e => setEditingCommentText(e.target.value)}
                      disabled={!!commentUpdateLoading[comment._id]}
                    />
                  ) : (
                    <span className="comment-text">{comment.text}</span>
                  )}
                </div>
                {comment.userId?._id === userId && (
                  <>
                    {editingCommentId === comment._id ? (
                      <div className="comment-actions comment-actions-below">
                        <button
                          className="comment-action-btn edit"
                          onClick={onCommentUpdate}
                          disabled={!!commentUpdateLoading[comment._id]}
                          title="Saqlash"
                        >
                          {commentUpdateLoading[comment._id] ? (
                            <Spinner size="sm" color="light" />
                          ) : (
                            <FaCheck />
                          )}
                        </button>
                        <button
                          className="comment-action-btn delete"
                          onClick={() => setEditingCommentId(null)}
                          disabled={!!commentUpdateLoading[comment._id]}
                          title="Bekor qilish"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="comment-actions">
                        <button
                          className="comment-action-btn edit"
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditingCommentText(comment.text);
                          }}
                          disabled={!!commentUpdateLoading[comment._id]}
                          title="Tahrirlash"
                        >
                          {commentUpdateLoading[comment._id] ? (
                            <Spinner size="sm" color="light" />
                          ) : (
                            <FaEdit />
                          )}
                        </button>
                        <button
                          className="comment-action-btn delete"
                          onClick={() => onCommentDelete(comment._id)}
                          disabled={!!commentDeleteLoading[comment._id]}
                          title="O‘chirish"
                        >
                          {commentDeleteLoading[comment._id] ? (
                            <Spinner size="sm" color="light" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="comment-meta">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", color: "#9ea5b5", fontSize: 16 }}>
            Kommentlar yo‘q
          </div>
        )}
      </div>
      <Form className="comment-modal-footer" onSubmit={onCommentSubmit}>
        <input
          type="text"
          className="comment-input  "
          placeholder="Komment yozing..."
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          disabled={commentLoading}
        />
        <button
          className="comment-send-btn"
          type="submit"
          disabled={commentLoading || !commentText.trim()}
          title="Yuborish"
        >
          {commentLoading ? <Spinner size="sm" color="light" /> : <FaPaperPlane />}
        </button>
      </Form>
      {commentError && <div className="text-danger mt-2">{commentError}</div>}
    </ModalBody>
  </Modal>
);

export default CommentModal;