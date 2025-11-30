import { STANDARD_PROMPTS } from './constants';

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  uk: 'Ukrainian',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  nl: 'Dutch',
  tr: 'Turkish',
  vi: 'Vietnamese',
  pl: 'Polish',
  cs: 'Czech',
  sk: 'Slovak',
  ro: 'Romanian',
  hu: 'Hungarian',
  sv: 'Swedish',
  no: 'Norwegian',
  fi: 'Finnish',
  da: 'Danish',
  el: 'Greek',
  he: 'Hebrew',
  ar: 'Arabic',
  hi: 'Hindi',
  th: 'Thai',
  ka: 'Georgian',
  hy: 'Armenian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};
function labelFor(tag: string) {
  return LANG_LABELS[tag] || 'English';
}

export function buildSystemPrompt({
  type,
  formulaPrompt,
  userLanguage,
}: {
  type: 'profiling';
  formulaPrompt: string;
  userLanguage: string;
}): string {
  const standardPrompt = STANDARD_PROMPTS[type];
  if (!standardPrompt) {
    throw new Error(`Unknown prompt type: ${type}`);
  }

  return [
    `INSTRUCTION:`,
    `- Always answer strictly in ${labelFor(userLanguage)} (BCP-47: ${userLanguage}).`,
    `- Do not answer in any other language.`,
    `- Even if previous context or formula is in Russian, ignore that and answer only in ${labelFor(userLanguage)}.`,
    ``,
    `--- START OF FORMULA ---`,
    formulaPrompt,
    `--- END OF FORMULA ---`,
    ``,
    `--- START OF INSTRUCTIONS ---`,
    standardPrompt.trim(),
    `--- END OF INSTRUCTIONS ---`,
  ]
    .join('\n\n')
    .trim();
}
