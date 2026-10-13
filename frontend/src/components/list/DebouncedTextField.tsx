import { useEffect, useState } from "react";
import { TextField } from "../ui";

// Avoid one backend request per keystroke.
export const DebouncedTextField = ({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [text, setText] = useState(value);

  // follow external changes, e.g. reset to default filters
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onChange(text), 400);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <TextField id={id} value={text} onChange={(e) => setText(e.target.value)} />
  );
};
