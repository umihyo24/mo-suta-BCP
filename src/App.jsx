import { useEffect, useMemo, useState } from "react";
import LogPanel from "./components/LogPanel";
import GameOverlay from "./components/GameOverlay";
import GameBoard from "./components/GameBoard";
import HudColumn from "./components/HudColumn";
import {
  mk,
  shuffle,
  hpPct,
  speciesToIcon,
  isUnitAllowed,
} from "./utils/cardUtils";
import { makePlayerDeck, makeEnemyDeckByArchetype } from "./constants/deckPresets";
import "./App.css";

// モーモースターファーム（mfbc準拠） React プロトタイプ V1.5.2
// コード整理版: ロジックと表示をコンポーネント単位で分割

const ENEMY_ARCH = "FOX+BIRD"; // "FOX" | "BIRD" | "FOX+BIRD"

function runSmokeTests() {
  try {
    const testCard = mk("t", "テスト", 1, "", 3, "ATTACK", { allowedSpecies: ["RAT"] });
    const live = { species: "RAT", hp: 5 };
    const dead = { species: "RAT", hp: 0 };
    console.assert(isUnitAllowed(testCard, live) === true, "isUnitAllowed live should be true");
    console.assert(isUnitAllowed(testCard, dead) === false, "isUnitAllowed hp0 should be false");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Smoke test failed", error);
  }
}

runSmokeTests();

