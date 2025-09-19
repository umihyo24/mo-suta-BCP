export const mk = (id, name, guts, icon, damage, kind, extra = {}) => ({
  id,
  name,
  guts,
  icon,
  damage,
  kind,
  ...extra,
});

export const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const hpPct = (hp, max) => {
  const boundedHp = Math.max(0, Math.min(hp, max));
  const safeMax = Math.max(1, max);
  return `${Math.round((boundedHp / safeMax) * 100)}%`;
};

export const speciesToIcon = {
  RAT: "🐁",
  DRAGON: "🐉",
  PIG: "🐖",
  FOX: "🦊",
  BIRD: "🦅",
  SCORP: "🦂",
};

export const isUnitAllowed = (card, unit) => {
  if (!card || !unit) return false;
  if (unit.hp <= 0) return false; // HP0は不可

  const reqOk = card.speciesReq ? unit.species === card.speciesReq : true;
  const allowList = Array.isArray(card.allowedSpecies) ? card.allowedSpecies : [];
  const allowOk = allowList.length > 0 ? allowList.includes(unit.species) : true;

  return reqOk && allowOk;
};
