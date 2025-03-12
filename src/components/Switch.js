import React from 'react';

const Switch = ({ isOn, toggleSwitch }) => {
  return (
    <button 
      onClick={toggleSwitch}
      className={`relative w-32 h-16 rounded-full p-1 transition-all duration-500 shadow-xl focus:outline-none
                ${isOn ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-700'}`}
      style={{
        boxShadow: isOn 
          ? '0 0 20px rgba(79, 70, 229, 0.6), 0 0 40px rgba(79, 70, 229, 0.3)' 
          : '0 0 10px rgba(0, 0, 0, 0.6)'
      }}
      aria-pressed={isOn}
      aria-label={isOn ? "Turn off" : "Turn on"}
    >
      <div 
        className={`absolute top-1 w-14 h-14 rounded-full shadow-lg transform transition-all duration-500
                  ${isOn ? 'translate-x-16 bg-white' : 'translate-x-0 bg-gray-400'}`}
        style={{
          boxShadow: isOn 
            ? '0 0 10px rgba(255, 255, 255, 0.8) inset, 0 4px 8px rgba(0, 0, 0, 0.3)'
            : '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}
      ></div>
    </button>
  );
};

export default Switch;