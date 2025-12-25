'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry, TestMode } from '@/types';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Supabase'den verileri yükle
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('wpm', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch leaderboard:', error);
        return;
      }

      const formattedEntries: LeaderboardEntry[] = (data || []).map((entry) => ({
        id: entry.id,
        name: entry.username,
        wpm: entry.wpm,
        accuracy: Number(entry.accuracy),
        mode: entry.mode as TestMode,
        time: entry.time_setting,
        words: entry.word_count,
        date: entry.created_at,
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Yeni skor ekle (authenticated users only)
  const addScore = useCallback(async (
    userId: string,
    username: string,
    wpm: number,
    accuracy: number,
    mode: TestMode,
    time?: number,
    words?: number
  ) => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .insert({
          user_id: userId,
          username,
          wpm,
          accuracy,
          mode,
          time_setting: time,
          word_count: words,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to add score:', error);
        return null;
      }

      // Refresh leaderboard
      await fetchLeaderboard();

      return {
        id: data.id,
        name: data.username,
        wpm: data.wpm,
        accuracy: Number(data.accuracy),
        mode: data.mode as TestMode,
        time: data.time_setting,
        words: data.word_count,
        date: data.created_at,
      } as LeaderboardEntry;
    } catch (error) {
      console.error('Failed to add score:', error);
      return null;
    }
  }, [fetchLeaderboard]);

  // En iyi skoru getir
  const getTopScore = useCallback((mode?: TestMode) => {
    const filtered = mode ? entries.filter(e => e.mode === mode) : entries;
    return filtered[0] || null;
  }, [entries]);

  // Refresh
  const refresh = useCallback(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    isLoaded,
    isLoading,
    addScore,
    getTopScore,
    refresh,
  };
}
