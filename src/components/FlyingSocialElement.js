import React, { useState, useEffect, useRef } from 'react';

/**
 * Helper function to create a more even distribution of elements across the screen
 * by ensuring each quadrant gets approximately equal representation
 */
const getDistributedAngle = () => {
  // Divide the screen into quadrants and ensure representation in each
  const quadrants = [
    // Top-left
    [Math.PI * 0.75, Math.PI * 1.25],
    // Top-right
    [Math.PI * 0.25, Math.PI * 0.75],
    // Bottom-right
    [Math.PI * 1.75, Math.PI * 0.25], 
    // Bottom-left
    [Math.PI * 1.25, Math.PI * 1.75]
  ];
  
  // Select a random quadrant with slight weighting to bottom half
  // to counteract natural tendency for eyes to focus on top of screen
  const quadrantWeights = [0.2, 0.2, 0.3, 0.3]; // More elements in bottom half
  
  // Select quadrant based on weights
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedQuadrant = 0;
  
  for (let i = 0; i < quadrantWeights.length; i++) {
    cumulativeWeight += quadrantWeights[i];
    if (random <= cumulativeWeight) {
      selectedQuadrant = i;
      break;
    }
  }
  
  // Get the angle range for the selected quadrant
  const [min, max] = quadrants[selectedQuadrant];
  
  // Return a random angle within that quadrant
  return min + Math.random() * (max - min);
};

