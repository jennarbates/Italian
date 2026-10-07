import { useRef, type PointerEvent } from "react";

// A long press opens something; a short tap still clicks. After a long press the
// click that follows is swallowed, so it does not also flip the card.
export function useLongPress(onLongPress: () => void, ms = 450) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const start = useRef<{ x: number; y: number } | undefined>(undefined);
  const fired = useRef(false);

  const cancel = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };

  return {
    onPointerDown(e: PointerEvent) {
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      cancel();
      timer.current = setTimeout(() => {
        fired.current = true;
        onLongPress();
      }, ms);
    },
    onPointerMove(e: PointerEvent) {
      // A scroll or drag is not a press.
      const s = start.current;
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) cancel();
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu(e: { preventDefault: () => void }) {
      e.preventDefault();
    },
    // Call at the top of onClick: true means this click ends a long press.
    consumeLongPress(): boolean {
      const was = fired.current;
      fired.current = false;
      return was;
    },
  };
}
