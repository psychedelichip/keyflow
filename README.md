# Monkey Type

A modern typing speed test application built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- 🎯 Multiple test modes (Time, Words, Quote)
- 📊 Real-time statistics (WPM, Accuracy, Raw WPM)
- 🎨 Beautiful UI with Geist fonts
- ⌨️ Real-time character highlighting
- 📈 Accurate typing metrics
- 🎵 Background lo-fi music
- 🔊 Mechanical keyboard sound effects

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Geist Sans & Geist Mono
- **Animations**: Framer Motion

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout with fonts
│   ├── page.tsx        # Main typing test page
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── typing/         # Typing-related components
│   ├── stats/          # Statistics components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
│   ├── useTypingTest.ts # Main typing test logic
│   └── useTimer.ts     # Timer hook
├── utils/              # Utility functions
│   ├── words.ts        # Word generation
│   ├── quotes.ts       # Quote database
│   ├── calculations.ts # WPM/accuracy calculations
│   └── textParser.ts   # Text parsing utilities
└── types/              # TypeScript type definitions
```

## Customization

The design is built to be easily customizable. You can redesign the UI in Figma and update the component styles accordingly.

### Fonts

The project uses Geist fonts:
- **Geist Sans**: UI elements, headers, stats
- **Geist Mono**: Typing area (monospace)

### Colors

Current color scheme:
- Background: `gray-900`
- Text: `gray-100`
- Correct: `green-400`
- Incorrect: `red-400`
- Active word: `blue-500/10`

You can customize these in the component files and `globals.css`.

### Audio Settings

#### Lo-fi Music
To add your own lo-fi music:
1. Place an MP3 file in the `public/` folder
2. Update the music URL in `app/page.tsx`:
   ```typescript
   const backgroundMusic = useBackgroundMusic('/your-music.mp3', {
     volume: 0.2,
     loop: true,
     autoPlay: false,
   });
   ```

The music will automatically start when you begin typing.

#### Keyboard Sound
Mechanical keyboard sounds are generated programmatically using Web Audio API. The sound is played on every keypress (including backspace with a different tone).

To customize:
- Edit `hooks/useKeyboardSound.ts`
- Adjust volume: `volume: 0.4` (0-1 range)
- Change variant: `variant: 'mechanical' | 'click' | 'type'`

## License

MIT

