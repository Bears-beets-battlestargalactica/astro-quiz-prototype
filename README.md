# Astro Quiz Prototype V5

Private/local fan prototype.

## What changed in V5

- Questions are shuffled at the start of every new game.
- Questions now advance from one shared deck across all rounds, so a question should not repeat within the same game run unless the full question bank is exhausted.
- The sound control is now clearer: **Mute Sound / Unmute Sound**.
- The mute button now appears on the intro, character select, round, battle, and result screens.
- The question bank has been rewritten as a more challenging Cartoon Network tribute set.
- Removed the easy rule questions like “how many options are there?” and “what happens at the end of the round?”
- Kept V4 music and sound effects:
  - intro/select music
  - round music
  - character theme patterns
  - hover/focus character jingles
  - win/lose music
  - correct/wrong/select/launch effects

## Run

```bash
npm install --no-audit --no-fund
npm run dev
```

If npm tries to use a weird registry, run:

```bash
rm -f package-lock.json
npm config set registry https://registry.npmjs.org/
npm install --no-audit --no-fund
npm run dev
```

## Character image folders

Put character PNGs here:

```text
public/assets/characters/ed/
public/assets/characters/edd/
public/assets/characters/eddy/
public/assets/characters/courage/
public/assets/characters/grim/
public/assets/characters/dexter/
public/assets/characters/johnny-bravo/
public/assets/characters/blossom/
public/assets/characters/bubbles/
public/assets/characters/buttercup/
```

Each folder should contain:

```text
portrait.png
idle.png
happy.png
sad.png
angry.png
```

The game still works without every image, but missing images will show fallback boxes until you add them.

## Edit questions

Edit:

```text
src/data/questions.ts
```

Each question has:

```ts
{
  id: 1,
  category: "Ed, Edd n Eddy",
  prompt: "What candy are the Eds usually trying to buy?",
  options: ["Jawbreakers", "Chocolate bars", "Bubble gum"],
  answer: "Jawbreakers",
}
```

Make sure `answer` exactly matches one of the options.
