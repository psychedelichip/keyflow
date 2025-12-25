import type { WordState } from '@/types';
import Character from './Character';
import { cn } from '@/utils/cn';

interface WordLineProps {
  word: WordState;
  showCursor?: boolean;
  cursorPosition?: number;
}

export default function WordLine({
  word,
  showCursor = false,
  cursorPosition = 0,
}: WordLineProps) {
  return (
    <span
      className={cn(
        'inline-block mr-2 mb-1',
        word.isActive && 'bg-blue-500/10 rounded px-1'
      )}
    >
      {word.characters.map((char, index) => (
        <Character
          key={index}
          character={char}
          isActive={word.isActive && index === cursorPosition}
        />
      ))}
      {showCursor && word.isActive && cursorPosition === word.characters.length && (
        <span className="inline-block w-0.5 h-5 bg-blue-400 animate-pulse ml-0.5" />
      )}
    </span>
  );
}


