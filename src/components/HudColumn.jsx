import PropTypes from "prop-types";

function HudColumn({
  enemyG,
  enemyDeckCount,
  playerG,
  playerDeckCount,
  turnCount,
  turnOwner,
  phase,
}) {
  return (
    <div className="hudCol">
      <div className="hudBox">
        <div className="hudTitle">⬆ 上側</div>
        <div className="hudRow">
          <span className="gIcon">🔋</span>
          <span className="hudValue">{enemyG}</span>
        </div>
        <div className="sep" />
        <div className="hudRow">
          <span className="dIcon">🃏</span>
          <span className="hudValue">{enemyDeckCount}</span>
        </div>
      </div>

      <div className="hudBox">
        <div className="hudTitle">ターン</div>
        <div className="hudValue">{turnCount}</div>
        <div className="sep" />
        <div className="hudTitle">手番</div>
        <div className="hudValue">{turnOwner === "up" ? "⬆" : "⬇"}</div>
        <div className="sep" />
        <div className="hudTitle">フェーズ</div>
        <div className="hudValue">{phase}</div>
      </div>

      <div className="hudBox">
        <div className="hudTitle">⬇ 下側</div>
        <div className="hudRow">
          <span className="gIcon">🔋</span>
          <span className="hudValue">{playerG}</span>
        </div>
        <div className="sep" />
        <div className="hudRow">
          <span className="dIcon">🃏</span>
          <span className="hudValue">{playerDeckCount}</span>
        </div>
      </div>
    </div>
  );
}

HudColumn.propTypes = {
  enemyG: PropTypes.number.isRequired,
  enemyDeckCount: PropTypes.number.isRequired,
  playerG: PropTypes.number.isRequired,
  playerDeckCount: PropTypes.number.isRequired,
  turnCount: PropTypes.number.isRequired,
  turnOwner: PropTypes.oneOf(["up", "down"]).isRequired,
  phase: PropTypes.string.isRequired,
};

export default HudColumn;
