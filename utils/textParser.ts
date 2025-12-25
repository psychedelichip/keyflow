import type { CharacterState, CharacterStatus, WordState } from '@/types';

// Kelimeyi karakter state'lerine çevir
export function parseWord(word: string, isActive: boolean = false): WordState {
  const characters: CharacterState[] = word.split('').map((char) => ({
    char,
    status: 'pending' as CharacterStatus,
  }));

  return {
    word,
    characters,
    isActive,
    isComplete: false,
  };
}

// Metni kelime state'lerine çevir
export function parseText(words: string[]): WordState[] {
  return words.map((word, index) => parseWord(word, index === 0));
}

// Karakter durumunu güncelle
export function updateCharacterStatus(
  character: CharacterState,
  typedChar: string | undefined,
  expectedChar: string
): CharacterState {
  if (!typedChar) {
    return { ...character, status: 'pending' };
  }

  if (typedChar === expectedChar) {
    return { ...character, status: 'correct', typedChar };
  }

  return { ...character, status: 'incorrect', typedChar };
}


