/**
 * Domain types for IELTS Listening Hub.
 *
 * A Test contains Sections; a Section contains question Groups; a Group is
 * rendered by a type-specific renderer. Fill-in-the-blank content (form,
 * table, notes, sentence) is expressed as `Segment[]` so a single renderer
 * can lay out prose + embedded inputs uniformly.
 */

/** A run of text or a numbered blank input inside a line/cell/value. */
export type Segment =
  | { text: string }
  | { blank: number }; // `blank` is the 1-based question number

export function isBlank(s: Segment): s is { blank: number } {
  return (s as { blank?: number }).blank !== undefined;
}

export type GroupType =
  | "form"
  | "table"
  | "notes"
  | "sentence"
  | "short-answer"
  | "multiple-choice"
  | "dropdown"
  | "matching"
  | "map"
  | "diagram"
  | "flow-chart"
  | "summary"
  | "classification"
  | "pick-from-list"
  | "checkbox";

/** Form completion: stacked "Label: value" rows. */
export interface FormRow {
  label: string;
  segments: Segment[];
}

/** Table completion: header row + body cells (each cell is segments). */
export interface TableCell {
  segments: Segment[];
  header?: boolean;
}

/** Notes completion: optional sub-heading then bulleted/plain lines. */
export interface NoteLine {
  heading?: boolean;
  bullet?: boolean;
  segments: Segment[];
}

/** One option for choice-style questions. */
export interface ChoiceOption {
  value: string; // e.g. "A"
  text: string;
}

/** A multiple-choice / dropdown / pick-from-list question item. */
export interface ChoiceQuestion {
  number: number;
  prompt: string;
  options: ChoiceOption[];
  multiple?: boolean; // checkbox-style
}

export interface QuestionGroup {
  id: string;
  type: GroupType;
  range: string; // "1-5"
  numbers: number[]; // [1,2,3,4,5]
  marks: number;
  instructions: string; // "Complete the table below."
  wordLimit?: string; // "Write ONE WORD AND/OR A NUMBER for each answer."
  heading?: string; // contextual title above the artefact

  // Completion artefacts (one of these is present depending on `type`)
  formRows?: FormRow[];
  tableColumns?: string[];
  tableRows?: TableCell[][];
  noteLines?: NoteLine[];

  // Choice artefacts
  questions?: ChoiceQuestion[];
}

export interface Section {
  id: number;
  title: string; // "Section 1"
  durationSeconds: number;
  questionRange: string; // "1-10"
  groups: QuestionGroup[];
}

export interface ListeningTest {
  id: number;
  slug: string; // "test01"
  title: string;
  type: string; // "IELTS General Training"
  audio: string; // "/audio/test01.mp3"
  image?: string; // "/images/test01.png"
  totalQuestions: number;
  durationSeconds: number;
  sections: Section[];
  /** question number -> accepted answers (case-insensitive match). */
  answers: Record<string, string[]>;
}

/** Lightweight card metadata used on the homepage (no question payload). */
export interface TestSummary {
  id: number;
  slug: string;
  title: string;
  type: string;
  totalQuestions: number;
  durationSeconds: number;
  sectionCount: number;
}

/** Per-question UI state persisted to localStorage. */
export interface AnswerState {
  [questionNumber: string]: string;
}

export interface ReviewState {
  [questionNumber: string]: boolean;
}
