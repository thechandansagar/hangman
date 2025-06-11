export class DifficultyAI {
  private userStats = {
    gamesPlayed: 0,
    averageGuesses: 0,
    winRate: 0,
    totalWins: 0,
  };

  private currentDifficulty: 'easy' | 'medium' | 'hard' = 'easy';

  updateStats(won: boolean, guessCount: number) {
    this.userStats.gamesPlayed++;
    if (won) this.userStats.totalWins++;
    
    // Update average guesses
    this.userStats.averageGuesses = (
      (this.userStats.averageGuesses * (this.userStats.gamesPlayed - 1) + guessCount) /
      this.userStats.gamesPlayed
    );
    
    // Update win rate
    this.userStats.winRate = (this.userStats.totalWins / this.userStats.gamesPlayed) * 100;

    this.adjustDifficulty();
  }

  private adjustDifficulty() {
    if (this.userStats.gamesPlayed < 3) return; // Need minimum games to adjust

    if (this.userStats.winRate > 70 && this.userStats.averageGuesses < 8) {
      // User is doing very well, increase difficulty
      this.currentDifficulty = this.currentDifficulty === 'easy' ? 'medium' : 'hard';
    } else if (this.userStats.winRate < 30 || this.userStats.averageGuesses > 12) {
      // User is struggling, decrease difficulty
      this.currentDifficulty = this.currentDifficulty === 'hard' ? 'medium' : 'easy';
    }
  }

  getCurrentDifficulty() {
    return this.currentDifficulty;
  }

  getStats() {
    return {
      ...this.userStats,
      difficulty: this.currentDifficulty,
    };
  }
}