import { useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";
import BattleScreen from "./components/BattleScreen";
import CharacterSelect from "./components/CharacterSelect";
import IntroScreen from "./components/IntroScreen";
import ResultScreen from "./components/ResultScreen";
import RoundScreen from "./components/RoundScreen";
import { buildRoundPlan, characters, MAX_ROUNDS } from "./data/characters";
import { questions } from "./data/questions";
import type { BattleOutcome, Character, MatchResult, RoundPlan, Screen } from "./types/game";
import { playCharacterJingle, playGameSound, setAudioEnabled, setMusicTrack, type MusicTrack } from "./utils/sounds";

const shuffleQuestions = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [player, setPlayer] = useState<Character | null>(null);
  const [round, setRound] = useState(1);
  const [roundsCleared, setRoundsCleared] = useState(0);
  const [roundPlan, setRoundPlan] = useState<RoundPlan[]>([]);
  const [questionDeck, setQuestionDeck] = useState(() => shuffleQuestions(questions));
  const [questionCursor, setQuestionCursor] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentRoundPlan = useMemo(() => roundPlan[round - 1] ?? null, [roundPlan, round]);
  const opponent = currentRoundPlan?.opponent ?? null;

  const musicTrack = useMemo<MusicTrack>(() => {
    if (screen === "intro") return "intro";
    if (screen === "select") return "select";
    if (screen === "round") return "round";
    if (screen === "battle" && player) return `character:${player.id}`;
    if (screen === "result") {
      return matchResult?.finalWinner === "player" ? "win" : "lose";
    }
    return "closing";
  }, [matchResult?.finalWinner, player, screen]);

  useEffect(() => {
    setAudioEnabled(soundEnabled);
    setMusicTrack(musicTrack, soundEnabled);
  }, [musicTrack, soundEnabled]);

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const handleBegin = () => {
    playGameSound("select", soundEnabled);
    setScreen("select");
  };

  const handlePreview = (previewed: Character) => {
    playCharacterJingle(previewed.id, soundEnabled);
  };

  const handleSelect = (selected: Character) => {
    playGameSound("select", soundEnabled);
    playCharacterJingle(selected.id, soundEnabled);
    setPlayer(selected);
    setRound(1);
    setRoundsCleared(0);
    setMatchResult(null);
    setRoundPlan(buildRoundPlan(selected.id));
    setQuestionDeck(shuffleQuestions(questions));
    setQuestionCursor(0);
    setScreen("round");
  };

  const handleRoundIntroComplete = useCallback(() => {
    setScreen("battle");
  }, []);

  const handleBattleOver = (outcome: BattleOutcome) => {
    setQuestionCursor(outcome.nextQuestionIndex);

    if (outcome.winner === "opponent") {
      playGameSound("lose", soundEnabled);
      setMatchResult({ finalWinner: "opponent", endedBy: "player-lost-round", losingRound: round });
      setScreen("result");
      return;
    }

    const nextRoundsCleared = roundsCleared + 1;
    setRoundsCleared(nextRoundsCleared);

    if (round >= MAX_ROUNDS) {
      playGameSound("win", soundEnabled);
      setMatchResult({ finalWinner: "player", endedBy: "player-cleared-all-rounds" });
      setScreen("result");
      return;
    }

    setRound((prev) => prev + 1);
    setScreen("round");
  };

  const restart = () => {
    playGameSound("select", soundEnabled);
    setScreen("intro");
    setPlayer(null);
    setRound(1);
    setRoundsCleared(0);
    setRoundPlan([]);
    setQuestionDeck(shuffleQuestions(questions));
    setQuestionCursor(0);
    setMatchResult(null);
  };

  const soundButton = (
    <button className="sound-toggle" onClick={toggleSound} aria-label={soundEnabled ? "Mute sound" : "Turn sound on"}>
      {soundEnabled ? "Mute Sound" : "Unmute Sound"}
    </button>
  );

  if (screen === "intro") return <IntroScreen onBegin={handleBegin} soundButton={soundButton} />;

  if (screen === "select") {
    return <CharacterSelect characters={characters} onPreview={handlePreview} onSelect={handleSelect} soundButton={soundButton} />;
  }

  if (screen === "round" && currentRoundPlan) {
    return (
      <RoundScreen
        round={currentRoundPlan.roundNumber}
        opponentName={currentRoundPlan.opponent.name}
        soundEnabled={soundEnabled}
        soundButton={soundButton}
        onComplete={handleRoundIntroComplete}
      />
    );
  }

  if (screen === "battle" && player && currentRoundPlan) {
    return (
      <BattleScreen
        player={player}
        opponent={currentRoundPlan.opponent}
        round={currentRoundPlan.roundNumber}
        maxRounds={MAX_ROUNDS}
        aiAccuracy={currentRoundPlan.aiAccuracy}
        questions={questionDeck}
        startingQuestionIndex={questionCursor}
        soundEnabled={soundEnabled}
        soundButton={soundButton}
        onBattleOver={handleBattleOver}
      />
    );
  }

  if (screen === "result" && player && opponent && matchResult) {
    return (
      <ResultScreen
        player={player}
        opponent={opponent}
        roundsCleared={roundsCleared}
        maxRounds={MAX_ROUNDS}
        matchResult={matchResult}
        onRestart={restart}
        soundButton={soundButton}
      />
    );
  }

  return <IntroScreen onBegin={handleBegin} soundButton={soundButton} />;
}
