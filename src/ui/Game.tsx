import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { content } from "../content/index.ts";
import { questionByKey, type Fill, type GameState, type Level } from "../engine/index.ts";
import { useGameStore } from "../store/gameStore.ts";
import { Face } from "./Face.tsx";
import { Board } from "./game/Board.tsx";
import { CardDetail } from "./game/CardDetail.tsx";
import { CpuQuestion } from "./game/CpuQuestion.tsx";
import { FeedbackText } from "./game/FeedbackText.tsx";
import { GuessConfirm } from "./game/GuessConfirm.tsx";
import { QuestionPicker } from "./game/QuestionPicker.tsx";
import { Sheet } from "./game/Sheet.tsx";
import { TileBuilder } from "./game/TileBuilder.tsx";
import { TopBar } from "./game/TopBar.tsx";

const byId = new Map(content.characters.map((c) => [c.id, c]));

const primary =
  "min-h-12 flex-1 rounded-xl bg-stone-900 px-4 font-semibold text-white active:bg-stone-700";
const secondary = "min-h-12 flex-1 rounded-xl bg-stone-200 px-4 font-semibold active:bg-stone-300";

export function Game() {
  const { status, game, start, dispatch } = useGameStore();
  const [params] = useSearchParams();
  const [zoomed, setZoomed] = useState<string>();
  const [guessFor, setGuessFor] = useState<string>();

  // /play with no round in progress starts one (at ?level=, default 1). ?seed= is
  // for tests that need a known game.
  useEffect(() => {
    if (status !== "ready" || game) return;
    const level: Level = params.get("level") === "2" ? 2 : 1;
    const seed = params.get("seed");
    start(level, seed !== null && /^\d+$/.test(seed) ? Number(seed) : undefined);
  }, [status, game, params, start]);

  // Open the sheet when there is something to do in it; fold it away when the
  // board is what matters (flipping cards after an answer). Each new phase resets
  // the sheet and cancels a half-made guess.
  const phase = game?.phase;
  const wrongAnswer = phase === "cpuReview" && !!game?.lastFeedback?.length;
  const phaseKey = `${phase}|${game?.turn}|${wrongAnswer}`;
  const [ui, setUi] = useState({ phaseKey: "", sheetOpen: true, guessing: false });
  if (ui.phaseKey !== phaseKey) {
    setUi({
      phaseKey,
      sheetOpen: phase === "playerTurn" || phase === "cpuTurn" || phase === "over" || wrongAnswer,
      guessing: false,
    });
  }
  const { sheetOpen, guessing } = ui;
  const setSheetOpen = (open: boolean) => setUi((u) => ({ ...u, sheetOpen: open }));
  const setGuessing = (on: boolean) => setUi((u) => ({ ...u, guessing: on }));

  if (status !== "ready" || !game) return <SkeletonBoard />;
  const secret = byId.get(game.playerSecret);
  if (!secret) return <SkeletonBoard />;

  const { summary, body, actions } = sheetFor(game, {
    guessing,
    ask: (q) => dispatch({ type: "ASK", templateId: q.templateId, fill: q.fill }),
    askTiles: (templateId, fill) => dispatch({ type: "ASK", templateId, fill }),
    answer: (value, hintShown) => dispatch({ type: "ANSWER", value, hintShown }),
    next: () => dispatch({ type: "END_TURN" }),
    startGuess: () => {
      setGuessing(true);
      setSheetOpen(false);
    },
    cancelGuess: () => setGuessing(false),
    playAgain: () => start(game.level),
  });

  return (
    <div className="flex h-dvh flex-col">
      <TopBar game={game} secret={secret} />
      {/* Room for the collapsed sheet, so the open sheet overlays the board instead of shrinking it. */}
      <div className="flex min-h-0 flex-1 flex-col pb-[7.5rem]">
        <Board
          characters={content.characters}
          flipped={game.flipped}
          guessing={guessing}
          onTap={(id) => (guessing ? setGuessFor(id) : dispatch({ type: "FLIP", characterId: id }))}
          onZoom={setZoomed}
          onUnflipAll={() => {
            for (const id of game.flipped) dispatch({ type: "FLIP", characterId: id });
          }}
        />
      </div>
      <Sheet
        summary={summary}
        open={sheetOpen}
        onToggle={() => setSheetOpen(!sheetOpen)}
        actions={actions}
      >
        {body}
      </Sheet>
      <CardDetail
        character={zoomed ? byId.get(zoomed) : undefined}
        onClose={() => setZoomed(undefined)}
      />
      <GuessConfirm
        character={guessFor ? byId.get(guessFor) : undefined}
        flipped={!!guessFor && game.flipped.includes(guessFor)}
        onCancel={() => setGuessFor(undefined)}
        onConfirm={() => {
          if (guessFor) dispatch({ type: "GUESS", characterId: guessFor });
          setGuessFor(undefined);
          setGuessing(false);
        }}
      />
    </div>
  );
}

