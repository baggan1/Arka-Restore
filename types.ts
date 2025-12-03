export interface YogaPose {
  name: string;
  sanskritName: string;
  description: string;
  benefits: string[];
  steps: string[];
  dos: string[];
  donts: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
}

export interface RecommendationResponse {
  overview: string;
  poses: YogaPose[];
}

export interface VideoGenerationState {
  isGenerating: boolean;
  videoUrl: string | null;
  error: string | null;
  progress: number; // 0 to 100 for simulated progress
}
