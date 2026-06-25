/**
 * IELTS Listening band estimation.
 *
 * The official band table maps a raw score out of 40. These practice tests use
 * a single 10-question section, so the raw score is scaled to a /40 equivalent
 * before lookup. The result is therefore an *indicative* band, not an official
 * one — surfaced to the candidate as an estimate.
 */

export interface BandResult {
  band: number; // e.g. 6.5
  label: string; // CEFR-style descriptor
  correct: number;
  total: number;
  scaled40: number; // raw scaled to a /40 equivalent
  accuracy: number; // 0–100
  tip: string;
}

// score (out of 40) >= threshold  ->  band
const BAND_TABLE: ReadonlyArray<readonly [number, number]> = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [33, 7.5],
  [30, 7.0],
  [27, 6.5],
  [23, 6.0],
  [19, 5.5],
  [15, 5.0],
  [13, 4.5],
  [11, 4.0],
  [8, 3.5],
  [6, 3.0],
  [4, 2.5],
  [0, 2.0],
];

function bandFromScaled(scaled40: number): number {
  for (const [threshold, band] of BAND_TABLE) {
    if (scaled40 >= threshold) return band;
  }
  return 2.0;
}

function bandLabel(band: number): string {
  if (band >= 9) return "Expert user";
  if (band >= 8) return "Very good user";
  if (band >= 7) return "Good user";
  if (band >= 6) return "Competent user";
  if (band >= 5) return "Modest user";
  if (band >= 4) return "Limited user";
  if (band >= 3) return "Extremely limited user";
  return "Intermittent user";
}

function bandTip(accuracy: number): string {
  if (accuracy >= 90)
    return "Excellent listening accuracy. Keep practising under timed conditions to stay sharp.";
  if (accuracy >= 70)
    return "Strong result. Re-listen to the questions you missed and check spelling and word limits.";
  if (accuracy >= 50)
    return "Solid base. Focus on note-completion timing and catching numbers, dates, and names.";
  return "Keep going. Replay the recording with the transcript and practise predicting answers before they are said.";
}

export function estimateBand(correct: number, total: number): BandResult {
  const safeTotal = Math.max(1, total);
  const scaled40 = Math.round((correct / safeTotal) * 40);
  const band = bandFromScaled(scaled40);
  const accuracy = Math.round((correct / safeTotal) * 100);
  return {
    band,
    label: bandLabel(band),
    correct,
    total,
    scaled40,
    accuracy,
    tip: bandTip(accuracy),
  };
}
