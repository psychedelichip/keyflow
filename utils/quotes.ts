// Alıntı veritabanı (örnek)
export interface Quote {
  id: number;
  text: string;
  author: string;
  length: number;
}

export const QUOTES: Quote[] = [
  {
    id: 1,
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    length: 54,
  },
  {
    id: 2,
    text: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    length: 57,
  },
  {
    id: 3,
    text: 'Life is what happens to you while you are busy making other plans.',
    author: 'John Lennon',
    length: 66,
  },
  {
    id: 4,
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
    length: 72,
  },
  {
    id: 5,
    text: 'It is during our darkest moments that we must focus to see the light.',
    author: 'Aristotle',
    length: 70,
  },
];

// Rastgele alıntı seç
export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[randomIndex];
}

// ID'ye göre alıntı getir
export function getQuoteById(id: number): Quote | undefined {
  return QUOTES.find((quote) => quote.id === id);
}

// Alıntıyı kelimelere böl
export function quoteToWords(quote: Quote): string[] {
  return quote.text.split(' ');
}


