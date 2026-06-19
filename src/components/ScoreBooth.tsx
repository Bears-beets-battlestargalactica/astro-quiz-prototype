import type { Character, Mood } from "../types/game";
import CharacterImage from "./CharacterImage";

type Props = {
  label: string;
  character: Character;
  lives: number;
  mood: Mood;
  isActive: boolean;
  isLaunching: boolean;
};

export default function ScoreBooth({ label, character, lives, mood, isActive, isLaunching }: Props) {
  const reactionSrc = mood === "idle" ? character.assets.portrait : character.assets[mood];

  return (
    <article className={`score-booth ${isActive ? "active-turn" : ""} ${isLaunching ? "launching" : ""}`}>
      <p className="booth-label">{label}</p>

      <div className="character-stage">
        <CharacterImage
          src={character.assets.idle}
          alt={`${character.name} idle`}
          fallbackLabel={character.shortName}
          className="stage-character"
        />

        {mood !== "idle" && (
          <div className={`reaction-bubble ${mood}`}>
            <CharacterImage
              src={reactionSrc}
              alt={`${character.name} ${mood}`}
              fallbackLabel={mood}
              className="reaction-image"
            />
          </div>
        )}
      </div>

      <div className="podium-wrap" aria-label={`${character.name} has ${lives} countdown points`}>
        <div className="score-star">
          <span>{lives}</span>
        </div>
        <div className="booth-base">
          <div className="booth-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </article>
  );
}
