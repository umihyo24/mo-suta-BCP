import PropTypes from "prop-types";

function GameOverlay({ visible, message, onProceed }) {
  if (!visible) return null;

  return (
    <div className="overlay" onClick={onProceed} role="presentation">
      <div className="overlayMsg">
        {message}
        <div className="overlayHint">(クリックで進む)</div>
      </div>
    </div>
  );
}

GameOverlay.propTypes = {
  visible: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onProceed: PropTypes.func.isRequired,
};

export default GameOverlay;
