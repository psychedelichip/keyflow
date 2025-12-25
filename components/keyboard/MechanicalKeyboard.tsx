'use client';

import { useEffect, useState } from 'react';

interface MechanicalKeyboardProps {
  activeKey?: string;
}

const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export default function MechanicalKeyboard({ activeKey }: MechanicalKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key.length === 1 && key.match(/[a-z]/)) {
        setPressedKey(key);
      } else if (e.key === ' ') {
        setPressedKey('space');
      }
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const isKeyPressed = (key: string) => {
    return pressedKey === key || activeKey?.toLowerCase() === key;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-4 pt-3 pointer-events-none">
      <div className="flex flex-col items-center gap-1">
        {keyboardLayout.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-1"
            style={{ marginLeft: rowIndex === 1 ? '16px' : rowIndex === 2 ? '36px' : '0' }}
          >
            {row.map((key) => (
              <div
                key={key}
                className="w-8 h-8 rounded flex items-center justify-center font-mono text-xs uppercase transition-all duration-75"
                style={{
                  backgroundColor: isKeyPressed(key)
                    ? 'var(--color-accent)'
                    : '#2a2a2a',
                  color: isKeyPressed(key)
                    ? 'var(--color-bg-dark)'
                    : '#888888',
                  transform: isKeyPressed(key) ? 'translateY(1px)' : 'translateY(0)',
                  boxShadow: isKeyPressed(key)
                    ? 'inset 0 1px 2px rgba(0,0,0,0.3)'
                    : '0 2px 0 #1a1a1a, 0 3px 3px rgba(0,0,0,0.2)',
                }}
              >
                {key}
              </div>
            ))}
          </div>
        ))}

        {/* Space bar */}
        <div
          className="w-48 h-8 rounded flex items-center justify-center font-mono text-xs uppercase transition-all duration-75 mt-0.5"
          style={{
            backgroundColor: isKeyPressed('space')
              ? 'var(--color-accent)'
              : '#2a2a2a',
            color: isKeyPressed('space')
              ? 'var(--color-bg-dark)'
              : '#888888',
            transform: isKeyPressed('space') ? 'translateY(1px)' : 'translateY(0)',
            boxShadow: isKeyPressed('space')
              ? 'inset 0 1px 2px rgba(0,0,0,0.3)'
              : '0 2px 0 #1a1a1a, 0 3px 3px rgba(0,0,0,0.2)',
          }}
        >
          space
        </div>
      </div>
    </div>
  );
}
