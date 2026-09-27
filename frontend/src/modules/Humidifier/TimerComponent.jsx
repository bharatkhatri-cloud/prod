import React, { useState, useEffect } from "react";

const TimerCard = () => {
  const [seconds, setSeconds] = useState(120); // Start from 60 seconds
  const [isRunning, setIsRunning] = useState(true);
  const [bgColor, setBgColor] = useState("rgb(255, 0, 0)"); // Initially red

  useEffect(() => {
    let interval;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds((prev) => prev - 1), 1000);
    } else if (seconds === 0) {
      setIsRunning(false); // Stop the timer when it reaches 0
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  useEffect(() => {
    // Teal Red: rgb(178, 34, 34) → Teal Green: rgb(0, 128, 128)
    const interpolate = (start, end) => {
      return start + ((end - start) * (60 - seconds)) / 60;
    };
  
    const r = Math.round(interpolate(178, 0));
    const g = Math.round(interpolate(34, 128));
    const b = Math.round(interpolate(34, 128));
  
    setBgColor(`rgb(${r}, ${g}, ${b})`);
  }, [seconds]);

  const formatTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (val) => String(val).padStart(2, "0");

    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  return (
    <div
      style={{ backgroundColor: bgColor }} // Apply the dynamic color via inline styles
      className="w-64 mx-auto mt-6 p-4 rounded-xl text-white shadow-lg transition-colors duration-500 ease-in-out"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-center"> H1</h2>
      <div className="text-3xl font-mono text-center mb-4">
        {formatTime(seconds)}
      </div>
      <div className="flex justify-center gap-2 text-sm">

        <button
          type="button"
          onClick={() => {
          }}
          className="py-2 px-4 text-white-700 hover:text-white border border-white-700 hover:bg-white-800 focus:ring-4  focus:ring-white-300 rounded-lg text-sm font-semibold text-center  "
        >
          Place Mould
        </button>

      </div>
    </div>
  );
};

export default TimerCard;
