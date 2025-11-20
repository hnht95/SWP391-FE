import React, { useEffect, useRef, useState } from "react";
import { MdExpandMore } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";

interface DropdownOption {
  label: string;
  value: string | number;
  description?: string;
}

interface DropdownSelectProps {
  value?: string | number | null;
  placeholder?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  leadingIcon?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  compact?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  value,
  placeholder = "Select an option",
  options,
  onChange,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  leadingIcon,
  disabled = false,
  error = false,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const normalizedValue =
    value === undefined || value === null ? "" : String(value);
  const selectedOption = options.find(
    (option) => String(option.value) === normalizedValue
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(target) &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  const baseButtonStyles =
    "w-full rounded-xl border text-left transition-all relative";
  const paddingStyles = leadingIcon
    ? "pl-11 pr-10"
    : compact
    ? "px-3 pr-9"
    : "px-4 pr-10";
  const paddingVertical = compact ? "py-1.5" : "py-2.5";
  const stateStyles = error
    ? "border-red-300 bg-red-50/60 focus:ring-2 focus:ring-red-300/30"
    : open
    ? "border-blue-400 bg-white shadow ring-2 ring-blue-500/20"
    : "border-gray-200 bg-gray-50/70 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15";
  const disabledStyles = disabled ? "opacity-60 cursor-not-allowed" : "";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`${baseButtonStyles} ${paddingStyles} ${paddingVertical} ${stateStyles} ${disabledStyles} ${buttonClassName}`}
      >
        {leadingIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leadingIcon}
          </span>
        )}
        <span
          className={`block truncate text-sm ${
            selectedOption ? "text-gray-800" : "text-gray-500"
          }`}
        >
          {selectedOption?.label || placeholder}
        </span>
        <MdExpandMore
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
            open ? "rotate-180 text-blue-500" : ""
          } ${menuClassName}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 mt-2 z-40"
          >
            <div className="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
              {options.map((option) => {
                const isActive = String(option.value) === normalizedValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(String(option.value));
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block truncate">{option.label}</span>
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

export type { DropdownOption };
export default DropdownSelect;

