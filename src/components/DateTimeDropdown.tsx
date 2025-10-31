import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdKeyboardArrowDown, MdClose } from "react-icons/md";

interface DateTimeDropdownProps {
  label?: string;
  value?: string; // ISO string or empty
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

const toLocalParts = (iso?: string) => {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
};

const toIso = (date: string, time: string) => {
  if (!date) return undefined;
  const iso = new Date(`${date}T${time || "00:00"}:00`).toISOString();
  return iso;
};

const DateTimeDropdown: React.FC<DateTimeDropdownProps> = ({ label, value, onChange, placeholder = "dd/mm/yyyy --:-- --" }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const { date, time } = toLocalParts(value);
  const [d, setD] = React.useState(date);
  const [t, setT] = React.useState(time);

  React.useEffect(() => {
    setD(date);
    setT(time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const display = () => {
    if (!value) return placeholder;
    try {
      return new Date(value).toLocaleString("vi-VN");
    } catch {
      return placeholder;
    }
  };

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`text-left truncate ${value ? "text-gray-900" : "text-gray-500"}`}>{display()}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }} className="text-gray-500">
          <MdKeyboardArrowDown className="w-5 h-5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 mt-2 w-full max-w-[28rem] bg-white border border-black/80 rounded-xl shadow-2xl p-3 left-0"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  value={d}
                  onChange={(e) => setD(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  value={t}
                  onChange={(e) => setT(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                onClick={() => {
                  setD("");
                  setT("");
                  onChange(undefined);
                }}
              >
                <MdClose className="w-4 h-4" /> Clear
              </button>
              <div className="space-x-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    const now = new Date();
                    const pad = (n: number) => String(n).padStart(2, "0");
                    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
                    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
                    setD(date);
                    setT(time);
                  }}
                >Now</button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-black"
                  onClick={() => {
                    const iso = toIso(d, t);
                    onChange(iso);
                    setOpen(false);
                  }}
                  disabled={!d}
                >Apply</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateTimeDropdown;


