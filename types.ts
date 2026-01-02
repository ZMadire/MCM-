export enum DifficultyLevel {
  EASY = "Introductory",
  MEDIUM = "Intermediate",
  HARD = "Advanced",
  EXPERT = "Expert"
}

export interface Variable {
  symbol: string;
  description: string;
  unit?: string;
  type: string; // e.g., Continuous, Discrete, Binary
}

export interface Approach {
  id: string;
  name: string;
  category: string; // e.g., Differential Equations, Machine Learning, Graph Theory
  summary: string;
  steps: string[];
  pros: string[];
  cons: string[];
  complexity: string;
  toolsRecommendation: string[]; // e.g., MATLAB, Python (Pandas/Scikit-learn), Lingo
}

export interface AnalysisResult {
  title: string;
  problemType: string; // e.g., Optimization, Prediction, Evaluation
  summary: string;
  keyChallenges: string[];
  assumptions: string[];
  variables: Variable[];
  approaches: Approach[];
  conclusion: string;
}
