import type { ReactNode } from "react";

type Props = {
  onBegin: () => void;
  soundButton?: ReactNode;
};

export default function IntroScreen({ onBegin, soundButton }: Props) {
  return (
    <main className="screen intro-screen">
      {soundButton}
      <div className="fake-logo" aria-label="Prototype quiz logo">
        <span>ASTRO</span>
        <span>QUIZ</span>
      </div>

      <section className="intro-card">
        <div className="black-display" />
        <div className="intro-copy">
          <p>How good is your toon knowledge...?</p>
          <p>Knock your opponent&apos;s score down to 0 to blast them into space.</p>
          <p>Careful though... one lost round ends the game!</p>
        </div>
      </section>

      <button className="big-link-button" onClick={onBegin}>
        begin
      </button>
    </main>
  );
}
