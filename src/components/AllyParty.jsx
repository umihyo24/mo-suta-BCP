import PropTypes from "prop-types";

function AllyParty({
  allies,
  phase,
  turnOwner,
  selectedCard,
  actorIdx,
  onSelectActor,
  isUnitAllowed,
  hpPct,
}) {
  return (
    <div className="party">
      {[0, 1, 2].map((index) => {
        const ally = allies[index];

        if (!ally) {
          return (
            <div className="unit" key={index} style={{ opacity: 0.25 }}>
              空
            </div>
          );
        }

        const canUse =
          phase === "アクションフェイズ" &&
          turnOwner === "down" &&
          selectedCard &&
          !ally.acted &&
          ally.hp > 0 &&
          isUnitAllowed(selectedCard, ally);

        const classes = [
          "unit",
          canUse ? "eligible" : "",
          !canUse && selectedCard ? "dim" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const outline =
          phase === "アクションフェイズ" && turnOwner === "down" && actorIdx === index
            ? "2px solid #60a5fa"
            : undefined;

        return (
          <div
            className={classes}
            key={ally.id ?? index}
            onClick={() => onSelectActor(index)}
            style={{
              outline,
              opacity: ally.hp <= 0 ? 0.35 : ally.acted ? 0.5 : undefined,
            }}
            role="presentation"
          >
            {ally.acted && <div className="acted">ACTED</div>}
            <div className="icon">{ally.icon}</div>
            <div>{ally.name}</div>
            <div className="hpbar">
              <i style={{ width: hpPct(ally.hp, ally.max) }} />
            </div>
            <div className="hpnum">
              {ally.hp}/{ally.max}
            </div>
          </div>
        );
      })}
    </div>
  );
}

AllyParty.propTypes = {
  allies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      hp: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      acted: PropTypes.bool,
      species: PropTypes.string,
    })
  ).isRequired,
  phase: PropTypes.string.isRequired,
  turnOwner: PropTypes.oneOf(["up", "down"]).isRequired,
  selectedCard: PropTypes.shape({ id: PropTypes.string }),
  actorIdx: PropTypes.number,
  onSelectActor: PropTypes.func.isRequired,
  isUnitAllowed: PropTypes.func.isRequired,
  hpPct: PropTypes.func.isRequired,
};

AllyParty.defaultProps = {
  selectedCard: null,
  actorIdx: null,
};

export default AllyParty;
