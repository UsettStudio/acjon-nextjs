"use client";
import { useState, useCallback, useRef } from "react";
import { useClickAway } from "react-use";

/* ---------------- Types ---------------- */

export type NiceSelectOption = {
  value: string | number;
  text: string;
};

type NiceSelectProps = {
  options: NiceSelectOption[];
  defaultCurrent?: number;
  placeholder?: string;
  className?: string;
  name?: string;
  onChange: (item: NiceSelectOption, name?: string) => void;
};

const NiceSelect: React.FC<NiceSelectProps> = ({
  options,
  defaultCurrent = 0,
  placeholder = "Sort by",
  className = "",
  onChange,
  name,
}) => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<NiceSelectOption | null>(
    options[defaultCurrent] ?? null
  );

  const ref = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useClickAway(ref, close);

  const selectHandler = (item: NiceSelectOption) => {
    setCurrent(item);
    onChange(item, name);
    close();
  };

  return (
    <div
      ref={ref}
      className="custom-select"
    >
      {/* Selected */}
      <div
        className={`selected ${open ? "open" : ""} ${className}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {current?.text || placeholder}
        <span className="arrow"></span>
      </div>

      {/* Options */}
      {open && (
        <ul
          className="options"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map((item) => (
            <li
              key={item.value}
              data-value={item.value}
              className={item.value === current?.value ? "active" : ""}
              onMouseDown={() => selectHandler(item)}
            >
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default NiceSelect;