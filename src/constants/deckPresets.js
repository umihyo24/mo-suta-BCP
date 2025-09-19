import { mk } from "../utils/cardUtils";

export const playerBase = [
  mk("c1", "キュウソネコカミ拳", 8, "👊", 8, "ATTACK", { allowedSpecies: ["RAT"] }),
  mk("c2", "ファイアブレス", 5, "🔥", 6, "ATTACK", { allowedSpecies: ["DRAGON"] }),
  mk("c4", "かみつき", 1, "🦷", 3, "ATTACK", { allowedSpecies: ["RAT", "DRAGON", "PIG"] }),
  mk("c5", "シールド", 2, "🛡️", 0, "DEFENSE", { block: 3 }),
];

export const makePlayerDeck = (prefix) =>
  Array.from({ length: 2 }, (_, k) =>
    playerBase.map((card) => ({ ...card, id: `${prefix}-${card.id}-${k}` }))
  ).flat();

const foxSet10 = [
  ...Array.from({ length: 4 }, (_, i) =>
    mk(`fox-scratch-${i + 1}`, "ひっかき", 1, "🦊", 3, "ATTACK", { speciesReq: "FOX" })
  ),
  mk("fox-shield", "シールド", 2, "🛡️", 0, "DEFENSE", { block: 3 }),
  ...Array.from({ length: 3 }, (_, i) =>
    mk(`fox-bite-${i + 1}`, "かみつき", 1, "🦷", 3, "ATTACK", { speciesReq: "FOX" })
  ),
  ...Array.from({ length: 2 }, (_, i) =>
    mk(`fox-evade-${i + 1}`, "回避", 3, "💨", 0, "DEFENSE", { evade: true })
  ),
];

const birdSet10 = [
  ...Array.from({ length: 4 }, (_, i) =>
    mk(`bird-peck-${i + 1}`, "つつく", 1, "🪶", 3, "ATTACK", { speciesReq: "BIRD" })
  ),
  mk("bird-shield", "シールド", 2, "🛡️", 0, "DEFENSE", { block: 3 }),
  ...Array.from({ length: 3 }, (_, i) =>
    mk(`bird-wind-${i + 1}`, "かぜおこし", 4, "🌪️", 2, "ATTACK", { aoe: true, speciesReq: "BIRD" })
  ),
  ...Array.from({ length: 2 }, (_, i) =>
    mk(`bird-evade-${i + 1}`, "回避", 3, "💨", 0, "DEFENSE", { evade: true })
  ),
];

const repeat3 = (arr, prefix) =>
  Array.from({ length: 3 }, (_, k) =>
    arr.map((card) => ({ ...card, id: `${prefix}-${card.id}-${k}` }))
  ).flat();

export const makeEnemyDeckByArchetype = (arch) => {
  if (arch === "FOX") return repeat3(foxSet10, "E");
  if (arch === "BIRD") return repeat3(birdSet10, "E");

  const fox15 = foxSet10.concat(foxSet10.slice(0, 5));
  const bird15 = birdSet10.concat(birdSet10.slice(0, 5));

  return [
    ...fox15.map((card, i) => ({ ...card, id: `E-FOX-${i}` })),
    ...bird15.map((card, i) => ({ ...card, id: `E-BIRD-${i}` })),
  ];
};
