export type CharacterId =
  | "ed"
  | "edd"
  | "eddy"
  | "courage"
  | "grim"
  | "dexter"
  | "johnny-bravo"
  | "blossom"
  | "bubbles"
  | "buttercup";

export type Mood = "idle" | "happy" | "sad" | "angry";

export type Character = {
  id: CharacterId;
  name: string;
  shortName: string;
  folder: string;
  colors: {
    primary: string;
    secondary: string;
  };
  assets: Record<Mood | "portrait", string>;
};

export type Question = {
  id: number;
  category: string;
  prompt: string;
  options: string[];
  answer: string;
};

export type TurnOwner = "player" | "opponent";

export type Screen = "intro" | "select" | "round" | "battle" | "result";

export type BattleOutcome = {
  winner: "player" | "opponent";
  loser: "player" | "opponent";
  nextQuestionIndex: number;
};

export type MatchResult = {
  finalWinner: "player" | "opponent";
  endedBy: "player-cleared-all-rounds" | "player-lost-round";
  losingRound?: number;
};

export type RoundPlan = {
  roundNumber: number;
  opponent: Character;
  aiAccuracy: number;
};
