'use client';

import type { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function Leaderboard({ entries, onClose, isLoading, onRefresh }: LeaderboardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-lg rounded-xl p-6"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-accent)' }}
          >
            Global Leaderboard
          </h2>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--color-text-secondary)' }}
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? 'animate-spin' : ''}>
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {isLoading && entries.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <p className="text-lg">Loading...</p>
          </div>
        ) : entries.length === 0 ? (
          <div
            className="text-center py-12"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <p className="text-lg">No scores yet</p>
            <p className="text-sm mt-2">Be the first on the leaderboard!</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg max-h-[60vh] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="text-sm sticky top-0"
                  style={{
                    backgroundColor: 'var(--color-bg-hover)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-right">WPM</th>
                  <th className="py-3 px-4 text-right">Acc</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="border-t transition-colors"
                    style={{
                      borderColor: 'var(--color-bg-hover)',
                      backgroundColor: index === 0 ? 'rgba(226, 183, 20, 0.1)' : 'transparent'
                    }}
                  >
                    <td className="py-3 px-4">
                      {index === 0 ? (
                        <span style={{ color: 'var(--color-accent)' }}>1</span>
                      ) : index === 1 ? (
                        <span className="text-gray-400">2</span>
                      ) : index === 2 ? (
                        <span className="text-amber-700">3</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-secondary)' }}>{index + 1}</span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 font-medium truncate max-w-[120px]"
                      style={{ color: index === 0 ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                      title={entry.name}
                    >
                      {entry.name}
                    </td>
                    <td
                      className="py-3 px-4 text-right font-mono font-bold"
                      style={{ color: 'var(--color-correct)' }}
                    >
                      {entry.wpm}
                    </td>
                    <td
                      className="py-3 px-4 text-right font-mono"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {entry.accuracy}%
                    </td>
                    <td
                      className="py-3 px-4 text-right text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {formatDate(entry.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
