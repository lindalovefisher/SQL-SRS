import type { Lesson } from "../../content/types";

export function buildTutorChunks(lesson: Lesson): string[] {
  const chunks: string[] = [];

  chunks.push(`Hi! Today we're learning: ${lesson.title}. ${lesson.summary}.`);
  chunks.push(`Concept: ${lesson.concept}`);

  // Read syntax more naturally
  const syntaxSpoken = lesson.syntax.replaceAll("\n", " ");
  chunks.push(`Syntax. Here's the pattern: ${syntaxSpoken}`);

  if (lesson.examples?.length) {
    const ex1 = lesson.examples[0].replaceAll("\n", " ");
    chunks.push(`Example. ${ex1}`);
  }

  // Tie into practice: this is your big “teaching” advantage
  if (lesson.practice?.length) {
    chunks.push(`Now let's try one. ${lesson.practice[0].prompt}`);
  } else {
    chunks.push(`Quick check: What does WHERE filter — rows, or groups?`);
  }

  chunks.push(`Ask me a question anytime, or tell me to quiz you.`);
  return chunks;
}
