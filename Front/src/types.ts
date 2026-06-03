export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  points: number;
  avatar: string | null;
  completedQuizzesCount: number;
  levelName: 'Aprendiz' | 'Desbravador' | 'Mentor' | 'Mestre';
  progression?: ProgressionStats;
}

export interface ProgressionStats {
  levelName: 'Aprendiz' | 'Desbravador' | 'Mentor' | 'Mestre';
  quizzesCompletedThisLevel: number;
  quizzesNeededForNextLevel: number;
  pointsPerQuestion: number;
  percentProgress: number;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string | null;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  authorName: string;
  authorId: string | null;
  questionsCount?: number;
  questions?: Question[];
  createdAt: string;
}

export interface QuizSubmissionResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  pointsEarned: number;
  quizCompletedNowForFirstTime: boolean;
  userProgress: {
    points: number;
    completedQuizzesCount: number;
    levelName: 'Aprendiz' | 'Desbravador' | 'Mentor' | 'Mestre';
    progression: ProgressionStats;
  };
  answersBreakdown: {
    questionId: string;
    questionText: string;
    options: string[];
    selectedIndex: number;
    correctAnswerIndex: number;
    isCorrect: boolean;
    alreadyCorrect: boolean;
    explanation: string | null;
  }[];
}

export interface EducationalContent {
  id: string;
  title: string;
  htmlContent: string; // Sanitized HTML with clickable anchors
  content: string; // The markdown plain text for editing
  category: string;
  tags: string[];
  authorName: string;
  authorId: string | null;
  imageUrl: string | null;
  attachedFiles: { name: string; url: string }[];
  createdAt: string;
}

export interface AdminLog {
  id: string;
  action: string;
  details: string;
  adminId: string;
  adminEmail: string;
  timestamp: string;
}
