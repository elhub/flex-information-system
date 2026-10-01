import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { cn } from "../../../util";

export type TimelineMark = {
  value: number;
  label: string;
  sublabel?: string;
};

type Handle = "from" | "to";

type Props = {
  marks: TimelineMark[];
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  fromLabel?: string;
  toLabel?: string;
  formatValueForA11y?: (value: number) => string;
  className?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Position (0-100) of a mark index along an evenly-spaced track.
const indexPosition = (index: number, count: number) =>
  count <= 1 ? 0 : (index / (count - 1)) * 100;

// Position (0-100) of an arbitrary value, interpolated between the two
// marks it falls between (marks themselves stay evenly spaced).
const valuePosition = (value: number, marks: TimelineMark[]) => {
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

// Marks sharing the exact same timestamp are merged into a single mark,
// with their labels joined, so callers don't have to worry about duplicate
// timestamps (e.g. two milestones set at the same instant) producing
// overlapping/indistinguishable marks or duplicate React keys.
export const mergeTimelineMarks = (marks: TimelineMark[]): TimelineMark[] => {
  const byValue = new Map<number, { labels: string[]; sublabel?: string }>();
  for (const mark of marks) {
    const existing = byValue.get(mark.value);
    if (existing) {
      existing.labels.push(mark.label);
    } else {
      byValue.set(mark.value, {
        labels: [mark.label],
        sublabel: mark.sublabel,
      });
    }
  }
  return Array.from(byValue.entries())
    .map(([value, { labels, sublabel }]) => ({
      value,
      label: labels.join(" / "),
      sublabel,
    }))
    .sort((a, b) => a.value - b.value);
};

// Find the nearest valid mark index for `handle`, walking inward from
// `desiredIndex` if needed so its value never ties or crosses `boundary`
// (the other handle's current value).
const findValidIndex = (
  handle: Handle,
  desiredIndex: number,
  marks: TimelineMark[],
  boundary: number,
) => {
  let index = desiredIndex;
  if (handle === "from") {
    while (index > 0 && marks[index].value >= boundary) index--;
  } else {
    while (index < marks.length - 1 && marks[index].value <= boundary) index++;
  }
  return index;
};

// Wires up pointer-capture based dragging for the handles: translates
// pointer position to a mark index and reports it via `onDragToIndex`.
// Kept separate from rendering so the drag mechanics can be reasoned
// about (and reused) independently of the component's markup.
const useHandleDrag = (
  trackRef: RefObject<HTMLDivElement | null>,
  marksRef: RefObject<TimelineMark[]>,
  onDragToIndex: (handle: Handle, index: number) => void,
) => {
  const positionToMarkIndex = useCallback(
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

  return useCallback(
    (handle: Handle) => (e: ReactPointerEvent) => {
      e.preventDefault();
      const target = e.currentTarget;
      const pointerId = e.pointerId;
      target.setPointerCapture(pointerId);

      const handleMove = (moveEvent: Event) => {
        const { clientX } = moveEvent as PointerEvent;
        const index = positionToMarkIndex(clientX);
        if (index !== undefined) onDragToIndex(handle, index);
      };
      const handleUp = () => {
        target.releasePointerCapture(pointerId);
        target.removeEventListener("pointermove", handleMove);
        target.removeEventListener("pointerup", handleUp);
        target.removeEventListener("pointercancel", handleUp);
      };
      target.addEventListener("pointermove", handleMove);
      target.addEventListener("pointerup", handleUp);
      target.addEventListener("pointercancel", handleUp);
    },
    [positionToMarkIndex, onDragToIndex],
  );
};

const TrackDot = ({
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

const Handle = ({
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

export const TimelineRangeSlider = ({
  marks: rawMarks,
  value,
  onValueChange,
  fromLabel = "From",
  toLabel = "To",
  formatValueForA11y,
  className,
}: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const marks = useMemo(() => mergeTimelineMarks(rawMarks), [rawMarks]);
  const [from, to] = value;

  // Keep refs to the latest value/marks/callback so drag handlers (which
  // live for the duration of a pointer gesture) never act on stale data,
  // regardless of how many re-renders happen mid-drag.
  const valueRef = useRef(value);
  const marksRef = useRef(marks);
  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    valueRef.current = value;
    marksRef.current = marks;
    onValueChangeRef.current = onValueChange;
  });

  const fromPos = valuePosition(from, marks);
  const toPos = valuePosition(to, marks);

  // Move a handle to the mark at `desiredIndex`. Does nothing if the
  // resulting value is the same as the handle's current value, to avoid
  // spurious no-op updates (which could otherwise cause lossy
  // re-formatting of the underlying value in a consuming component).
  const applyChange = useCallback((handle: Handle, desiredIndex: number) => {
    const currentMarks = marksRef.current;
    if (currentMarks.length === 0) return;
    const [currentFrom, currentTo] = valueRef.current;
    const boundary = handle === "from" ? currentTo : currentFrom;
    const currentValue = handle === "from" ? currentFrom : currentTo;

    const clampedIndex = clamp(desiredIndex, 0, currentMarks.length - 1);
    const index = findValidIndex(handle, clampedIndex, currentMarks, boundary);
    const newValue = currentMarks[index].value;

    const isValid =
      handle === "from" ? newValue < boundary : newValue > boundary;
    if (!isValid || newValue === currentValue) return;

    onValueChangeRef.current(
      handle === "from" ? [newValue, currentTo] : [currentFrom, newValue],
    );
  }, []);

  const startDrag = useHandleDrag(trackRef, marksRef, applyChange);

  return (
    <div className={cn("w-full pt-2", className)}>
      <div ref={trackRef} className="relative h-8 w-full touch-none">
        {/* Base track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-semantic-border" />
        {/* Active segment between from/to */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-semantic-background-action-primary"
          style={{ left: `${fromPos}%`, right: `${100 - toPos}%` }}
        />
        {marks.map((mark, index) => (
          <TrackDot
            key={`${index}-${mark.value}`}
            position={indexPosition(index, marks.length)}
            active={mark.value >= from && mark.value <= to}
          />
        ))}
        <Handle
          label={fromLabel}
          position={fromPos}
          valueMin={marks[0]?.value}
          valueMax={marks[marks.length - 1]?.value}
          valueNow={from}
          valueText={formatValueForA11y?.(from)}
          onPointerDown={startDrag("from")}
        />
        <Handle
          label={toLabel}
          position={toPos}
          valueMin={marks[0]?.value}
          valueMax={marks[marks.length - 1]?.value}
          valueNow={to}
          valueText={formatValueForA11y?.(to)}
          onPointerDown={startDrag("to")}
        />
      </div>
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
    </div>
  );
};
