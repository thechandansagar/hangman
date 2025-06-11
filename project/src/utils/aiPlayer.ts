// Letter frequency in English language
const letterFrequency: { [key: string]: number } = {
  'E': 12.7, 'T': 9.1, 'A': 8.2, 'O': 7.5, 'I': 7.0,
  'N': 6.7, 'S': 6.3, 'H': 6.1, 'R': 6.0, 'D': 4.3,
  'L': 4.0, 'C': 2.8, 'U': 2.8, 'M': 2.4, 'W': 2.4,
  'F': 2.2, 'G': 2.0, 'Y': 2.0, 'P': 1.9, 'B': 1.5,
  'V': 1.0, 'K': 0.8, 'J': 0.15, 'X': 0.15, 'Q': 0.10,
  'Z': 0.07
};

export class AIPlayer {
  private usedLetters: Set<string> = new Set();
  private pattern: string = '';
  
  constructor(wordLength: number) {
    this.pattern = '_'.repeat(wordLength);
  }

  updatePattern(newPattern: string) {
    this.pattern = newPattern;
  }

  guessLetter(): string {
    // Get unused letters sorted by frequency
    const availableLetters = Object.entries(letterFrequency)
      .filter(([letter]) => !this.usedLetters.has(letter))
      .sort((a, b) => b[1] - a[1]);

    if (availableLetters.length === 0) return '';

    // Choose the most frequent unused letter
    const guess = availableLetters[0][0];
    this.usedLetters.add(guess);
    return guess;
  }

  reset() {
    this.usedLetters.clear();
  }
}