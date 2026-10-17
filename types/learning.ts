/** Languages the app can currently teach. */
export type SupportedLanguage = {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  learnerCount: string;
  /** The language used for instructions and translations in the sample content. */
  instructionLanguage: string;
};

export type LessonActivityType =
  | "introduce"
  | "listen-and-repeat"
  | "multiple-choice"
  | "speaking-practice";

/** A small, display-ready step that can appear inside a lesson. */
export type LessonActivity = {
  id: string;
  type: LessonActivityType;
  prompt: string;
  /** Optional answer choices for multiple-choice activities. */
  options?: string[];
  /** Kept in the local content data for simple practice flows. */
  correctAnswer?: string;
};

export type VocabularyItem = {
  word: string;
  translation: string;
  pronunciation?: string;
};

export type Phrase = {
  text: string;
  translation: string;
  pronunciation?: string;
};

export type LearningUnit = {
  id: string;
  languageId: string;
  title: string;
  description: string;
  order: number;
};

export type LearningLesson = {
  id: string;
  languageId: string;
  unitId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  xp: number;
  goal: string;
  activities: LessonActivity[];
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  /** Context for a future audio-based Vision Agent teacher session. */
  aiTeacherPrompt: string;
};
