import PropTypes from "prop-types";

function PhaseInfo({ phase, turnOwner, selectedCardIdx, actorIdx, targetIdx }) {
  const getHint = () => {
    if (phase === "アクションフェイズ") {
      if (turnOwner === "down") {
        if (selectedCardIdx === null) return "カードを選択してください";
        if (actorIdx === null) return "アクターを選択してください";
        if (targetIdx === null) return "対象を選択してください";
        return "";
      }
      return "（敵ターン自動進行中）";
    }

    if (phase === "ガッツフェイズ") {
      return turnOwner === "down"
        ? "ガッツにしたいカードを選択して「ターンエンド」"
        : "（敵ターン自動進行中）";
    }

    return "";
  };

  return (
    <div className="vs">
      — VS — <span className="phase">{phase}</span>
      <span className="hint">{getHint()}</span>
      <div className="steps">
        <span className={selectedCardIdx !== null ? "on" : "off"}>①カード</span>
        <span>→</span>
        <span className={actorIdx !== null ? "on" : "off"}>②アクター</span>
        <span>→</span>
        <span className={targetIdx !== null ? "on" : "off"}>③対象</span>
      </div>
    </div>
  );
}

PhaseInfo.propTypes = {
  phase: PropTypes.string.isRequired,
  turnOwner: PropTypes.oneOf(["up", "down"]).isRequired,
  selectedCardIdx: PropTypes.number,
  actorIdx: PropTypes.number,
  targetIdx: PropTypes.number,
};

PhaseInfo.defaultProps = {
  selectedCardIdx: null,
  actorIdx: null,
  targetIdx: null,
};

export default PhaseInfo;
