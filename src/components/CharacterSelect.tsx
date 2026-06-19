import type { ReactNode } from "react";
import type { Character } from "../types/game";
import CharacterImage from "./CharacterImage";

type Props = {
  characters: Character[];
  onSelect: (character: Character) => void;
  onPreview?: (character: Character) => void;
  soundButton?: ReactNode;
};

export default function CharacterSelect({ characters, onSelect, onPreview, soundButton }: Props) {
  return (
    <main className="screen select-screen">
      {soundButton}
      <div className="fake-logo select-logo">
        <span>ASTRO</span>
        <span>QUIZ</span>
      </div>

      <section className="character-selection-panel">
        <div className="character-grid">
          {characters.map((character) => (
            <button
              key={character.id}
              className="character-card"
              onMouseEnter={() => onPreview?.(character)}
              onFocus={() => onPreview?.(character)}
              onClick={() => onSelect(character)}
            >
              <CharacterImage
                src={character.assets.portrait}
                alt={character.name}
                fallbackLabel={character.shortName}
                className="portrait-image"
              />
              <span>{character.name}</span>
            </button>
          ))}
        </div>
      </section>

      <h1 className="select-title">Please choose your character</h1>
    </main>
  );
}
