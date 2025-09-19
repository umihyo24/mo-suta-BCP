import PropTypes from "prop-types";

function PlayerHand({
  cards,
  phase,
  turnOwner,
  selectedCardIdx,
  gutsSelect,
  onCardPlay,
  onToggleGuts,
  speciesToIcon,
}) {
  return (
    <div className="hand">
      {[0, 1, 2, 3, 4].map((index) => {
        const card = cards[index];
        const isSelected = selectedCardIdx === index;
        const isGutsSelected = gutsSelect.has(index);

        if (!card) {
          return <div className="card front" key={index} style={{ opacity: 0.25 }} />;
        }

        const cost = card.guts ?? index + 1;
        const tag =
          card.damage > 0
            ? `ATK ${card.damage}`
            : card.evade
            ? "EVADE"
            : card.block
            ? `DEF -${card.block}`
            : "—";

        const requirementLabel = Array.isArray(card.allowedSpecies) && card.allowedSpecies.length > 0
          ? card.allowedSpecies.map((species) => speciesToIcon[species] ?? species).join(" ")
          : card.speciesReq
          ? speciesToIcon[card.speciesReq] ?? card.speciesReq
          : "";

        const handleClick = () => {
          if (phase === "ガッツフェイズ" && turnOwner === "down") {
            onToggleGuts(index);
          } else {
            onCardPlay(index);
          }
        };

        return (
          <div
            key={card.id}
            className={`card front ${isSelected ? "selected" : ""}`.trim()}
            onClick={handleClick}
            style={{ outline: isGutsSelected ? "3px solid #60a5fa" : "none" }}
            role="presentation"
          >
            <div className="card-top">
              <span>{card.name}</span>
              <span>🔋{cost}</span>
            </div>
            <div className="card-icon">{card.icon}</div>
            <div className="card-bottom">
              <span>{tag}</span>
              <span>{requirementLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

PlayerHand.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  phase: PropTypes.string.isRequired,
  turnOwner: PropTypes.oneOf(["up", "down"]).isRequired,
  selectedCardIdx: PropTypes.number,
  gutsSelect: PropTypes.instanceOf(Set).isRequired,
  onCardPlay: PropTypes.func.isRequired,
  onToggleGuts: PropTypes.func.isRequired,
  speciesToIcon: PropTypes.objectOf(PropTypes.string).isRequired,
};

PlayerHand.defaultProps = {
  selectedCardIdx: null,
};

export default PlayerHand;
