import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BattleOutcome, Character, Mood, Question, TurnOwner } from "../types/game";
import { playGameSound } from "../utils/sounds";
import ScoreBooth from "./ScoreBooth";

type Props = {
  player: Character;
  opponent: Character;
  round: number;
  maxRounds: number;
  aiAccuracy: number;
  questions: Question[];
  startingQuestionIndex: number;
  soundEnabled: boolean;
  soundButton?: ReactNode;
  onBattleOver: (outcome: BattleOutcome) => void;
};

const MAX_LIVES = 5;
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const shuffleOptions = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
};

export default function BattleScreen({ player, opponent, round, maxRounds, aiAccuracy, questions, startingQuestionIndex, soundEnabled, soundButton, onBattleOver }: Props) {
  const [playerLives, setPlayerLives] = useState(MAX_LIVES);
  const [opponentLives, setOpponentLives] = useState(MAX_LIVES);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(startingQuestionIndex);
  const currentQuestionIndexRef = useRef(startingQuestionIndex);
  const [turn, setTurn] = useState<TurnOwner>("player");
  const [playerMood, setPlayerMood] = useState<Mood>("idle");
  const [opponentMood, setOpponentMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("Your turn. Pick the right answer!");
  const [locked, setLocked] = useState(false);
  const [launching, setLaunching] = useState<"player" | "opponent" | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<{ selected: string; correct: boolean } | null>(null);
  const finishedRef = useRef(false);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex % questions.length],
    [currentQuestionIndex, questions]
  );

  const displayedOptions = useMemo(
    () => shuffleOptions(currentQuestion.options),
    [currentQuestion.id]
  );

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      const next = prev + 1;
      currentQuestionIndexRef.current = next;
      return next;
    });
    setOpponentChoice(null);
    setAnswerFeedback(null);
  }, []);

  const finishBattle = useCallback(
    async (winner: "player" | "opponent", loser: "player" | "opponent") => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setLocked(true);
      setLaunching(loser);
      playGameSound("launch", soundEnabled);
      setMessage(`${loser === "player" ? player.name : opponent.name} is blasting off!`);
      await sleep(1600);
      onBattleOver({ winner, loser, nextQuestionIndex: currentQuestionIndexRef.current + 1 });
    },
    [onBattleOver, opponent.name, player.name, soundEnabled]
  );

  const resetMoodsAfterDelay = useCallback(async () => {
    await sleep(900);
    if (finishedRef.current) return;
    setPlayerMood("idle");
    setOpponentMood("idle");
    setLocked(false);
  }, []);

  const handlePlayerAnswer = async (answer: string) => {
    if (locked || turn !== "player" || finishedRef.current) return;

    setLocked(true);
    const isCorrect = answer === currentQuestion.answer;
    setAnswerFeedback({ selected: answer, correct: isCorrect });

    if (isCorrect) {
      playGameSound("correct", soundEnabled);
      const newOpponentLives = opponentLives - 1;
      setOpponentLives(newOpponentLives);
      setPlayerMood("happy");
      setOpponentMood("sad");
      setMessage("Correct! Uh oh... your opponent loses a countdown point!");

      if (newOpponentLives <= 0) {
        await finishBattle("player", "opponent");
        return;
      }

      await resetMoodsAfterDelay();
      nextQuestion();
      setMessage("Correct streak! Your turn continues.");
      return;
    }

    playGameSound("wrong", soundEnabled);
    setPlayerMood("sad");
    setOpponentMood("angry");
    setMessage(`Wrong! The correct answer was: ${currentQuestion.answer}. Opponent's turn.`);
    await sleep(900);
    if (finishedRef.current) return;
    setPlayerMood("idle");
    setOpponentMood("idle");
    setTurn("opponent");
    setLocked(false);
    nextQuestion();
  };

  useEffect(() => {
    if (turn !== "opponent" || locked || finishedRef.current) return;

    const runOpponentTurn = async () => {
      setLocked(true);
      setMessage(`${opponent.name} is thinking...`);
      await sleep(900);

      const willAnswerCorrectly = Math.random() < aiAccuracy;
      const chosenAnswer = willAnswerCorrectly
        ? currentQuestion.answer
        : currentQuestion.options.find((option) => option !== currentQuestion.answer) ?? currentQuestion.options[0];

      setOpponentChoice(chosenAnswer);
      setAnswerFeedback({ selected: chosenAnswer, correct: chosenAnswer === currentQuestion.answer });
      await sleep(700);

      if (chosenAnswer === currentQuestion.answer) {
        playGameSound("wrong", soundEnabled);
        const newPlayerLives = playerLives - 1;
        setPlayerLives(newPlayerLives);
        setOpponentMood("happy");
        setPlayerMood("sad");
        setMessage(`${opponent.name} answered correctly! You lose a countdown point.`);

        if (newPlayerLives <= 0) {
          await finishBattle("opponent", "player");
          return;
        }

        await resetMoodsAfterDelay();
        nextQuestion();
        setMessage(`${opponent.name}'s turn continues...`);
        return;
      }

      playGameSound("correct", soundEnabled);
      setOpponentMood("sad");
      setPlayerMood("happy");
      setMessage(`${opponent.name} got it wrong! Your turn.`);
      await sleep(900);
      if (finishedRef.current) return;
      setOpponentMood("idle");
      setPlayerMood("idle");
      setTurn("player");
      setLocked(false);
      nextQuestion();
    };

    void runOpponentTurn();
  }, [
    currentQuestion,
    finishBattle,
    locked,
    nextQuestion,
    opponent.name,
    playerLives,
    resetMoodsAfterDelay,
    soundEnabled,
    turn,
    aiAccuracy,
  ]);

  return (
    <main className="screen battle-screen">
      <div className="battle-top-controls">
        <div className="round-pill">Round {round} / {maxRounds} <span className="ai-tag">AI {Math.round(aiAccuracy * 100)}%</span></div>
        {soundButton}
      </div>

      <div className="battle-logo fake-logo small-logo">
        <span>ASTRO</span>
        <span>QUIZ</span>
      </div>


      <section className="stage-platform" aria-label="Quiz stage">
        <ScoreBooth
          label="You"
          character={player}
          lives={playerLives}
          mood={playerMood}
          isActive={turn === "player"}
          isLaunching={launching === "player"}
        />

        <ScoreBooth
          label="Opponent"
          character={opponent}
          lives={opponentLives}
          mood={opponentMood}
          isActive={turn === "opponent"}
          isLaunching={launching === "opponent"}
        />
      </section>

      <section className="quiz-panel">
        <div className="question-display">
          <p className="category-label">{currentQuestion.category}</p>
          <h1>{currentQuestion.prompt}</h1>
        </div>

        <div className="answer-list">
          {displayedOptions.map((option) => {
            const isOpponentSelected = opponentChoice === option;
            const isSelectedFeedback = answerFeedback?.selected === option;
            const isCorrectSelected = isSelectedFeedback && answerFeedback?.correct;
            const isWrongSelected = isSelectedFeedback && answerFeedback?.correct === false;
            const shouldRevealCorrect = answerFeedback && !answerFeedback.correct && option === currentQuestion.answer;

            return (
              <button
                key={option}
                className={`answer-button ${isOpponentSelected ? "opponent-selected" : ""} ${isCorrectSelected ? "correct-answer" : ""} ${isWrongSelected ? "wrong-answer" : ""} ${shouldRevealCorrect ? "reveal-correct" : ""}`}
                disabled={locked || turn !== "player"}
                onClick={() => void handlePlayerAnswer(option)}
              >
                {option}
              </button>
            );
          })}
        </div>

        <p className="status-message">{message}</p>
      </section>
    </main>
  );
}
