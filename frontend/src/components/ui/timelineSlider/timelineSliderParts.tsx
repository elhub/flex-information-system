import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { cn } from "../../../util";
import type { TimelineMark } from "./timelineMark";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Position (0-100) of a mark index along an evenly-spaced track.
export const indexPosition = (index: number, count: number) =>
  count <= 1 ? 0 : (index / (count - 1)) * 100;

// Position (0-100) of an arbitrary value, interpolated between the two
// marks it falls between (marks themselves stay evenly spaced).
export const valuePosition = (value: number, marks: TimelineMark[]) => {
  if (marks.length === 0) return 0;
  if (value <= marks[0].value) return 0;
  const lastIndex = marks.length - 1;
  if (value >= marks[lastIndex].value) return 100;

  for (let i = 0; i < lastIndex; i++) {
    const current = marks[i];
    const next = marks[i + 1];
    if (value >= current.value && value <= next.value) {
      const span = next.value - current.value;
      const fraction = span === 0 ? 0 : (value - current.value) / span;
      const currentPos = indexPosition(i, marks.length);
      const nextPos = indexPosition(i + 1, marks.length);
      return currentPos + fraction * (nextPos - currentPos);
    }
  }
  return 0;
};

// Index of the mark closest to a raw fraction (0-1) along the track.
const nearestMarkIndex = (fraction: number, count: number) =>
  clamp(Math.round(fraction * (count - 1)), 0, count - 1);

// Fallback for screen readers when the caller doesn't supply a formatter.
export const defaultFormatValueForA11y = (value: number) =>
  new Date(value).toLocaleString();

// Keeps a ref pointing at the latest value, so handlers that live for the
// duration of a pointer gesture never act on stale data, regardless of how
// many re-renders happen mid-drag.
export const useLatestRef = <T,>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};

const useMarkIndexAtClientX = (
  trackRef: RefObject<HTMLDivElement | null>,
  marksRef: RefObject<TimelineMark[]>,
) =>
  useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      const currentMarks = marksRef.current;
      if (!track || currentMarks.length === 0) return undefined;
      const rect = track.getBoundingClientRect();
      const fraction = clamp((clientX - rect.left) / rect.width, 0, 1);
      return nearestMarkIndex(fraction, currentMarks.length);
    },
    [trackRef, marksRef],
  );

// Wires up pointer-capture based dragging for the handles: translates
// pointer position to a mark index and reports it via `onDragToIndex`.
// Kept separate from rendering so the drag mechanics can be reasoned
// about (and reused) independently of the component's markup.
export const useHandleDrag = <H,>(
  trackRef: RefObject<HTMLDivElement | null>,
  marksRef: RefObject<TimelineMark[]>,
  onDragToIndex: (handle: H, index: number) => void,
) => {
  const markIndexAtClientX = useMarkIndexAtClientX(trackRef, marksRef);

  return useCallback(
    (handle: H) => (e: ReactPointerEvent) => {
      e.preventDefault();
      // Don't let the track treat a handle press as a click on the track.
      e.stopPropagation();
      const target = e.currentTarget;
      const pointerId = e.pointerId;
      target.setPointerCapture(pointerId);

      const handleMove = (moveEvent: Event) => {
        const { clientX } = moveEvent as PointerEvent;
        const index = markIndexAtClientX(clientX);
        if (index !== undefined) onDragToIndex(handle, index);
      };
      const handleUp = () => {
        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId);
        }
        target.removeEventListener("pointermove", handleMove);
        target.removeEventListener("pointerup", handleUp);
        target.removeEventListener("pointercancel", handleUp);
      };
      target.addEventListener("pointermove", handleMove);
      target.addEventListener("pointerup", handleUp);
      target.addEventListener("pointercancel", handleUp);
    },
    [markIndexAtClientX, onDragToIndex],
  );
};

// Pointer-down handler for the track itself: reports the mark index that
// was clicked, so a slider can jump its (nearest) handle there.
export const useTrackClick = (
  trackRef: RefObject<HTMLDivElement | null>,
  marksRef: RefObject<TimelineMark[]>,
  onClickIndex: (index: number) => void,
) => {
  const markIndexAtClientX = useMarkIndexAtClientX(trackRef, marksRef);

  return useCallback(
    (e: ReactPointerEvent) => {
      const index = markIndexAtClientX(e.clientX);
      if (index !== undefined) onClickIndex(index);
    },
    [markIndexAtClientX, onClickIndex],
  );
};

export const TrackDot = ({
  position,
  active,
}: {
  position: number;
  active: boolean;
}) => (
  <div
    className={cn(
      "absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-semantic-background",
      active ? "bg-semantic-background-action-primary" : "bg-semantic-border",
    )}
    style={{ left: `${position}%` }}
  />
);

const MarkLabel = ({
  mark,
  position,
  isFirst,
  isLast,
  maxWidth,
}: {
  mark: TimelineMark;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  maxWidth: string;
}) => {
  const alignment = isFirst
    ? "left-0 items-start text-left"
    : isLast
      ? "right-0 items-end text-right"
      : "-translate-x-1/2 items-center text-center";
  return (
    <div
      className={cn("absolute flex flex-col text-xs", alignment)}
      style={{
        ...(isFirst || isLast ? undefined : { left: `${position}%` }),
        maxWidth,
      }}
    >
      <span className="font-semibold text-semantic-text">{mark.label}</span>
      {mark.sublabel && (
        <span className="text-semantic-text-subtle">{mark.sublabel}</span>
      )}
    </div>
  );
};

export const MarkLabelsRow = ({ marks }: { marks: TimelineMark[] }) => (
  <div className="relative mt-1 h-16 w-full">
    {marks.map((mark, index) => (
      <MarkLabel
        key={`${index}-${mark.value}`}
        mark={mark}
        position={indexPosition(index, marks.length)}
        isFirst={index === 0}
        isLast={index === marks.length - 1}
        maxWidth={`${100 / marks.length}%`}
      />
    ))}
  </div>
);

export const SliderHandle = ({
  label,
  position,
  valueMin,
  valueMax,
  valueNow,
  valueText,
  onPointerDown,
}: {
  label: string;
  position: number;
  valueMin: number | undefined;
  valueMax: number | undefined;
  valueNow: number;
  valueText: string | undefined;
  onPointerDown: (e: ReactPointerEvent) => void;
}) => (
  <div
    role="slider"
    tabIndex={0}
    aria-label={label}
    aria-valuemin={valueMin}
    aria-valuemax={valueMax}
    aria-valuenow={valueNow}
    aria-valuetext={valueText}
    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 touch-none cursor-grab p-2"
    style={{ left: `${position}%` }}
    onPointerDown={onPointerDown}
  >
    <div className="flex flex-col items-center gap-1">
      <span className="rounded bg-semantic-background-action-primary px-1.5 py-0.5 text-xs font-semibold text-semantic-text-inverted uppercase">
        {label}
      </span>
      <span className="block h-4 w-4 rounded-full border-2 border-semantic-background-action-primary bg-semantic-background shadow" />
    </div>
  </div>
);
