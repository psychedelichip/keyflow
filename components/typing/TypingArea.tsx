'use client';

import { useEffect, useRef } from 'react';
import type { TestState } from '@/types';
import WordLine from './WordLine';

interface TypingAreaProps {
  state: TestState;
}

export default function TypingArea({ state }: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Aktif kelimeyi görünür alanda tut
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [state.currentWordIndex]);

  return (
    <div
      ref={containerRef}
      className="w-full mx-auto px-4 py-8 overflow-y-auto max-h-[60vh]"
      style={{ maxWidth: 'calc(4rem * 16 + 100px)' }}
    >
      <div className="font-mono leading-relaxed select-none" style={{ fontSize: '20px' }}>
        {state.words.map((word, index) => (
          <span key={index} ref={index === state.currentWordIndex ? activeWordRef : null}>
            <WordLine
              word={word}
              showCursor={true}
              cursorPosition={
                index === state.currentWordIndex ? state.currentCharIndex : undefined
              }
            />
          </span>
        ))}
      </div>
    </div>
  );
}


