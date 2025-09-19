import PropTypes from "prop-types";

function EnemyParty({
  enemies,
  phase,
  turnOwner,
  selectedCard,
  actorIdx,
  targetIdx,
  hoverPreview,
  onEnemyClick,
  onEnemyHover,
  onEnemyLeave,
  hpPct,
}) {
  return (
    <div className="party">
      {[0, 1, 2].map((index) => {
        const enemy = enemies[index];

        if (!enemy) {
          return (
            <div className="unit" key={index} style={{ opacity: 0.25 }}>
              空
            </div>
          );
        }

        const canSelect =
          phase === "アクションフェイズ" &&
          turnOwner === "down" &&
          selectedCard &&
          actorIdx !== null &&
          enemy.hp > 0;

        const isSelected = targetIdx === index;
        const baseClassName = [
          "unit",
          canSelect ? "can" : "cannot",
        ]
          .filter(Boolean)
          .join(" ");

        const previewActive = hoverPreview && hoverPreview.idx === index;
        const previewText = previewActive
          ? `${enemy.hp}/${enemy.max} → ${Math.max(0, enemy.hp - hoverPreview.expect)}/${enemy.max}`
          : null;

        return (
          <div
            className={baseClassName}
            key={enemy.id ?? index}
            onClick={() => onEnemyClick(index)}
            onMouseEnter={() => onEnemyHover(index)}
            onMouseLeave={() => onEnemyLeave(index)}
            style={{
              outline: isSelected ? "2px solid #60a5fa" : "none",
              opacity: enemy.hp <= 0 ? 0.35 : enemy.acted ? 0.5 : 1,
            }}
            role="presentation"
          >
            {enemy.acted && <div className="acted">ACTED</div>}
            <div className="icon">{enemy.icon}</div>
            <div>{enemy.name}</div>
            <div className="hpbar">
              <i style={{ width: hpPct(enemy.hp, enemy.max) }} />
            </div>
            <div className="hpnum">
              {enemy.hp}/{enemy.max}
            </div>
            {previewText && <div className="preview">{previewText}</div>}
          </div>
        );
      })}
    </div>
  );
}

EnemyParty.propTypes = {
  enemies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      hp: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      acted: PropTypes.bool,
    })
  ).isRequired,
  phase: PropTypes.string.isRequired,
  turnOwner: PropTypes.oneOf(["up", "down"]).isRequired,
  selectedCard: PropTypes.shape({ damage: PropTypes.number }),
  actorIdx: PropTypes.number,
  targetIdx: PropTypes.number,
  hoverPreview: PropTypes.shape({ idx: PropTypes.number, expect: PropTypes.number }),
  onEnemyClick: PropTypes.func.isRequired,
  onEnemyHover: PropTypes.func.isRequired,
  onEnemyLeave: PropTypes.func.isRequired,
  hpPct: PropTypes.func.isRequired,
};

EnemyParty.defaultProps = {
  selectedCard: null,
  actorIdx: null,
  targetIdx: null,
  hoverPreview: null,
};

export default EnemyParty;
