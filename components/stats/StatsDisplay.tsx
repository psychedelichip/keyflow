import type { TestStats } from '@/types';

interface StatsDisplayProps {
  stats: TestStats;
  mode: 'time' | 'words' | 'quote';
  timeRemaining?: number;
  wordsRemaining?: number;
}

export default function StatsDisplay({
  stats,
  mode,
  timeRemaining,
  wordsRemaining,
}: StatsDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <StatItem label="WPM" value={stats.wpm} />
      <StatItem label="Accuracy" value={`${stats.accuracy}%`} />
      <StatItem label="Raw" value={stats.rawWpm} />
      {mode === 'time' && timeRemaining !== undefined && (
        <StatItem label="Time" value={`${timeRemaining}s`} />
      )}
      {mode === 'words' && wordsRemaining !== undefined && (
        <StatItem label="Words" value={wordsRemaining} />
      )}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-sm font-sans" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-accent)' }}>{value}</div>
    </div>
  );
}


