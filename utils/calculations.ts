import type { TestStats } from '@/types';

// WPM (Words Per Minute) hesaplama
// 1 kelime = 5 karakter (standart)
export function calculateWPM(correctChars: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  const minutes = timeInSeconds / 60;
  const words = correctChars / 5;
  return Math.round(words / minutes);
}

// Raw WPM hesaplama (tüm karakterler dahil, hatalar dahil)
export function calculateRawWPM(totalChars: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  const minutes = timeInSeconds / 60;
  const words = totalChars / 5;
  return Math.round(words / minutes);
}

// CPM (Characters Per Minute) hesaplama
export function calculateCPM(chars: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  const minutes = timeInSeconds / 60;
  return Math.round(chars / minutes);
}

// Doğruluk yüzdesi hesaplama
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

// Test istatistiklerini hesapla
export function calculateStats(
  correctChars: number,
  incorrectChars: number,
  totalChars: number,
  timeInSeconds: number
): TestStats {
  const accuracy = calculateAccuracy(correctChars, totalChars);
  const wpm = calculateWPM(correctChars, timeInSeconds);
  const rawWpm = calculateRawWPM(totalChars, timeInSeconds);

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    totalChars,
    timeElapsed: timeInSeconds,
  };
}


