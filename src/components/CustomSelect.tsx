import React from "react";
import { MdKeyboardArrowDown, MdCheck } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  prefix?: React.ReactNode; // optional left icon/emoji
  menuClassName?: string;
  // where to render the menu relative to the button
  // bottom: dropdown appears below (default)
  // top: dropdown appears above
  menuPlacement?: "bottom" | "top";
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  className = "",
  placeholder = "Select",
  disabled = false,
  prefix,
  menuClassName = "",
  menuPlacement = "bottom",
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseBtn = `relative w-full min-w-0 max-w-full shrink select-none border border-slate-300 rounded-xl px-4 py-3 bg-white text-gray-900 flex items-center justify-between  transition-all ${
    disabled
      ? "opacity-60 cursor-not-allowed"
      : "cursor-pointer hover:shadow-md focus-within:ring-none focus-within:ring-black/60"
  }`;

  return (
    <div ref={ref} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        className={baseBtn}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 truncate">
          {prefix ? <span className="shrink-0">{prefix}</span> : null}
          <span
            className={`truncate ${
              selected ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-gray-500"
        >
          <MdKeyboardArrowDown className="w-5 h-5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: menuPlacement === "top" ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: menuPlacement === "top" ? 6 : -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow overflow-hidden ${
              menuPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2"
            } ${menuClassName}`}
          >
            <div className="max-h-64 overflow-auto">
              {options.map((opt) => {
                const isActive = String(opt.value) === String(value);
                return (
                  <button
                    type="button"
                    key={String(opt.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                      isActive
                        ? "bg-black/10"
                        : "hover:bg-gray-50 text-gray-900"
                    }`}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isActive && <MdCheck className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
