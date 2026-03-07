import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const ClockPicker = ({ value, onChange, label }) => {
  const [mode, setMode] = useState("hours"); // 'hours' or 'minutes'
  const [tempHour, setTempHour] = useState(12);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAmPm, setTempAmPm] = useState("AM");

  useEffect(() => {
    if (value) {
      const [hStr, mStr] = value.split(":");
      let h = parseInt(hStr);
      const m = parseInt(mStr);
      const ampm = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      setTempHour(h);
      setTempMinute(m);
      setTempAmPm(ampm);
    }
  }, [value]);

  const handleSelect = (val) => {
    if (mode === "hours") {
      setTempHour(val);
      setMode("minutes");
    } else {
      setTempMinute(val);
      commitChange(tempHour, val, tempAmPm);
    }
  };

  const commitChange = (h, m, ampm) => {
    let finalH = h;
    if (ampm === "PM" && h < 12) finalH += 12;
    if (ampm === "AM" && h === 12) finalH = 0;
    const hStr = finalH.toString().padStart(2, "0");
    const mStr = m.toString().padStart(2, "0");
    onChange(`${hStr}:${mStr}`);
  };

  const toggleAmPm = (newVal) => {
    setTempAmPm(newVal);
    commitChange(tempHour, tempMinute, newVal);
  };

  const getAngle = (val, isHour) => {
    const total = isHour ? 12 : 60;
    const adjusted = isHour ? val % 12 : val;
    return (adjusted / total) * 360;
  };

  const currentVal = mode === "hours" ? tempHour : tempMinute;
  const angle = getAngle(currentVal, mode === "hours");

  return (
    <div className="flex flex-col items-center p-4 bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl w-[280px]">
      {/* Header / Display */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-baseline gap-1">
          <button
            onClick={() => setMode("hours")}
            className={cn(
              "text-3xl font-bold transition-colors",
              mode === "hours" ? "text-primary" : "text-zinc-500",
            )}
          >
            {tempHour}
          </button>
          <span className="text-3xl font-bold text-zinc-500">:</span>
          <button
            onClick={() => setMode("minutes")}
            className={cn(
              "text-3xl font-bold transition-colors",
              mode === "minutes" ? "text-primary" : "text-zinc-500",
            )}
          >
            {tempMinute.toString().padStart(2, "0")}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-bold",
              tempAmPm === "AM"
                ? "bg-primary text-primary-foreground"
                : "text-zinc-500",
            )}
            onClick={() => toggleAmPm("AM")}
          >
            AM
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 text-xs font-bold",
              tempAmPm === "PM"
                ? "bg-primary text-primary-foreground"
                : "text-zinc-500",
            )}
            onClick={() => toggleAmPm("PM")}
          >
            PM
          </Button>
        </div>
      </div>

      {/* Clock Face */}
      <div className="relative w-48 h-48 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
        {/* Center Dot */}
        <div className="absolute w-2 h-2 rounded-full bg-primary z-20" />

        {/* The Hand */}
        <motion.div
          className="absolute origin-bottom w-0.5 bg-primary z-10"
          style={{
            height: "70px",
            bottom: "50%",
            left: "calc(50% - 0.5px)",
          }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/20 border-2 border-primary" />
        </motion.div>

        {/* Numbers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0"
          >
            {(mode === "hours" ? HOURS : MINUTES).map((val, i) => {
              const r = 75;
              const theta = (i * 30 - 90) * (Math.PI / 180);
              const x = r * Math.cos(theta);
              const y = r * Math.sin(theta);

              return (
                <button
                  key={`${mode}-${val}`}
                  onClick={() => handleSelect(val)}
                  className={cn(
                    "absolute flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors hover:bg-zinc-800 transform -translate-x-1/2 -translate-y-1/2",
                    currentVal === val
                      ? "text-primary-foreground"
                      : "text-zinc-400",
                  )}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  {mode === "minutes" ? val.toString().padStart(2, "0") : val}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
        Select {mode}
      </p>
    </div>
  );
};

export default ClockPicker;
