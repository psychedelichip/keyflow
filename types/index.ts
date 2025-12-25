// Test modları
export type TestMode = 'time' | 'words' | 'quote';

// Test konfigürasyonu
export type TestConfig = {
  mode: TestMode;
  time?: number; // saniye (time mode için)
  words?: number; // kelime sayısı (words mode için)
  quoteId?: number; // quote ID (quote mode için)
};

// Karakter durumları
export type CharacterStatus = 'pending' | 'correct' | 'incorrect' | 'extra';

// Karakter state
export type CharacterState = {
  char: string;
  status: CharacterStatus;
  typedChar?: string; // Kullanıcının yazdığı karakter
};

// Kelime state
export type WordState = {
  word: string;
  characters: CharacterState[];
  isActive: boolean;
  isComplete: boolean;
};

// Test istatistikleri
export type TestStats = {
  wpm: number; // Words Per Minute
  rawWpm: number; // Raw WPM (tüm karakterler dahil)
  accuracy: number; // Doğruluk yüzdesi (0-100)
  correctChars: number; // Doğru karakter sayısı
  incorrectChars: number; // Yanlış karakter sayısı
  totalChars: number; // Toplam karakter sayısı
  timeElapsed: number; // Geçen süre (saniye)
};

// Test durumu
export type TestState = {
  config: TestConfig;
  text: string[]; // Test metni (kelime array)
  words: WordState[]; // Kelime state'leri
  userInput: string; // Kullanıcının yazdığı metin
  currentWordIndex: number; // Şu anki kelime indexi
  currentCharIndex: number; // Şu anki karakter indexi (kelime içinde)
  startTime: number | null;
  endTime: number | null;
  isActive: boolean; // Test aktif mi?
  isFinished: boolean; // Test tamamlandı mı?
  stats: TestStats;
};

// Liderlik tablosu girişi
export type LeaderboardEntry = {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  mode: TestMode;
  time?: number;
  words?: number;
  date: string;
};


