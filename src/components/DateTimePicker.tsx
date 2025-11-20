import React, { useState, useRef, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface DateTimePickerProps {
  type: "date" | "time";
  value: string;
  onChange: (value: string) => void;
  label: string;
  minDate?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  type,
  value,
  onChange,
  label,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (type === "date") {
    return (
      <DatePicker
        value={value}
        onChange={onChange}
        label={label}
        minDate={minDate}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        dropdownRef={dropdownRef}
      />
    );
  }

  return (
    <TimePicker
      value={value}
      onChange={onChange}
      label={label}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      dropdownRef={dropdownRef}
    />
  );
};

// DATE PICKER COMPONENT
interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  minDate?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  isOpen,
  setIsOpen,
  dropdownRef,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    } else {
      setCurrentMonth(new Date());
    }
  }, [value]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const selectDate = (day: number) => {
    // Fix timezone issue - create date string manually
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const formattedDate = `${year}-${month}-${dayStr}`;

    // Check if date is before minDate
    if (minDate && formattedDate < minDate) {
      return;
    }

    onChange(formattedDate);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const formattedDate = `${year}-${month}-${dayStr}`;
    return formattedDate < minDate;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    // Parse date string properly to avoid timezone issues
    const [year, month, dayVal] = value.split("-").map(Number);
    return (
      day === dayVal &&
      currentMonth.getMonth() === month - 1 &&
      currentMonth.getFullYear() === year
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select date";
    // Parse manually to avoid timezone issues
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <button
        key={day}
        type="button"
        onClick={() => selectDate(day)}
        disabled={isDateDisabled(day)}
        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
          isSelected(day)
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : isToday(day)
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
            : isDateDisabled(day)
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white hover:border-gray-400 flex items-center gap-3 text-left"
      >
        <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
          {formatDisplayDate(value)}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              <h3 className="font-bold text-gray-900">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaChevronRight className="text-gray-600" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">{days}</div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  onChange(today);
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// TIME PICKER COMPONENT
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  isOpen,
  setIsOpen,
  dropdownRef,
}) => {
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      let hourNum = parseInt(h);
      const newPeriod = hourNum >= 12 ? "PM" : "AM";

      if (hourNum === 0) hourNum = 12;
      else if (hourNum > 12) hourNum -= 12;

      setHour(hourNum.toString().padStart(2, "0"));
      setMinute(m);
      setPeriod(newPeriod);
    }
  }, [value]);

  const applyTime = () => {
    let hourNum = parseInt(hour);

    if (period === "PM" && hourNum !== 12) {
      hourNum += 12;
    } else if (period === "AM" && hourNum === 12) {
      hourNum = 0;
    }

    const timeString = `${hourNum.toString().padStart(2, "0")}:${minute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "Select time";
    const [h, m] = timeStr.split(":");
    let hourNum = parseInt(h);
    const periodStr = hourNum >= 12 ? "PM" : "AM";

    if (hourNum === 0) hourNum = 12;
    else if (hourNum > 12) hourNum -= 12;

    return `${hourNum}:${m} ${periodStr}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white hover:border-gray-400 flex items-center gap-3 text-left"
      >
        <FaClock className="text-gray-400 flex-shrink-0" />
        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
          {formatDisplayTime(value)}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4"
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Hour */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block text-center">
                  Hour
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHour(h)}
                      className={`w-full py-2 text-sm font-medium transition-colors ${
                        hour === h
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block text-center">
                  Minute
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinute(m)}
                      className={`w-full py-2 text-sm font-medium transition-colors ${
                        minute === m
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block text-center">
                  Period
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPeriod("AM")}
                    className={`w-full py-3 text-sm font-bold rounded-lg transition-colors ${
                      period === "AM"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("PM")}
                    className={`w-full py-3 text-sm font-bold rounded-lg transition-colors ${
                      period === "PM"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={applyTime}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
