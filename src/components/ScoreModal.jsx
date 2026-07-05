function ScoreModal({ isOpen, message, onPlayAgain, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h2>New high score!</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" onClick={onPlayAgain}>Play again</button>
          <button type="button" className="secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ScoreModal;
