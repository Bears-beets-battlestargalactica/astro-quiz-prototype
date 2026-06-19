import type { Character, CharacterId, RoundPlan } from "../types/game";

const asset = (folder: string, file: string) => `/assets/characters/${folder}/${file}`;

const makeCharacter = (
  id: CharacterId,
  name: string,
  shortName: string,
  colors: Character["colors"]
): Character => ({
  id,
  name,
  shortName,
  folder: id,
  colors,
  assets: {
    portrait: asset(id, "portrait.png"),
    idle: asset(id, "idle.png"),
    happy: asset(id, "happy.png"),
    sad: asset(id, "sad.png"),
    angry: asset(id, "angry.png"),
  },
});

export const characters: Character[] = [
  makeCharacter("ed", "Ed", "Ed", { primary: "#ffe866", secondary: "#6b7c2f" }),
  makeCharacter("edd", "Edd", "Edd", { primary: "#fff7a8", secondary: "#5f7b33" }),
  makeCharacter("eddy", "Eddy", "Eddy", { primary: "#f6b542", secondary: "#7a2600" }),
  makeCharacter("courage", "Courage", "Courage", { primary: "#ffb0df", secondary: "#7c225f" }),
  makeCharacter("grim", "Grim", "Grim", { primary: "#f2f2f2", secondary: "#111111" }),
  makeCharacter("dexter", "Dexter", "Dex", { primary: "#ff9b4a", secondary: "#6a45d9" }),
  makeCharacter("johnny-bravo", "Johnny Bravo", "Johnny", { primary: "#ffd028", secondary: "#101010" }),
  makeCharacter("blossom", "Blossom", "Blos", { primary: "#ff9acb", secondary: "#f04c39" }),
  makeCharacter("bubbles", "Bubbles", "Bubb", { primary: "#a8e9ff", secondary: "#3068dd" }),
  makeCharacter("buttercup", "Buttercup", "BC", { primary: "#7ad84f", secondary: "#111111" }),
];

export const MAX_ROUNDS = 5;
export const AI_ACCURACY_BY_ROUND = [0.45, 0.6, 0.72, 0.84, 0.92];

export const getCharacterById = (id: CharacterId) => {
  const found = characters.find((character) => character.id === id);
  if (!found) throw new Error(`Character not found: ${id}`);
  return found;
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

export const buildRoundPlan = (playerId: CharacterId): RoundPlan[] => {
  const possibleOpponents = characters.filter((character) => character.id !== playerId);
  const shuffledOpponents = shuffle(possibleOpponents).slice(0, MAX_ROUNDS);

  return shuffledOpponents.map((opponent, index) => ({
    roundNumber: index + 1,
    opponent,
    aiAccuracy: AI_ACCURACY_BY_ROUND[index] ?? AI_ACCURACY_BY_ROUND[AI_ACCURACY_BY_ROUND.length - 1],
  }));
};
