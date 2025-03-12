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

const FlyingEmoji = ({ emoji, onAnimationComplete }) => {
  // Use viewport units instead of percentages for positioning
  // This ensures we can truly position elements anywhere on screen
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Start from center with slight offset to prevent clustering
  const centerX = viewportWidth / 2 + (Math.random() * 100 - 50);
  const centerY = viewportHeight / 2 + (Math.random() * 100 - 50);
  
  // Z position - starting very far away
  const startZ = -800 - Math.random() * 400; // -800 to -1200 (far in the distance)
  
  // Use the quadrant-based distribution function to ensure better coverage
  const angleOffset = getDistributedAngle();
  
  // Flight vector with enforced minimum strength
  const vectorStrength = 1.2 + Math.random() * 1.0; // Even stronger minimum (1.2-2.2)
  const vectorX = Math.sin(angleOffset) * vectorStrength;
  const vectorY = Math.cos(angleOffset) * vectorStrength;
  
  // Initial setup
  const [position, setPosition] = useState({
    x: centerX,
    y: centerY,
    z: startZ,
    rotate: Math.random() * 180,
    scale: 0.05, // Very small when far away
    opacity: 0.1 // Nearly invisible when far
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
    // Animation speed - slower for emojis to contrast with social elements
    const speed = 400 + Math.random() * 300; // 400-700ms - slower for better performance
    
    // Throttling for performance
    let prevUpdateTime = 0;
    const updateInterval = 100; // 100ms between updates - significantly reduced update frequency
    
    // Animate flying towards and past screen
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      
      // Throttle updates for performance
      if (timestamp - prevUpdateTime < updateInterval) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      
      prevUpdateTime = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      
      // Non-linear progress for dramatic acceleration effect
      // Slow at distance, rapid as approaches viewer
      const progress = Math.pow(elapsed / speed, 1.7); // Non-linear accelerating progress
      const newZ = startZRef.current + progress * 1200; // Long travel distance
      
      // Calculate distance factor (0 when far, 1 when at screen plane)
      const distanceFactor = Math.min(1, (newZ + 800) / 800);
      
      // Calculate fly factor using pixels instead of percentages for more predictable results
      const flyFactor = Math.pow(distanceFactor, 0.7) * Math.max(viewportWidthRef.current, viewportHeightRef.current) * 0.4;
      
      // Calculate new position in pixels
      const newX = startXRef.current + (vectorXRef.current * flyFactor);
      const newY = startYRef.current + (vectorYRef.current * flyFactor);
      
      // Size increases non-linearly as it gets closer
      // Emojis get quite large for dramatic effect
      const newScale = 0.05 + Math.pow(distanceFactor, 0.8) * (2 + Math.random() * 1); // Larger scale factor for emojis
      
      // Opacity changes - with safety checks to prevent NaN
      let newOpacity = 0.8;
      if (newZ < 100) {
        // Gradual fade in - with bounds checking
        newOpacity = Math.min(0.95, 0.1 + Math.pow(Math.max(0, Math.min(1, distanceFactor)), 0.6) * 0.9);
      } else {
        // Quick fade out - with bounds checking
        const fadeOutFactor = Math.max(0, Math.min(1, (newZ - 100) / 150));
        newOpacity = Math.max(0, 0.95 - Math.pow(fadeOutFactor, 2));
      }
      
      // Final safety check
      newOpacity = Math.max(0, Math.min(1, newOpacity));
      
      // Gradually rotate as it flies - faster rotation for emojis
      const newRotate = rotateRef.current + (1 + distanceFactor * 2); // Rotation speed increases as it gets closer
      
      setPosition({
        x: newX,
        y: newY,
        z: newZ,
        rotate: newRotate,
        scale: newScale,
        opacity: newOpacity
      });
      
      // Continue or complete
      if (newZ < 250) { // Let it come closer before disappearing
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Notify parent when element has flown past screen
        if (onAnimationComplete) onAnimationComplete();
      }
    };
    
    // Add initial delay to stagger animations
    setTimeout(() => {
      requestRef.current = requestAnimationFrame(animate);
    }, Math.random() * 2000); // Longer stagger for more natural appearance
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [onAnimationComplete]); // Only include onAnimationComplete as a dependency

  // Enhanced 3D effect
  return (
    <div 
      className="absolute text-4xl"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        transform: `perspective(800px) translateZ(${position.z}px) rotate(${position.rotate}deg) scale(${position.scale})`,
        opacity: position.opacity,
        zIndex: Math.floor((position.z + 1000) / 10) * 10,
        willChange: 'transform, opacity'
      }}
    >
      {emoji}
    </div>
  );
};

export default FlyingEmoji;