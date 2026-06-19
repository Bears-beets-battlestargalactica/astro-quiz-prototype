import { useEffect, type ReactNode } from "react";
import { playGameSound } from "../utils/sounds";

type Props = {
  round: number;
  opponentName: string;
  soundEnabled: boolean;
  soundButton?: ReactNode;
  onComplete: () => void;
};

export default function RoundScreen({ round, opponentName, soundEnabled, soundButton, onComplete }: Props) {
  useEffect(() => {
    playGameSound("round", soundEnabled);
    const timer = window.setTimeout(onComplete, 1500);
    return () => window.clearTimeout(timer);
  }, [onComplete, round, soundEnabled]);

  return (
    <main className="screen round-screen">
      {soundButton}
      <div className="round-overlay">
        <h1>Round {round}</h1>
        <p>Opponent: {opponentName}</p>
      </div>
    </main>
  );
}
