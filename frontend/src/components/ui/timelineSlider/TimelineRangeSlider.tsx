import { useCallback, useMemo, useRef } from "react";
import { cn } from "../../../util";
import { type TimelineMark, mergeTimelineMarks } from "./timelineMark";
import {
  MarkLabelsRow,
  SliderHandle,
  TrackDot,
  clamp,
  defaultFormatValueForA11y,
  indexPosition,
  useHandleDrag,
  useLatestRef,
  useTrackClick,
  valuePosition,
} from "./timelineSliderParts";

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

export const TimelineRangeSlider = ({
  marks: rawMarks,
  value,
  onValueChange,
  fromLabel = "From",
  toLabel = "To",
  formatValueForA11y = defaultFormatValueForA11y,
  className,
}: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const marks = useMemo(() => mergeTimelineMarks(rawMarks), [rawMarks]);
  const [from, to] = value;

  const valueRef = useLatestRef(value);
  const marksRef = useLatestRef(marks);
  const onValueChangeRef = useLatestRef(onValueChange);

  const fromPos = valuePosition(from, marks);
  const toPos = valuePosition(to, marks);

  // Move a handle to the mark at `desiredIndex`. Does nothing if the
  // resulting value is the same as the handle's current value, to avoid
  // spurious no-op updates (which could otherwise cause lossy
  // re-formatting of the underlying value in a consuming component).
  const applyChange = useCallback(
    (handle: Handle, desiredIndex: number) => {
      const currentMarks = marksRef.current;
      if (currentMarks.length === 0) return;
      const [currentFrom, currentTo] = valueRef.current;
      const boundary = handle === "from" ? currentTo : currentFrom;
      const currentValue = handle === "from" ? currentFrom : currentTo;

      const clampedIndex = clamp(desiredIndex, 0, currentMarks.length - 1);
      const index = findValidIndex(
        handle,
        clampedIndex,
        currentMarks,
        boundary,
      );
      const newValue = currentMarks[index].value;

      const isValid =
        handle === "from" ? newValue < boundary : newValue > boundary;
      if (!isValid || newValue === currentValue) return;

      onValueChangeRef.current(
        handle === "from" ? [newValue, currentTo] : [currentFrom, newValue],
      );
    },
    [marksRef, valueRef, onValueChangeRef],
  );

  const startDrag = useHandleDrag<Handle>(trackRef, marksRef, applyChange);

  // Clicking the track moves whichever handle is closest to the click.
  const handleTrackClick = useTrackClick(trackRef, marksRef, (index) => {
    const target = marksRef.current[index]?.value;
    if (target === undefined) return;
    const [currentFrom, currentTo] = valueRef.current;
    applyChange(
      Math.abs(target - currentFrom) <= Math.abs(target - currentTo)
        ? "from"
        : "to",
      index,
    );
  });

  return (
    <div className={cn("w-full pt-2", className)}>
      <div
        ref={trackRef}
        className="relative h-8 w-full cursor-pointer touch-none"
        onPointerDown={handleTrackClick}
      >
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
        <SliderHandle
          label={fromLabel}
          position={fromPos}
          valueMin={marks[0]?.value}
          valueMax={marks[marks.length - 1]?.value}
          valueNow={from}
          valueText={formatValueForA11y(from)}
          onPointerDown={startDrag("from")}
        />
        <SliderHandle
          label={toLabel}
          position={toPos}
          valueMin={marks[0]?.value}
          valueMax={marks[marks.length - 1]?.value}
          valueNow={to}
          valueText={formatValueForA11y(to)}
          onPointerDown={startDrag("to")}
        />
      </div>
      <MarkLabelsRow marks={marks} />
    </div>
  );
};
