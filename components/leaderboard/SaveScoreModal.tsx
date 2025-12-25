'use client';

import { useState } from 'react';

interface SaveScoreModalProps {
  wpm: number;
  accuracy: number;
  isAuthenticated: boolean;
  username?: string;
  onSave: () => void;
  onSkip: () => void;
  onLogin: () => void;
}

export default function SaveScoreModal({
  wpm,
  accuracy,
  isAuthenticated,
  username,
  onSave,
  onSkip,
  onLogin,
}: SaveScoreModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h2
          className="text-xl font-bold mb-4 text-center"
          style={{ color: 'var(--color-accent)' }}
        >
          {isAuthenticated ? 'Save Your Score!' : 'Great Score!'}
        </h2>

        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              WPM
            </div>
            <div
              className="text-3xl font-bold font-mono"
              style={{ color: 'var(--color-correct)' }}
            >
              {wpm}
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
              {accuracy}%
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <>
            <p
              className="text-center mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Save as <span style={{ color: 'var(--color-accent)' }}>{username}</span>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-bg-hover)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-bg-dark)'
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className="text-center mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sign in to save your score to the global leaderboard!
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-bg-hover)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-bg-dark)'
                }}
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
