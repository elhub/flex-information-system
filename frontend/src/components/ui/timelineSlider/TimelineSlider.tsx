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

type Props = {
  marks: TimelineMark[];
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
  formatValueForA11y?: (value: number) => string;
  className?: string;
};

export const TimelineSlider = ({
  marks: rawMarks,
  value,
  onValueChange,
  label = "SELECTED",
  formatValueForA11y = defaultFormatValueForA11y,
  className,
}: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const marks = useMemo(() => mergeTimelineMarks(rawMarks), [rawMarks]);

  const valueRef = useLatestRef(value);
  const marksRef = useLatestRef(marks);
  const onValueChangeRef = useLatestRef(onValueChange);

  const currentPos = valuePosition(value, marks);

  // Move the handle to the mark at `desiredIndex`. Does nothing if the
  // value is unchanged, to avoid spurious no-op updates.
  const applyChange = useCallback(
    (desiredIndex: number) => {
      const currentMarks = marksRef.current;
      if (currentMarks.length === 0) return;
      const index = clamp(desiredIndex, 0, currentMarks.length - 1);
      const newValue = currentMarks[index].value;
      if (newValue === valueRef.current) return;
      onValueChangeRef.current(newValue);
    },
    [marksRef, valueRef, onValueChangeRef],
  );

  const startDrag = useHandleDrag<void>(trackRef, marksRef, (_, index) =>
    applyChange(index),
  );
  const handleTrackClick = useTrackClick(trackRef, marksRef, applyChange);

  return (
    <div className={cn("w-full pt-2", className)}>
      <div
        ref={trackRef}
        className="relative h-8 w-full cursor-pointer touch-none"
        onPointerDown={handleTrackClick}
      >
        {/* Base track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-semantic-border" />
        {marks.map((mark, index) => (
          <TrackDot
            key={`${index}-${mark.value}`}
            position={indexPosition(index, marks.length)}
            active={mark.value === value}
          />
        ))}
        <SliderHandle
          label={label}
          position={currentPos}
          valueMin={marks[0]?.value}
          valueMax={marks[marks.length - 1]?.value}
          valueNow={value}
          valueText={formatValueForA11y(value)}
          onPointerDown={startDrag()}
        />
      </div>
      <MarkLabelsRow marks={marks} />
    </div>
  );
};