function App() {
  const [turnOwner, setTurnOwner] = useState("down");
  const [phase, setPhase] = useState("スタンバイフェイズ");
  const [turnCount, setTurnCount] = useState(1);

  const [playerDeck, setPlayerDeck] = useState(makePlayerDeck("P"));
  const [playerHand, setPlayerHand] = useState([]);
  const [playerDiscard, setPlayerDiscard] = useState([]);
  const [playerG, setPlayerG] = useState(3);

  const [enemyDeck, setEnemyDeck] = useState(makeEnemyDeckByArchetype(ENEMY_ARCH));
  const [enemyHand, setEnemyHand] = useState([]);
  const [enemyDiscard, setEnemyDiscard] = useState([]);
  const [enemyG, setEnemyG] = useState(3);

  const [enemies, setEnemies] = useState([
    { name: "フォクサ", icon: "🦊", hp: 7, max: 10, species: "FOX", acted: false },
    { name: "イーグラ", icon: "🦅", hp: 5, max: 9, species: "BIRD", acted: false },
    { name: "スコルポ", icon: "🦂", hp: 9, max: 11, species: "SCORP", acted: false },
  ]);
  const [allies, setAllies] = useState([
    { name: "ラット", icon: "🐁", hp: 8, max: 10, species: "RAT", acted: false },
    { name: "ドラコ", icon: "🐉", hp: 6, max: 10, species: "DRAGON", acted: false },
    { name: "ポーク", icon: "🐖", hp: 10, max: 10, species: "PIG", acted: false },
  ]);

  const [logs, setLogs] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [waitingClick, setWaitingClick] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [selectedCardIdx, setSelectedCardIdx] = useState(null);
  const [actorIdx, setActorIdx] = useState(null);
  const [targetIdx, setTargetIdx] = useState(null);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [gutsSelect, setGutsSelect] = useState(new Set());
  const [enemyRevealedDefense, setEnemyRevealedDefense] = useState(null);
  const [playerRevealedDefense, setPlayerRevealedDefense] = useState(null);
  const [enemyAttacksLeft, setEnemyAttacksLeft] = useState(0);
  const [enemyPendingDamage, setEnemyPendingDamage] = useState(0);
  const [enemyTargetDownIdx, setEnemyTargetDownIdx] = useState(null);
  const [enemyRevealedAttack, setEnemyRevealedAttack] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);

  const deckCounts = useMemo(
    () => ({ player: playerDeck.length, enemy: enemyDeck.length }),
    [playerDeck, enemyDeck]
  );

  const conciseLogs = useMemo(() => logs.slice(-10), [logs]);

  const drawUpTo = (side, n = 5) => {
    if (side === "down") {
      let deck = playerDeck;
      let hand = playerHand;
      let discard = playerDiscard;
      let need = n - hand.length;
      let drawnTotal = 0;

      while (need > 0) {
        if (deck.length === 0) {
          if (discard.length === 0) break;
          deck = shuffle(discard);
          discard = [];
          setLogs((prev) => [...prev, "下側: 捨て札をシャッフル→山札"]);
        }
        const take = Math.min(need, deck.length);
        const drawn = deck.slice(-take);
        deck = deck.slice(0, deck.length - take);
        hand = [...hand, ...drawn];
        drawnTotal += take;
        need = n - hand.length;
      }

      setPlayerDeck(deck);
      setPlayerHand(hand);
      setPlayerDiscard(discard);
      if (drawnTotal > 0) setLogs((prev) => [...prev, `下側: ${drawnTotal}枚ドロー`]);
    } else {
      let deck = enemyDeck;
      let hand = enemyHand;
      let discard = enemyDiscard;
      let need = n - hand.length;
      let drawnTotal = 0;

      while (need > 0) {
        if (deck.length === 0) {
          if (discard.length === 0) break;
          deck = shuffle(discard);
          discard = [];
          setLogs((prev) => [...prev, "上側: 捨て札をシャッフル→山札"]);
        }
        const take = Math.min(need, deck.length);
        const drawn = deck.slice(-take);
        deck = deck.slice(0, deck.length - take);
        hand = [...hand, ...drawn];
        drawnTotal += take;
        need = n - hand.length;
      }

      setEnemyDeck(deck);
      setEnemyHand(hand);
      setEnemyDiscard(discard);
      if (drawnTotal > 0) setLogs((prev) => [...prev, `上側: ${drawnTotal}枚ドロー`]);
    }
  };

  useEffect(() => {
    if (phase === "スタンバイフェイズ") {
      drawUpTo("down", 5);
      drawUpTo("up", 5);
      setPlayerHand((prev) => {
        const have = prev.filter((card) => card.kind === "DEFENSE").length;
        if (have >= 2) return prev;
        const need = 2 - have;
        const others = prev.filter((card) => card.kind !== "DEFENSE");
        const defs = Array.from({ length: need }, (_, index) =>
          mk(`P-SEED-DEF-${index}`, "シールド", 2, "🛡️", 0, "DEFENSE", { block: 3 })
        );
        return [...defs, ...others].slice(0, 5);
      });
      setEnemyAttacksLeft(4);
      setLogs((prev) => [...prev, "スタンバイ完了"]);
      setPhase("アクションフェイズ");
    }
  }, [phase]);

  const handlePlayerCardClick = (idx) => {
    if (phase !== "アクションフェイズ" || turnOwner !== "down") return;
    const card = playerHand[idx];
    if (!card) return;
    if (card.kind !== "ATTACK") {
      setLogs((prev) => [...prev, "そのカードは攻撃ではありません"]);
      return;
    }
    const cost = card.guts ?? idx + 1;
    if (playerG < cost) {
      setLogs((prev) => [
        ...prev,
        `下側: ガッツが足りない（必要${cost} / 現在${playerG}）`,
      ]);
      return;
    }
    setSelectedCardIdx(idx);
    setActorIdx(null);
    setTargetIdx(null);
    setLogs((prev) => [
      ...prev,
      `下側: 『${card.name}』を選択（コスト${cost}） → アクターを選択してください`,
    ]);
  };

  const handleAllyClick = (index) => {
    if (!(phase === "アクションフェイズ" && turnOwner === "down" && selectedCardIdx !== null)) return;
    const ally = allies[index];
    if (!ally) return;
    if (ally.hp <= 0) {
      setLogs((prev) => [...prev, `下側: ${ally.name} は戦闘不能`]);
      return;
    }
    if (ally.acted) {
      setLogs((prev) => [...prev, `下側: ${ally.name} は行動済み`]);
      return;
    }

    const card = playerHand[selectedCardIdx];
    if (!isUnitAllowed(card, ally)) {
      setLogs((prev) => [...prev, `下側: ${ally.name} は『${card.name}』が使えないッ！`]);
      return;
    }
    setActorIdx(index);
    setLogs((prev) => [...prev, `下側: アクターに ${ally.name} を選択 → 対象を選択してください`]);
  };

  const handleEnemyClick = (index) => {
    if (
      !(
        phase === "アクションフェイズ" &&
        turnOwner === "down" &&
        selectedCardIdx !== null &&
        actorIdx !== null
      )
    )
      return;

    const enemy = enemies[index];
    if (enemy?.hp <= 0) {
      setLogs((prev) => [...prev, `下側: 対象は戦闘不能（${enemy.name}）`]);
      return;
    }
    setTargetIdx(index);
    setPhase("防御フェイズ");
  };

  const handleEnemyHover = (index) => {
    if (
      phase === "アクションフェイズ" &&
      turnOwner === "down" &&
      selectedCardIdx !== null &&
      actorIdx !== null &&
      enemies[index]?.hp > 0
    ) {
      const raw = playerHand[selectedCardIdx]?.damage || 0;
      setHoverPreview({ idx: index, expect: raw });
    }
  };

  const handleEnemyLeave = (index) => {
    setHoverPreview((prev) => (prev && prev.idx === index ? null : prev));
  };

  const applyPlayerDamageNow = (raw, cost) => {
    if (targetIdx == null) return;
    const target = enemies[targetIdx];
    const actor = actorIdx !== null ? allies[actorIdx] : null;
    const blockedAll = enemyBlock >= 9999;
    const dealt = blockedAll ? 0 : Math.max(0, raw - enemyBlock);
    const newHp = Math.max(0, (target?.hp ?? 0) - dealt);
    setEnemies((prev) => prev.map((unit, i) => (i === targetIdx ? { ...unit, hp: newHp } : unit)));
    setPlayerG((prev) => prev - cost);
    if (actorIdx !== null) {
      setAllies((prev) => prev.map((unit, i) => (i === actorIdx ? { ...unit, acted: true } : unit)));
    }
    setPlayerDiscard((prev) => [...prev, playerHand[selectedCardIdx]]);
    setPlayerHand((prev) => prev.filter((_, i) => i !== selectedCardIdx));

    if (blockedAll) {
      setLogs((prev) => [
        ...prev,
        `${actor?.name ?? "味方"} の攻撃 → ${target?.name} は攻撃を回避した！！（残りHP：${target?.hp}/${target?.max}）`,
      ]);
    } else if (enemyBlock > 0) {
      setLogs((prev) => [
        ...prev,
        `${actor?.name ?? "味方"} の攻撃 → ${target?.name} の防御（${
          enemyRevealedDefense?.name ?? "ガード"
        }）！ ${dealt}ダメージ！！（残りHP：${newHp}/${target?.max}）`,
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        `${actor?.name ?? "味方"} の攻撃 → ${target?.name} に ${dealt}ダメージ！！（残りHP：${newHp}/${target?.max}）`,
      ]);
    }

    setSelectedCardIdx(null);
    setActorIdx(null);
    setTargetIdx(null);
    setEnemyBlock(0);
    setEnemyRevealedDefense(null);
    setHoverPreview(null);
    setPhase("アクションフェイズ");
  };

  useEffect(() => {
    if (phase !== "防御フェイズ") return;
    if (turnOwner === "down" && selectedCardIdx !== null) {
      const evadeIdx = enemyHand.findIndex((card) => card.kind === "DEFENSE" && card.evade && enemyG >= 3);
      const shieldIdx = enemyHand.findIndex((card) => card.kind === "DEFENSE" && card.block && enemyG >= 2);
      if (evadeIdx >= 0) {
        const ev = enemyHand[evadeIdx];
        setEnemyRevealedDefense(ev);
        setEnemyBlock(9999);
        setEnemyG((prev) => prev - 3);
        setEnemyDiscard((prev) => [...prev, ev]);
        setEnemyHand((prev) => prev.filter((_, i) => i !== evadeIdx));
        setLogs((prev) => [...prev, "上側: 回避（-G3, 無効）"]);
      } else if (shieldIdx >= 0) {
        const sh = enemyHand[shieldIdx];
        setEnemyRevealedDefense(sh);
        setEnemyBlock(sh.block || 3);
        setEnemyG((prev) => prev - 2);
        setEnemyDiscard((prev) => [...prev, sh]);
        setEnemyHand((prev) => prev.filter((_, i) => i !== shieldIdx));
        setLogs((prev) => [...prev, "上側: シールド（-G2, 軽減3）"]);
      } else {
        setEnemyBlock(0);
        setEnemyRevealedDefense(null);
        setLogs((prev) => [...prev, "上側: 防御なし"]);
      }
      const card = playerHand[selectedCardIdx];
      const cost = card?.guts ?? selectedCardIdx + 1;
      const raw = Math.max(0, card?.damage ?? 0);
      applyPlayerDamageNow(raw, cost);
    }
  }, [phase]);

  const enemyStartAttack = () => {
    if (phase !== "アクションフェイズ" || turnOwner !== "up") return;
    const readyIdxs = enemies
      .map((unit, i) => ({ unit, index: i }))
      .filter(({ unit }) => !unit.acted && unit.hp > 0)
      .map(({ index }) => index);
    if (readyIdxs.length === 0) {
      setLogs((prev) => [...prev, "上側: 行動可能ユニットなし→ガッツへ"]);
      setPhase("ガッツフェイズ");
      return;
    }
    const playable = enemyHand
      .map((card, i) => ({ card, index: i }))
      .filter(({ card }) => card.kind === "ATTACK" && enemyG >= (card.guts ?? 1));
    const pairs = playable.flatMap((p) =>
      readyIdxs
        .filter((ai) => isUnitAllowed(p.card, enemies[ai]))
        .map((ai) => ({ ...p, actorIndex: ai }))
    );
    if (enemyHand.length <= 1 || pairs.length === 0) {
      setLogs((prev) => [...prev, "上側: 攻撃せずターン終了"]);
      setPhase("ガッツフェイズ");
      return;
    }
    const maxD = Math.max(...pairs.map((x) => x.card.damage));
    const picks = pairs.filter((x) => x.card.damage === maxD);
    const pick = picks[Math.floor(Math.random() * picks.length)];

    const alive = allies.map((unit, i) => ({ unit, index: i })).filter(({ unit }) => unit.hp > 0);
    if (alive.length === 0) {
      setLogs((prev) => [...prev, "上側: 攻撃対象なし→終了"]);
      setPhase("ガッツフェイズ");
      return;
    }
    const targetIndex = pick.card.aoe
      ? alive[0].index
      : alive[Math.floor(Math.random() * alive.length)].index;

    setEnemyRevealedAttack(pick.card);
    setEnemies((prev) => prev.map((unit, i) => (i === pick.actorIndex ? { ...unit, acted: true } : unit)));
    setEnemyG((prev) => prev - (pick.card.guts ?? 1));
    setEnemyDiscard((prev) => [...prev, pick.card]);
    setEnemyHand((prev) => prev.filter((_, i) => i !== pick.index));

    setEnemyTargetDownIdx(targetIndex);
    setEnemyPendingDamage(pick.card.damage);
    setLogs((prev) => [
      ...prev,
      `上側: ${enemies[pick.actorIndex].name} が『${pick.card.name}』(ATK ${pick.card.damage}${
        pick.card.aoe ? "・全体" : ""
      }, -G${pick.card.guts ?? 1}) 対象=${pick.card.aoe ? "全体" : `下側${targetIndex + 1}`}`,
    ]);
    setPhase("防御フェイズ");
  };

  const playerDefendNone = () => {
    setPlayerBlock(0);
    setPlayerRevealedDefense(null);
    setLogs((prev) => [...prev, "下側: 防御しない"]);
    applyEnemyDamageNow();
  };

  const playerDefendUse = () => {
    const evadeIdx = playerHand.findIndex((card) => card.kind === "DEFENSE" && card.evade && playerG >= 3);
    const shieldIdx = playerHand.findIndex((card) => card.kind === "DEFENSE" && card.block && playerG >= 2);
    if (evadeIdx >= 0) {
      const ev = playerHand[evadeIdx];
      setPlayerBlock(9999);
      setPlayerG((prev) => prev - 3);
      setPlayerRevealedDefense(ev);
      setPlayerDiscard((prev) => [...prev, ev]);
      setPlayerHand((prev) => prev.filter((_, i) => i !== evadeIdx));
      setLogs((prev) => [...prev, "下側: 回避（-G3, 無効）"]);
    } else if (shieldIdx >= 0) {
      const sh = playerHand[shieldIdx];
      setPlayerBlock(sh.block || 3);
      setPlayerG((prev) => prev - 2);
      setPlayerRevealedDefense(sh);
      setPlayerDiscard((prev) => [...prev, sh]);
      setPlayerHand((prev) => prev.filter((_, i) => i !== shieldIdx));
      setLogs((prev) => [...prev, "下側: シールド（-G2, 軽減3）"]);
    } else {
      setLogs((prev) => [...prev, "下側: 防御カードなし/またはG不足"]);
      setPlayerBlock(0);
    }
    applyEnemyDamageNow();
  };

  const applyEnemyDamageNow = () => {
    if (enemyTargetDownIdx == null) return;
    const base = enemyPendingDamage;
    const target = allies[enemyTargetDownIdx];
    const blockedAll = playerBlock >= 9999;
    const dealt = blockedAll ? 0 : Math.max(0, base - playerBlock);
    const newHp = Math.max(0, target.hp - dealt);
    setAllies((prev) => prev.map((unit, i) => (i === enemyTargetDownIdx ? { ...unit, hp: newHp } : unit)));

    if (blockedAll) {
      setLogs((prev) => [
        ...prev,
        `上側: ${enemyRevealedAttack?.name ?? "攻撃"} → ${target.name} は攻撃を回避した！！（残りHP：${target.hp}/${target.max}）`,
      ]);
    } else if (playerBlock > 0) {
      setLogs((prev) => [
        ...prev,
        `上側: ${enemyRevealedAttack?.name ?? "攻撃"} → ${target.name} の防御（${
          playerRevealedDefense?.name ?? "ガード"
        }）！ ${dealt}ダメージ！！（残りHP：${newHp}/${target.max}）`,
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        `上側: ${enemyRevealedAttack?.name ?? "攻撃"} → ${target.name} に ${dealt}ダメージ！！（残りHP：${newHp}/${target.max}）`,
      ]);
    }

    setPlayerBlock(0);
    setPlayerRevealedDefense(null);
    setEnemyPendingDamage(0);
    setEnemyTargetDownIdx(null);
    setEnemyRevealedAttack(null);
    setEnemyAttacksLeft((prev) => {
      const left = Math.max(0, prev - 1);
      if (left > 1 && enemyG > 0) setPhase("アクションフェイズ");
      else setPhase("ガッツフェイズ");
      return left;
    });
  };

  const toggleGutsSelect = (idx) => {
    if (phase === "ガッツフェイズ" && turnOwner === "down") {
      setGutsSelect((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
    }
  };

  const endTurn = () => {
    if (phase !== "ガッツフェイズ") return;
    if (turnOwner === "down") {
      const sel = Array.from(gutsSelect.values()).sort((a, b) => a - b);
      const remaining = playerHand.length - sel.length;
      if (sel.length > 0) {
        const add = sel.length;
        setPlayerG((prev) => prev + add);
        setPlayerDiscard((prev) => [...prev, ...sel.map((i) => playerHand[i])]);
        setPlayerHand((prev) => prev.filter((_, i) => !gutsSelect.has(i)));
        setLogs((prev) => [...prev, `下側: ガッツを取得（+${add}） / 手札残り：${remaining}枚`]);
      } else {
        setLogs((prev) => [...prev, `下側: ガッツ化なし / 手札残り：${remaining}枚`]);
      }
      setGutsSelect(new Set());
      const next = "up";
      setTurnOwner(next);
      setTurnCount((prev) => prev + 1);
      setEnemyAttacksLeft(4);
      setEnemies((prev) => prev.map((unit) => ({ ...unit, acted: false })));
      setPhase("ドローフェイズ");
    } else {
      if (enemyHand.length > 1) {
        const keep = 1;
        const convert = enemyHand.length - keep;
        const idxs = shuffle(enemyHand.map((_, i) => i)).slice(0, convert);
        const remaining = enemyHand.length - convert;
        setEnemyG((prev) => prev + convert);
        setEnemyDiscard((prev) => [...prev, ...idxs.map((i) => enemyHand[i])]);
        setEnemyHand((prev) => prev.filter((_, i) => !idxs.includes(i)));
        setLogs((prev) => [
          ...prev,
          `上側: ${convert}枚をガッツ化（+${convert}） / 手札残り：${remaining}枚`,
        ]);
      } else {
        setLogs((prev) => [...prev, "上側: ガッツ化なし"]);
      }
      setWaitingMessage("敵のガッツフェイズ終了 — クリックで自分のターンへ");
      setWaitingClick(true);
    }
  };

  const proceedAfterEnemyGuts = () => {
    if (!waitingClick) return;
    setWaitingClick(false);
    const next = "down";
    setTurnOwner(next);
    setTurnCount((prev) => prev + 1);
    setEnemyAttacksLeft(4);
    setAllies((prev) => prev.map((unit) => ({ ...unit, acted: false })));
    setPhase("ドローフェイズ");
  };

  useEffect(() => {
    if (phase !== "ドローフェイズ") return;
    drawUpTo(turnOwner, 5);
    setLogs((prev) => [...prev, `ドローフェイズ: ${turnOwner === "down" ? "下側" : "上側"}のみ補充`]);
    setPhase("アクションフェイズ");
  }, [phase]);

  useEffect(() => {
    if (phase === "アクションフェイズ" && turnOwner === "up") {
      enemyStartAttack();
    }
    if (phase === "ガッツフェイズ" && turnOwner === "up" && !waitingClick) {
      endTurn();
    }
  }, [phase, turnOwner, enemyHand, enemies, enemyG, waitingClick]);

  const handleActionEnd = () => {
    if (phase === "アクションフェイズ" && turnOwner === "down") {
      setPhase("ガッツフェイズ");
    }
  };

  return (
    <div className="wrap">
      <div className="playArea">
        <GameOverlay
          visible={waitingClick}
          message={waitingMessage}
          onProceed={proceedAfterEnemyGuts}
        />

        <div className="playColumns">
          <GameBoard
            phase={phase}
            turnOwner={turnOwner}
            enemies={enemies}
            allies={allies}
            enemyHandCount={enemyHand.length}
            playerHand={playerHand}
            selectedCardIdx={selectedCardIdx}
            actorIdx={actorIdx}
            targetIdx={targetIdx}
            hoverPreview={hoverPreview}
            onEnemyClick={handleEnemyClick}
            onEnemyHover={handleEnemyHover}
            onEnemyLeave={handleEnemyLeave}
            onAllyClick={handleAllyClick}
            onPlayerCardClick={handlePlayerCardClick}
            onToggleGutsSelect={toggleGutsSelect}
            gutsSelect={gutsSelect}
            enemyRevealedDefense={enemyRevealedDefense}
            enemyRevealedAttack={enemyRevealedAttack}
            playerRevealedDefense={playerRevealedDefense}
            onPlayerDefendNone={playerDefendNone}
            onPlayerDefendUse={playerDefendUse}
            onEndTurn={endTurn}
            onActionEnd={handleActionEnd}
            hpPct={hpPct}
            isUnitAllowed={isUnitAllowed}
            speciesToIcon={speciesToIcon}
          />

          <HudColumn
            enemyG={enemyG}
            enemyDeckCount={deckCounts.enemy}
            playerG={playerG}
            playerDeckCount={deckCounts.player}
            turnCount={turnCount}
            turnOwner={turnOwner}
            phase={phase}
          />
        </div>
      </div>

      <LogPanel
        logs={logs}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails((prev) => !prev)}
        conciseLogs={conciseLogs}
      />
    </div>
  );
}

export default App;
