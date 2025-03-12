import React, { useState } from 'react';
import { Download } from 'lucide-react';
import ChaosBackground from '../components/ChaosBackground';
import Switch from '../components/Switch';

const Home = () => {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  const handleDownload = () => {
    window.open('https://play.google.com/store/apps/details?id=com.shorts.tracker&hl=pl', '_blank');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background with chaos elements - positioned at the document root level */}
      <ChaosBackground isOn={isOn} />
      
      {/* Central content - make sure it has a high z-index */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
        {/* Title Section */}
        <div className={`mb-8 text-center transition-all duration-1000 ${isOn ? 'scale-110' : 'scale-100'}`}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            Shorts Tracker
          </h1>
          <p className={`text-xl md:text-2xl text-gray-300 transition-opacity duration-700 ${isOn ? 'opacity-100' : 'opacity-70'}`}>
            Odzyskaj kontrolę nad swoim czasem
          </p>
        </div>
        
        {/* Toggle switch - slightly larger */}
        <div className="my-8">
          <Switch isOn={isOn} toggleSwitch={toggleSwitch} />
        </div>
        
        {/* Download section - appears when switch is on */}
        <div 
          className={`mt-10 max-w-xl w-full px-6 transition-all duration-1000 transform 
                    ${isOn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        >
          <p className="text-xl md:text-2xl text-white mb-8 text-center">
            Monitoruj swój czas spędzany na social mediach i odzyskaj nad nim kontrolę
          </p>
          <div className="flex justify-center">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-3 bg-black border border-gray-700 text-white hover:bg-gray-900 py-3 md:py-4 px-6 md:px-8 rounded-full text-lg md:text-xl shadow-lg transition-all transform hover:scale-105 hover:shadow-xl"
            >
              <Download size={24} />
              <span>Pobierz z Google Play</span>
            </button>
          </div>
          
          <div className="mt-10 text-gray-400 text-sm text-center">
            <p>Projekt społeczny w ramach Olimpiady Zwolnionych z Teorii</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;