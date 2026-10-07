import { useState } from "react";
import type { Question } from "../../engine/index.ts";
import { hintFor } from "./hints.ts";

// Spec 2 and 8.1: the CPU's question with Sì and No. At Level 1 a hint shows the
// English; showing it means the answer is not rated (spec 6).
export function CpuQuestion({
  question,
  level,
  onAnswer,
}: {
  question: Question;
  level: 1 | 2;
  onAnswer: (value: boolean, hintShown: boolean) => void;
}) {
  const [hintShown, setHintShown] = useState(false);
  return (
    <div className="flex flex-col gap-3 py-3">
      <p className="text-sm text-stone-500">The computer asks about your card:</p>
      <p lang="it" className="text-2xl font-semibold">
        {question.text}
      </p>
      {level === 1 &&
        (hintShown ? (
          <p className="text-stone-600">{hintFor(question)}</p>
        ) : (
          <button
            type="button"
            onClick={() => setHintShown(true)}
            className="inline-flex min-h-11 items-center self-start text-sm text-blue-700 underline"
          >
            Show hint
          </button>
        ))}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onAnswer(true, hintShown)}
          className="min-h-14 rounded-xl bg-emerald-600 text-xl font-semibold text-white active:bg-emerald-700"
        >
          Sì
        </button>
        <button
          type="button"
          onClick={() => onAnswer(false, hintShown)}
          className="min-h-14 rounded-xl bg-rose-600 text-xl font-semibold text-white active:bg-rose-700"
        >
          No
        </button>
      </div>
    </div>
  );
}
