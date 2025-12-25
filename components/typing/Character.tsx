import type { CharacterState } from '@/types';

interface CharacterProps {
  character: CharacterState;
  isActive: boolean;
}

export default function Character({ character, isActive }: CharacterProps) {
  const getStatusStyle = (): React.CSSProperties => {
    switch (character.status) {
      case 'correct':
        return { color: 'var(--color-correct)' };
      case 'incorrect':
        return { color: 'var(--color-incorrect)', backgroundColor: 'rgba(248, 113, 113, 0.2)' };
      case 'extra':
        return { color: 'var(--color-incorrect)', backgroundColor: 'rgba(248, 113, 113, 0.2)' };
      case 'pending':
      default:
        return { color: 'var(--color-text-secondary)' };
    }
  };

  const style = getStatusStyle();
  if (isActive && character.status === 'pending') {
    style.color = 'var(--color-text-primary)';
  }

  return (
    <span
      className="transition-colors duration-100"
      style={style}
    >
      {character.char}
    </span>
  );
}


