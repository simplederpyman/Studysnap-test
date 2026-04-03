export type Mode = "quiz" | "flashcards" | "explanations";

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "open" | "true_false" | "matching" | "fill_blank" | "scenario";
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface Flashcard {
  id: string;
  type: "term_definition" | "question_answer" | "concept_example" | "image_description";
  front: string;
  back: string;
  reversible?: boolean;
}

export interface ExplanationItem {
  id: string;
  format: "summary" | "concept" | "steps" | "mindmap" | "comparison" | "examples";
  title: string;
  content: string;
}

export interface StudySet {
  id: string;
  title: string;
  status: "concept" | "published";
  category: string;
  level: number;
  language: string;
  tags: string[];
  sourceSummary: string;
  createdAt: string;
  updatedAt: string;
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  explanations: ExplanationItem[];
  stats: { practiceCount: number; practiceMinutes: number; retentionPercentage: number };
}

export interface GenerateConfig {
  title: string;
  modes: Mode[];
  category: string;
  level: number;
  language: string;
  itemCount: number;
  focus: "begrippen" | "toepassing";
  includeSources: boolean;
  includeDifficulty: boolean;
  includeAnswerExplanations: boolean;
  summarySize: "kort" | "middellang" | "uitgebreid";
}