const FlyingSocialElement = ({ type, onAnimationComplete }) => {
  // Use viewport units instead of percentages for positioning
  // This ensures we can truly position elements anywhere on screen
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Start from center with slight offset to prevent clustering
  const centerX = viewportWidth / 2 + (Math.random() * 100 - 50); 
  const centerY = viewportHeight / 2 + (Math.random() * 100 - 50);
  
  // Z position - starting very far away in the distance
  const startZ = -800 - Math.random() * 400; // -800 to -1200
  
  // Use the quadrant-based distribution function to ensure better coverage
  const angleOffset = getDistributedAngle();
  
  // Flight vector with enforced minimum strength to ensure elements reach screen edges
  const vectorStrength = 1.0 + Math.random() * 1.0; // Stronger minimum (1.0-2.0)
  const vectorX = Math.sin(angleOffset) * vectorStrength;
  const vectorY = Math.cos(angleOffset) * vectorStrength;
  
  // Initial state
  const [position, setPosition] = useState({
    x: centerX,
    y: centerY,
    z: startZ,
    rotate: Math.random() * 40 - 20,
    scale: 0.05 + Math.random() * 0.1, // Smaller scale when further away
    opacity: 0.2 + Math.random() * 0.3 // Slightly visible even when far
  });

  // Animation reference
  const requestRef = useRef();
  const startTimeRef = useRef();
  
  // Save initial values in refs to avoid dependency issues
  const startXRef = useRef(centerX);
  const startYRef = useRef(centerY);
  const startZRef = useRef(startZ);
  const vectorXRef = useRef(vectorX);
  const vectorYRef = useRef(vectorY);
  const rotateRef = useRef(position.rotate);
  const viewportWidthRef = useRef(viewportWidth);
  const viewportHeightRef = useRef(viewportHeight);
  
  // Update refs when values change
  useEffect(() => {
    startXRef.current = centerX;
    startYRef.current = centerY;
    startZRef.current = startZ;
    rotateRef.current = position.rotate;
    viewportWidthRef.current = viewportWidth;
    viewportHeightRef.current = viewportHeight;
  }, [centerX, centerY, startZ, position.rotate, viewportWidth, viewportHeight]);
  
  // Create animation with non-linear acceleration
  useEffect(() => {
    // Animation speed - slower for better performance
    const speed = 400 + Math.random() * 250; // 400-650ms base speed - significantly slowed down
    
    // Previous update time for throttling
    let prevUpdateTime = 0;
    
    // Animate flying towards and past screen
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      
      // Calculate elapsed time
      const elapsed = timestamp - startTimeRef.current;
      
      // Significantly increased throttling to reduce CPU usage
      if (timestamp - prevUpdateTime < 120) { // Reduced update frequency
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      
      prevUpdateTime = timestamp;
      
      // Non-linear progress for more natural movement
      // Slow at start, accelerate as it approaches camera
      const progress = Math.pow(elapsed / speed, 1.3); // Non-linear progress
      const newZ = startZRef.current + progress * 900; // Much longer travel distance
      
      // Calculate distance factor (0 when far, 1 when close)
      const distanceFactor = Math.min(1, (newZ + 800) / 800);
      
      // Calculate fly factor using pixels instead of percentages for more predictable results
      const flyFactor = Math.pow(distanceFactor, 0.7) * Math.max(viewportWidthRef.current, viewportHeightRef.current) * 0.4;
      
      // Calculate new position in pixels
      const newX = startXRef.current + (vectorXRef.current * flyFactor);
      const newY = startYRef.current + (vectorYRef.current * flyFactor);
      
      // Size increases as it gets closer
      const newScale = 0.05 + distanceFactor * (0.8 + Math.random() * 0.3);
      
      // Opacity changes - with safety checks to prevent NaN
      let newOpacity = 0.8;
      if (newZ < 100) {
        // Gradual fade in - with bounds checking
        newOpacity = Math.min(0.95, 0.1 + Math.pow(Math.max(0, Math.min(1, distanceFactor)), 0.5) * 0.9);
      } else {
        // Quick fade out - with bounds checking
        const fadeOutFactor = Math.max(0, Math.min(1, (newZ - 100) / 150));
        newOpacity = Math.max(0, 0.95 - Math.pow(fadeOutFactor, 2));
      }
      
      // Final safety check
      newOpacity = Math.max(0, Math.min(1, newOpacity));
      
      setPosition({
        x: newX,
        y: newY,
        z: newZ,
        rotate: rotateRef.current,
        scale: newScale,
        opacity: newOpacity
      });
      
      // Continue or complete
      if (newZ < 150) { // Let it come closer before disappearing
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Notify parent when element has flown past screen
        if (onAnimationComplete) onAnimationComplete();
      }
    };
    
    // Add initial delay to stagger animations
    setTimeout(() => {
      requestRef.current = requestAnimationFrame(animate);
    }, Math.random() * 1000); // Stagger start times
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [onAnimationComplete]); // Only include onAnimationComplete as a dependency

  // Simplified social media post types (reduced complexity)
  const elements = {
    instagram: (
      <div className="p-2 bg-white bg-opacity-90 rounded-lg shadow-lg w-44">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"></div>
          <div className="ml-2">
            <p className="text-xs font-bold text-gray-900">insta_user</p>
          </div>
        </div>
        <div className="h-24 bg-gray-200 rounded mb-2"></div>
        <div className="flex justify-between text-gray-600 text-xs">
          <span>❤️ 1.2k</span>
          <span>💬 45</span>
        </div>
      </div>
    ),
    tiktok: (
      <div className="p-2 bg-black text-white rounded-md shadow-lg w-36">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <p className="ml-2 text-xs font-bold">@tiktoker</p>
        </div>
        <div className="h-36 bg-gray-800 rounded-md flex items-center justify-center">
          <span className="text-3xl">▶️</span>
        </div>
      </div>
    ),
    comment: (
      <div className="p-3 bg-gray-100 rounded-xl shadow-md w-48">
        <div className="flex items-start">
          <div className="w-6 h-6 rounded-full bg-blue-400 mr-2"></div>
          <div>
            <p className="text-xs font-bold text-gray-800">komentator42</p>
            <p className="text-xs text-gray-700">Ale super filmik! 😍</p>
          </div>
        </div>
      </div>
    ),
    shorts: (
      <div className="p-1 bg-red-600 text-white rounded-lg shadow-lg w-24">
        <div className="h-40 bg-gray-900 rounded-md flex items-center justify-center">
          <span className="text-2xl">▶️</span>
        </div>
        <div className="p-2">
          <p className="text-xs font-bold">Shorts #viral</p>
        </div>
      </div>
    ),
    notification: (
      <div className="p-3 bg-white rounded-lg shadow-md w-56">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-500 mr-3 flex items-center justify-center text-white font-bold">M</div>
          <div>
            <p className="text-xs font-bold text-gray-800">Marta i 23 inne osoby</p>
            <p className="text-xs text-gray-600">polubiły Twój post</p>
          </div>
        </div>
      </div>
    )
  };

  // Rendering with 3D transform
  return (
    <div className="absolute" 
         style={{ 
           left: `${position.x}px`, 
           top: `${position.y}px`, 
           transform: `perspective(800px) translateZ(${position.z}px) rotate(${position.rotate}deg) scale(${position.scale})`,
           opacity: position.opacity,
           zIndex: Math.floor((position.z + 1000) / 10) * 10,
           willChange: 'transform, opacity',
           transition: 'opacity 0.1s ease-out'
         }}>
      {elements[type] || null}
    </div>
  );
};

export default FlyingSocialElement;