type Handlers = {
  guessing: boolean;
  ask: (q: NonNullable<ReturnType<typeof questionByKey>>) => void;
  askTiles: (templateId: string, fill: Fill) => void;
  answer: (value: boolean, hintShown: boolean) => void;
  next: () => void;
  startGuess: () => void;
  cancelGuess: () => void;
  playAgain: () => void;
};

// What the sheet shows in each phase: a one-line summary, the body, and the
// buttons that stay in reach even when it is folded.
function sheetFor(
  game: GameState,
  h: Handlers,
): { summary: ReactNode; body: ReactNode; actions?: ReactNode } {
  const last = game.history.at(-1);
  const avanti = (
    <button type="button" onClick={h.next} className={primary}>
      Avanti
    </button>
  );

  switch (game.phase) {
    case "setup":
    case "playerTurn": {
      if (h.guessing) {
        return {
          summary: <strong>Tap the card you think it is.</strong>,
          body: null,
          actions: (
            <button type="button" onClick={h.cancelGuess} className={secondary}>
              Cancel guess
            </button>
          ),
        };
      }
      return {
        summary: game.lastFeedback ? "Try again." : "Your turn: ask a question, or guess.",
        body: (
          <div className="flex flex-col gap-2 pt-1">
            <FeedbackText feedback={game.lastFeedback} />
            {game.level === 1 ? (
              <QuestionPicker history={game.history} onAsk={h.ask} />
            ) : (
              <TileBuilder key={game.turn} onAsk={h.askTiles} />
            )}
          </div>
        ),
        actions: (
          <button type="button" onClick={h.startGuess} className={secondary}>
            Indovina
          </button>
        ),
      };
    }
    case "playerReview":
      return {
        summary: <strong lang="it">{last?.answerText}</strong>,
        body: (
          <div className="flex flex-col gap-2 py-3">
            <p lang="it" className="text-stone-500">
              {last?.text}
            </p>
            <p lang="it" className="text-xl font-semibold">
              {last?.answerText}
            </p>
            <FeedbackText feedback={game.lastFeedback} tone="info" />
            <p className="text-sm text-stone-500">
              Flip down everyone this rules out, then tap Avanti.
            </p>
          </div>
        ),
        actions: avanti,
      };
    case "cpuTurn": {
      const q = game.pendingCpuQuestion
        ? questionByKey(content, game.pendingCpuQuestion)
        : undefined;
      return {
        summary: <span lang="it">{q?.text}</span>,
        body: q ? (
          <CpuQuestion key={q.key} question={q} level={game.level} onAnswer={h.answer} />
        ) : null,
      };
    }
    case "cpuReview": {
      const right = !game.lastFeedback?.length;
      return {
        summary: (
          <span>
            {right ? "✓ " : "✗ "}
            <span lang="it">{last?.answerText}</span>
          </span>
        ),
        body: (
          <div className="flex flex-col gap-2 py-3">
            {right && <p className="font-semibold">Right!</p>}
            <FeedbackText feedback={game.lastFeedback} />
          </div>
        ),
        actions: avanti,
      };
    }
    case "over": {
      const cpu = byId.get(game.cpuSecret);
      const won = game.result === "won";
      return {
        summary: <strong>{won ? "You won!" : "You lost."}</strong>,
        body: (
          <div className="flex items-center gap-3 py-3">
            {cpu && <Face character={cpu} label={cpu.name} className="w-16 rounded-lg" />}
            <p>
              {won ? "You found" : "The computer's card was"} <strong>{cpu?.name}</strong>.
            </p>
          </div>
        ),
        actions: (
          <button type="button" onClick={h.playAgain} className={primary}>
            Play again
          </button>
        ),
      };
    }
  }
}

// Spec 8.2: loading shows the board's shape, so nothing jumps when it arrives.
function SkeletonBoard() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true" aria-label="Loading">
      <div className="h-14 shrink-0 border-b border-stone-200 bg-white" />
      <div className="grid flex-1 grid-cols-4 gap-1 p-2 pb-32">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-md bg-stone-200 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
