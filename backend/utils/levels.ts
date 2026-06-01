/**
 * Progression logic for EduRank Nivel system.
 * Maximum score: 1000 points.
 * Level 1 (Aprendiz): 0-4 quizzes solved. Gives 50 points per complete quiz (10 pts per question). Up to 250 points.
 * Level 2 (Desbravador): 5-9 quizzes solved. Gives 100 points per complete quiz (20 pts per question). Up to 750 points.
 * Level 3 (Mentor): 10-14 quizzes solved. Gives 50 points per complete quiz (10 pts per question). Up to 1000 points.
 * Level 4 (Mestre): 15+ quizzes solved. Level maximum.
 */

export function getLevelName(completedCount: number): 'Aprendiz' | 'Desbravador' | 'Mentor' | 'Mestre' {
  if (completedCount < 5) return 'Aprendiz';
  if (completedCount < 10) return 'Desbravador';
  if (completedCount < 15) return 'Mentor';
  return 'Mestre';
}

export interface ProgressionStats {
  levelName: 'Aprendiz' | 'Desbravador' | 'Mentor' | 'Mestre';
  quizzesCompletedThisLevel: number;
  quizzesNeededForNextLevel: number;
  pointsPerQuestion: number;
  percentProgress: number;
}

export function getProgressionStats(completedCount: number): ProgressionStats {
  const level = getLevelName(completedCount);
  
  if (level === 'Aprendiz') {
    return {
      levelName: 'Aprendiz',
      quizzesCompletedThisLevel: completedCount,
      quizzesNeededForNextLevel: 5,
      pointsPerQuestion: 10, // 5 questions * 10 pts = 50 pts
      percentProgress: Math.min(100, (completedCount / 5) * 100)
    };
  } else if (level === 'Desbravador') {
    return {
      levelName: 'Desbravador',
      quizzesCompletedThisLevel: completedCount - 5,
      quizzesNeededForNextLevel: 5,
      pointsPerQuestion: 20, // 5 questions * 20 pts = 100 pts
      percentProgress: Math.min(100, ((completedCount - 5) / 5) * 100)
    };
  } else if (level === 'Mentor') {
    return {
      levelName: 'Mentor',
      quizzesCompletedThisLevel: completedCount - 10,
      quizzesNeededForNextLevel: 5,
      pointsPerQuestion: 10, // 5 questions * 10 pts = 50 pts
      percentProgress: Math.min(100, ((completedCount - 10) / 5) * 100)
    };
  } else {
    return {
      levelName: 'Mestre',
      quizzesCompletedThisLevel: completedCount - 15,
      quizzesNeededForNextLevel: 0,
      pointsPerQuestion: 0,
      percentProgress: 100
    };
  }
}
