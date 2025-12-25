'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useTimer } from '@/hooks/useTimer';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import type { TestMode } from '@/types';
import { SOUND_PACKS } from '@/types/sounds';
import { DEFAULT_TIME, DEFAULT_WORD_COUNT } from '@/utils/constants';
import TypingArea from '@/components/typing/TypingArea';
import StatsDisplay from '@/components/stats/StatsDisplay';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import SaveScoreModal from '@/components/leaderboard/SaveScoreModal';
import MechanicalKeyboard from '@/components/keyboard/MechanicalKeyboard';
import AuthModal from '@/components/auth/AuthModal';

export default function Home() {
  const [mode, setMode] = useState<TestMode>('time');
  const [time, setTime] = useState(DEFAULT_TIME);
  const [wordCount, setWordCount] = useState(DEFAULT_WORD_COUNT);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSaveScore, setShowSaveScore] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [selectedSoundPack, setSelectedSoundPack] = useState('cherrymx-black-abs');
  const [showSoundPackMenu, setShowSoundPackMenu] = useState(false);
  const hasShownSaveModal = useRef(false);
  const timerStarted = useRef(false);
  const pendingScoreSave = useRef(false);

  const auth = useAuth();
  const leaderboard = useLeaderboard();

  const backgroundMusic = useBackgroundMusic(undefined, {
    volume: 0.25,
    autoPlay: true,
  });

  const currentSoundPack = SOUND_PACKS.find(p => p.id === selectedSoundPack);
  const keyboardSound = useKeyboardSound({
    enabled: isSoundEnabled,
    volume: 0.4,
    soundPackPath: currentSoundPack?.path || '',
  });

  const { state, handleInput, handleBackspace, resetTest, finishTest } =
    useTypingTest({
      mode,
      time: mode === 'time' ? time : undefined,
      words: mode === 'words' ? wordCount : undefined,
    });

  const onTimerEnd = useCallback(() => {
    finishTest();
  }, [finishTest]);

  const timer = useTimer(mode === 'time' ? time : 999, onTimerEnd);

  // Start timer when test becomes active (only once)
  useEffect(() => {
    if (state.isActive && mode === 'time' && !timerStarted.current) {
      timerStarted.current = true;
      timer.reset(time);
      timer.start();
    }
  }, [state.isActive, mode, time]);

  // Stop timer when test ends
  useEffect(() => {
    if (state.isFinished) {
      timer.stop();
      timerStarted.current = false;
    }
  }, [state.isFinished]);

  // Reset refs when test resets
  useEffect(() => {
    if (!state.isActive && !state.isFinished) {
      hasShownSaveModal.current = false;
      timerStarted.current = false;
    }
  }, [state.isActive, state.isFinished]);

  // Show save score modal when test finishes (only once)
  useEffect(() => {
    if (state.isFinished && state.stats.wpm > 0 && !hasShownSaveModal.current) {
      hasShownSaveModal.current = true;
      setShowSaveScore(true);
    }
  }, [state.isFinished, state.stats.wpm]);

  // Save score after login if pending
  useEffect(() => {
    if (auth.isAuthenticated && pendingScoreSave.current && auth.user) {
      pendingScoreSave.current = false;
      leaderboard.addScore(
        auth.user.id,
        auth.username,
        state.stats.wpm,
        state.stats.accuracy,
        mode,
        mode === 'time' ? time : undefined,
        mode === 'words' ? wordCount : undefined
      );
      setShowSaveScore(false);
    }
  }, [auth.isAuthenticated, auth.user, auth.username, state.stats, mode, time, wordCount, leaderboard]);

  // Close sound pack menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSoundPackMenu) {
        setShowSoundPackMenu(false);
      }
    };

    if (showSoundPackMenu) {
      // Delay to prevent immediate close
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showSoundPackMenu]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLeaderboard || showSaveScore || showAuthModal) return;
      if (state.isFinished) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        keyboardSound.playKeySound('backspace', 'backspace');
        handleBackspace();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        keyboardSound.playKeySound('keydown', ' ');
        handleInput(' ');
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        keyboardSound.playKeySound('keydown', e.key);
        handleInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isFinished, handleInput, handleBackspace, showLeaderboard, showSaveScore, showAuthModal]);

  const handleSaveScore = async () => {
    if (!auth.user) return;

    await leaderboard.addScore(
      auth.user.id,
      auth.username,
      state.stats.wpm,
      state.stats.accuracy,
      mode,
      mode === 'time' ? time : undefined,
      mode === 'words' ? wordCount : undefined
    );
    setShowSaveScore(false);
  };

  const handleLoginFromSaveModal = () => {
    pendingScoreSave.current = true;
    setShowSaveScore(false);
    setShowAuthModal(true);
  };

  const handleReset = useCallback(() => {
    resetTest();
    setShowSaveScore(false);
    hasShownSaveModal.current = false;
    timerStarted.current = false;
  }, [resetTest]);

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg-dark)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--color-bg-card)' }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12"/>
          </svg>
          <h1
            className="text-2xl font-bold font-mono"
            style={{ color: 'var(--color-accent)' }}
          >
            keyflow
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Leaderboard Button */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"/>
              <circle cx="12" cy="8" r="7"/>
            </svg>
            Leaderboard
          </button>

          {/* Music Toggle */}
          <button
            onClick={backgroundMusic.toggle}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              color: backgroundMusic.isPlaying ? 'var(--color-accent)' : 'var(--color-text-secondary)'
            }}
            title={backgroundMusic.isPlaying ? 'Stop Music' : 'Play Lo-fi Music'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </button>

          {/* Sound Pack Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSoundPackMenu(!showSoundPackMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)'
              }}
              title="Select Sound Pack"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h8"/>
              </svg>
              <span className="text-sm hidden sm:inline">{currentSoundPack?.name || 'Sound'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showSoundPackMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                {SOUND_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => {
                      setSelectedSoundPack(pack.id);
                      setShowSoundPackMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm transition-all first:rounded-t-lg last:rounded-b-lg"
                    style={{
                      backgroundColor: selectedSoundPack === pack.id ? 'var(--color-bg-hover)' : 'transparent',
                      color: selectedSoundPack === pack.id ? 'var(--color-accent)' : 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSoundPack !== pack.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'var(--color-accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSoundPack !== pack.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                  >
                    {pack.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              color: isSoundEnabled ? 'var(--color-accent)' : 'var(--color-text-secondary)'
            }}
            title={isSoundEnabled ? 'Mute Keyboard' : 'Enable Keyboard Sound'}
          >
            {isSoundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            )}
          </button>

          {/* Auth Button */}
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span
                className="text-sm hidden sm:inline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {auth.username}
              </span>
              <button
                onClick={() => auth.signOut()}
                className="px-3 py-2 rounded-lg transition-colors hover:opacity-80 text-sm"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-lg transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg-dark)'
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-8 pb-40">
        {/* Test Mode Selection */}
        <div className="mb-6 flex gap-2 font-sans">
          <button
            onClick={() => {
              setMode('time');
              handleReset();
            }}
            className="px-4 py-2 rounded transition-colors"
            style={{
              backgroundColor: mode === 'time' ? 'var(--color-accent)' : 'var(--color-bg-card)',
              color: mode === 'time' ? 'var(--color-bg-dark)' : 'var(--color-text-secondary)'
            }}
          >
            Time
          </button>
          <button
            onClick={() => {
              setMode('words');
              handleReset();
            }}
            className="px-4 py-2 rounded transition-colors"
            style={{
              backgroundColor: mode === 'words' ? 'var(--color-accent)' : 'var(--color-bg-card)',
              color: mode === 'words' ? 'var(--color-bg-dark)' : 'var(--color-text-secondary)'
            }}
          >
            Words
          </button>
        </div>

        {/* Time/Word Count Selection */}
        <div className="mb-6 flex gap-2">
          {mode === 'time' ? (
            [15, 30, 60, 120].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTime(t);
                  handleReset();
                }}
                className="px-3 py-1 rounded text-sm transition-colors"
                style={{
                  backgroundColor: time === t ? 'var(--color-bg-hover)' : 'transparent',
                  color: time === t ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                }}
              >
                {t}s
              </button>
            ))
          ) : (
            [10, 25, 50, 100].map((w) => (
              <button
                key={w}
                onClick={() => {
                  setWordCount(w);
                  handleReset();
                }}
                className="px-3 py-1 rounded text-sm transition-colors"
                style={{
                  backgroundColor: wordCount === w ? 'var(--color-bg-hover)' : 'transparent',
                  color: wordCount === w ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                }}
              >
                {w}
              </button>
            ))
          )}
        </div>

        {/* Stats */}
        <StatsDisplay
          stats={state.stats}
          mode={mode}
          timeRemaining={mode === 'time' ? timer.time : undefined}
          wordsRemaining={
            mode === 'words'
              ? state.words.length - state.currentWordIndex
              : undefined
          }
        />

        {/* Typing Area */}
        <TypingArea state={state} />

        {/* Results when test is finished */}
        {state.isFinished && (
          <div
            className="mt-8 p-6 rounded-lg font-sans"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <h2
              className="text-2xl font-bold mb-4 text-center"
              style={{ color: 'var(--color-accent)' }}
            >
              Test Complete!
            </h2>
            <div className="flex gap-6 justify-center">
              <div className="text-center">
                <div style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                  WPM
                </div>
                <div
                  className="text-3xl font-bold font-mono"
                  style={{ color: 'var(--color-correct)' }}
                >
                  {state.stats.wpm}
                </div>
              </div>
              <div className="text-center">
                <div style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                  Accuracy
                </div>
                <div
                  className="text-3xl font-bold font-mono"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {state.stats.accuracy}%
                </div>
              </div>
              <div className="text-center">
                <div style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                  Time
                </div>
                <div
                  className="text-3xl font-bold font-mono"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {state.stats.timeElapsed.toFixed(1)}s
                </div>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="mt-6 w-full px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg-dark)'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Message before test starts */}
        {!state.isActive && !state.isFinished && (
          <p
            className="mt-4 font-sans text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Start typing to begin the test
          </p>
        )}
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard
          entries={leaderboard.entries}
          onClose={() => setShowLeaderboard(false)}
          isLoading={leaderboard.isLoading}
          onRefresh={leaderboard.refresh}
        />
      )}

      {/* Save Score Modal */}
      {showSaveScore && state.isFinished && (
        <SaveScoreModal
          wpm={state.stats.wpm}
          accuracy={state.stats.accuracy}
          isAuthenticated={auth.isAuthenticated}
          username={auth.username}
          onSave={handleSaveScore}
          onSkip={() => setShowSaveScore(false)}
          onLogin={handleLoginFromSaveModal}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Mechanical Keyboard */}
      <MechanicalKeyboard />
    </main>
  );
}
