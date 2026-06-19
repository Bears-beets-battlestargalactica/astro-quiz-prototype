import type { ReactNode } from "react";
import type { Character, MatchResult } from "../types/game";
import CharacterImage from "./CharacterImage";

type Props = {
  player: Character;
  opponent: Character;
  roundsCleared: number;
  maxRounds: number;
  matchResult: MatchResult;
  onRestart: () => void;
  soundButton?: ReactNode;
};

export default function ResultScreen({
  player,
  opponent,
  roundsCleared,
  maxRounds,
  matchResult,
  onRestart,
  soundButton,
}: Props) {
  const playerWon = matchResult.finalWinner === "player";
  const winner = playerWon ? player : opponent;
  const loser = playerWon ? opponent : player;

  return (
    <main className="screen result-screen">
      {soundButton}
      <div className="fake-logo result-logo">
        <span>ASTRO</span>
        <span>QUIZ</span>
      </div>

      <div className="winner-medallion">
        <CharacterImage
          src={winner.assets.happy}
          alt={`${winner.name} wins`}
          fallbackLabel={winner.shortName}
          className="winner-image"
        />
      </div>

      <section className="result-copy">
        <h1>{playerWon ? "Well done!" : "Uh oh!"}</h1>
        <p>{winner.name} wins.</p>
        <p>{loser.name} got blasted into space.</p>
        {matchResult.endedBy === "player-lost-round" ? (
          <p className="final-score">Game over in round {matchResult.losingRound}. One lost round ends the match.</p>
        ) : (
          <p className="final-score">You cleared all {maxRounds} rounds!</p>
        )}
        <p className="final-score">Rounds cleared: {roundsCleared} / {maxRounds}</p>
      </section>

      <button className="big-link-button" onClick={onRestart}>play again?</button>
    </main>
  );
}
