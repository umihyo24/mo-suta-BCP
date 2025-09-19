import PropTypes from "prop-types";

function RevealedCard({ card, label, defaultGuts }) {
  if (!card) return null;

  const guts = card.guts ?? defaultGuts;
  const bottomLabel = card.evade
    ? "EVADE"
    : card.block
    ? `DEF -${card.block}`
    : card.damage
    ? `ATK ${card.damage}${card.aoe ? "・全" : ""}`
    : "DEF";

  return (
    <div className="card front" style={{ width: 140, height: 220 }}>
      <div className="card-top">
        <span>{card.name}</span>
        <span>🔋{guts}</span>
      </div>
      <div className="card-icon">{card.icon}</div>
      <div className="card-bottom">
        <span>{bottomLabel}</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

RevealedCard.propTypes = {
  card: PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.string,
    guts: PropTypes.number,
    evade: PropTypes.bool,
    block: PropTypes.number,
    damage: PropTypes.number,
    aoe: PropTypes.bool,
  }),
  label: PropTypes.string.isRequired,
  defaultGuts: PropTypes.number,
};

RevealedCard.defaultProps = {
  card: null,
  defaultGuts: 0,
};

export default RevealedCard;
