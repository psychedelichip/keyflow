import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { TestConfig, TestState, WordState, CharacterState } from '@/types';
import { generateWords } from '@/utils/words';
import { getRandomQuote, quoteToWords } from '@/utils/quotes';
import { parseText, parseWord } from '@/utils/textParser';
import { calculateStats } from '@/utils/calculations';

const INITIAL_STATS = {
  wpm: 0,
  rawWpm: 0,
  accuracy: 100,
  correctChars: 0,
  incorrectChars: 0,
  totalChars: 0,
  timeElapsed: 0,
};

export function useTypingTest(config: TestConfig) {
  const configRef = useRef(config);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config.mode, config.time, config.words]);

  const [state, setState] = useState<TestState>(() => ({
    config,
    text: [],
    words: [],
    userInput: '',
    currentWordIndex: 0,
    currentCharIndex: 0,
    startTime: null,
    endTime: null,
    isActive: false,
    isFinished: false,
    stats: INITIAL_STATS,
  }));

  // Generate words based on config
  const generateNewWords = useCallback(() => {
    const cfg = configRef.current;
    let words: string[] = [];

    switch (cfg.mode) {
      case 'time':
      case 'words':
        const wordCount = cfg.mode === 'words' ? (cfg.words || 25) : 100;
        words = generateWords(wordCount);
        break;
      case 'quote':
        const quote = getRandomQuote();
        words = quoteToWords(quote);
        break;
    }

    return parseText(words);
  }, []);

  // Load new text
  const loadNewText = useCallback(() => {
    const words = generateNewWords();
    const text = words.map(w => w.word);

    setState({
      config: configRef.current,
      text,
      words,
      userInput: '',
      currentWordIndex: 0,
      currentCharIndex: 0,
      startTime: null,
      endTime: null,
      isActive: false,
      isFinished: false,
      stats: INITIAL_STATS,
    });
  }, [generateNewWords]);

  // Initialize on mount only
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      loadNewText();
    }
  }, []);

  // Update stats periodically when active
  useEffect(() => {
    if (state.isActive && !state.isFinished && state.startTime) {
      statsIntervalRef.current = setInterval(() => {
        setState((prev) => {
          if (!prev.startTime || prev.isFinished) return prev;

          const timeElapsed = (Date.now() - prev.startTime) / 1000;

          const correctChars = prev.words.reduce((acc, word) => {
            return acc + word.characters.filter((char) => char.status === 'correct').length;
          }, 0);

          const totalChars = prev.words.reduce((acc, word) => acc + word.characters.length, 0);

          const incorrectChars = prev.words.reduce((acc, word) => {
            return acc + word.characters.filter((char) => char.status === 'incorrect').length;
          }, 0);

          const stats = calculateStats(correctChars, incorrectChars, totalChars, timeElapsed);

          return { ...prev, stats };
        });
      }, 100);

      return () => {
        if (statsIntervalRef.current) {
          clearInterval(statsIntervalRef.current);
          statsIntervalRef.current = null;
        }
      };
    }
  }, [state.isActive, state.isFinished]);

  // Start test
  const startTest = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
    }));
  }, []);

  // Finish test
  const finishTest = useCallback(() => {
    setState((prev) => {
      if (!prev.startTime || prev.isFinished) return prev;

      const endTime = Date.now();
      const timeElapsed = (endTime - prev.startTime) / 1000;

      const correctChars = prev.words.reduce((acc, word) => {
        return acc + word.characters.filter((char) => char.status === 'correct').length;
      }, 0);

      const totalChars = prev.words.reduce((acc, word) => acc + word.characters.length, 0);

      const incorrectChars = prev.words.reduce((acc, word) => {
        return acc + word.characters.filter((char) => char.status === 'incorrect').length;
      }, 0);

      const stats = calculateStats(correctChars, incorrectChars, totalChars, timeElapsed);

      return {
        ...prev,
        isActive: false,
        isFinished: true,
        endTime,
        stats,
      };
    });
  }, []);

  // Handle keyboard input
  const handleInput = useCallback((input: string) => {
    setState((prev) => {
      if (prev.isFinished) return prev;

      let newState = { ...prev };

      // Start test on first character
      if (!prev.isActive && input.length > 0) {
        newState.isActive = true;
        newState.startTime = Date.now();
      }

      const currentWord = newState.words[newState.currentWordIndex];
      if (!currentWord) return newState;

      const currentChar = currentWord.characters[newState.currentCharIndex];

      if (!currentChar) {
        // Word complete, expecting space
        if (input === ' ' || input === 'Space') {
          const nextWordIndex = newState.currentWordIndex + 1;

          if (nextWordIndex >= newState.words.length) {
            // Test complete
            const endTime = Date.now();
            const timeElapsed = newState.startTime ? (endTime - newState.startTime) / 1000 : 0;

            const correctChars = newState.words.reduce((acc, word) => {
              return acc + word.characters.filter((char) => char.status === 'correct').length;
            }, 0);

            const totalChars = newState.words.reduce((acc, word) => acc + word.characters.length, 0);

            const incorrectChars = newState.words.reduce((acc, word) => {
              return acc + word.characters.filter((char) => char.status === 'incorrect').length;
            }, 0);

            const stats = calculateStats(correctChars, incorrectChars, totalChars, timeElapsed);

            return {
              ...newState,
              isActive: false,
              isFinished: true,
              endTime,
              stats,
            };
          }

          // Move to next word
          const updatedWords = [...newState.words];
          updatedWords[newState.currentWordIndex] = {
            ...currentWord,
            isComplete: true,
            isActive: false,
          };
          updatedWords[nextWordIndex] = {
            ...updatedWords[nextWordIndex],
            isActive: true,
          };

          return {
            ...newState,
            words: updatedWords,
            currentWordIndex: nextWordIndex,
            currentCharIndex: 0,
            userInput: '',
          };
        }
        return newState;
      }

      // Character check
      const typedChar = input[input.length - 1] || '';
      const expectedChar = currentChar.char;

      const updatedWords = [...newState.words];
      const updatedCharacters = [...currentWord.characters];

      updatedCharacters[newState.currentCharIndex] = {
        ...currentChar,
        status: typedChar === expectedChar ? 'correct' : 'incorrect',
        typedChar,
      };

      updatedWords[newState.currentWordIndex] = {
        ...currentWord,
        characters: updatedCharacters,
      };

      const nextCharIndex = newState.currentCharIndex + 1;

      return {
        ...newState,
        words: updatedWords,
        currentCharIndex: nextCharIndex,
        userInput: input,
      };
    });
  }, []);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    setState((prev) => {
      if (prev.isFinished) return prev;

      const currentWord = prev.words[prev.currentWordIndex];
      if (!currentWord) return prev;

      // If at start of word (charIndex = 0), we can't go back further in the same word
      // For now, just don't allow going back to previous word
      if (prev.currentCharIndex === 0) return prev;

      const updatedWords = [...prev.words];
      const updatedCharacters = [...currentWord.characters];

      // Only update if there's a character to delete
      const charToDelete = prev.currentCharIndex - 1;
      if (charToDelete >= 0 && charToDelete < updatedCharacters.length) {
        updatedCharacters[charToDelete] = {
          ...updatedCharacters[charToDelete],
          status: 'pending',
          typedChar: undefined,
        };

        updatedWords[prev.currentWordIndex] = {
          ...currentWord,
          characters: updatedCharacters,
        };
      }

      return {
        ...prev,
        words: updatedWords,
        currentCharIndex: prev.currentCharIndex - 1,
        userInput: prev.userInput.slice(0, -1),
      };
    });
  }, []);

  // Reset test
  const resetTest = useCallback(() => {
    loadNewText();
  }, [loadNewText]);

  return {
    state,
    startTest,
    finishTest,
    handleInput,
    handleBackspace,
    resetTest,
    loadNewText,
  };
}
