import PropTypes from "prop-types";
import EnemyParty from "./EnemyParty";
import AllyParty from "./AllyParty";
import PlayerHand from "./PlayerHand";
import PhaseInfo from "./PhaseInfo";
import RevealedCard from "./RevealedCard";

function GameBoard({
  phase,
  turnOwner,
  enemies,
  allies,
  enemyHandCount,
  playerHand,
  selectedCardIdx,
  actorIdx,
  targetIdx,
  hoverPreview,
  onEnemyClick,
  onEnemyHover,
  onEnemyLeave,
  onAllyClick,
  onPlayerCardClick,
  onToggleGutsSelect,
  gutsSelect,
  enemyRevealedDefense,
  enemyRevealedAttack,
  playerRevealedDefense,
  onPlayerDefendNone,
  onPlayerDefendUse,
  onEndTurn,
  onActionEnd,
  hpPct,
  isUnitAllowed,
  speciesToIcon,
}) {
  const selectedCard = selectedCardIdx !== null ? playerHand[selectedCardIdx] : null;

  return (
    <div className="board">
      <div className="enemyHandIndicator">
        <div className="badge">🃏 手札 <b>x {enemyHandCount}</b></div>
      </div>

      <div className="battle">
        <EnemyParty
          enemies={enemies}
          phase={phase}
          turnOwner={turnOwner}
          selectedCard={selectedCard}
          actorIdx={actorIdx}
          targetIdx={targetIdx}
          hoverPreview={hoverPreview}
          onEnemyClick={onEnemyClick}
          onEnemyHover={onEnemyHover}
          onEnemyLeave={onEnemyLeave}
          hpPct={hpPct}
        />

        <PhaseInfo
          phase={phase}
          turnOwner={turnOwner}
          selectedCardIdx={selectedCardIdx}
          actorIdx={actorIdx}
          targetIdx={targetIdx}
        />

        <AllyParty
          allies={allies}
          phase={phase}
          turnOwner={turnOwner}
          selectedCard={selectedCard}
          actorIdx={actorIdx}
          onSelectActor={onAllyClick}
          isUnitAllowed={isUnitAllowed}
          hpPct={hpPct}
        />

        <div className="battleControls">
          {phase === "アクションフェイズ" && turnOwner === "down" && (
            <>
              <button className="btn" disabled type="button">
                アクション
              </button>
              <button className="btn" onClick={onActionEnd} type="button">
                アクションエンド
              </button>
            </>
          )}
          {phase === "防御フェイズ" && turnOwner === "up" && (
            <>
              <button className="btn" onClick={onPlayerDefendNone} type="button">
                防御しない
              </button>
              <button className="btn primary" onClick={onPlayerDefendUse} type="button">
                防御カードを使う
              </button>
            </>
          )}
          {phase === "ガッツフェイズ" && turnOwner === "down" && (
            <button className="btn primary" onClick={onEndTurn} type="button">
              ターンエンド
            </button>
          )}
        </div>

        <div className="reveal">
          <RevealedCard card={enemyRevealedDefense} label="敵の防御" defaultGuts={2} />
          <RevealedCard card={enemyRevealedAttack} label="敵の選択" defaultGuts={1} />
          <RevealedCard
            card={playerRevealedDefense}
            label="自分の防御"
            defaultGuts={playerRevealedDefense?.evade ? 3 : 2}
          />
        </div>
      </div>

      <PlayerHand
        cards={playerHand}
        phase={phase}
        turnOwner={turnOwner}
        selectedCardIdx={selectedCardIdx}
        gutsSelect={gutsSelect}
        onCardPlay={onPlayerCardClick}
        onToggleGuts={onToggleGutsSelect}
        speciesToIcon={speciesToIcon}
      />
    </div>
  );
}

GameBoard.propTypes = {
  phase: PropTypes.string.isRequired,
  turnOwner: PropTypes.oneOf(["up", "down"]).isRequired,
  enemies: PropTypes.array.isRequired,
  allies: PropTypes.array.isRequired,
  enemyHandCount: PropTypes.number.isRequired,
  playerHand: PropTypes.array.isRequired,
  selectedCardIdx: PropTypes.number,
  actorIdx: PropTypes.number,
  targetIdx: PropTypes.number,
  hoverPreview: PropTypes.shape({ idx: PropTypes.number, expect: PropTypes.number }),
  onEnemyClick: PropTypes.func.isRequired,
  onEnemyHover: PropTypes.func.isRequired,
  onEnemyLeave: PropTypes.func.isRequired,
  onAllyClick: PropTypes.func.isRequired,
  onPlayerCardClick: PropTypes.func.isRequired,
  onToggleGutsSelect: PropTypes.func.isRequired,
  gutsSelect: PropTypes.instanceOf(Set).isRequired,
  enemyRevealedDefense: PropTypes.object,
  enemyRevealedAttack: PropTypes.object,
  playerRevealedDefense: PropTypes.object,
  onPlayerDefendNone: PropTypes.func.isRequired,
  onPlayerDefendUse: PropTypes.func.isRequired,
  onEndTurn: PropTypes.func.isRequired,
  onActionEnd: PropTypes.func.isRequired,
  hpPct: PropTypes.func.isRequired,
  isUnitAllowed: PropTypes.func.isRequired,
  speciesToIcon: PropTypes.objectOf(PropTypes.string).isRequired,
};

GameBoard.defaultProps = {
  selectedCardIdx: null,
  actorIdx: null,
  targetIdx: null,
  hoverPreview: null,
  enemyRevealedDefense: null,
  enemyRevealedAttack: null,
  playerRevealedDefense: null,
};

export default GameBoard;
