import React, { useState, useEffect, useRef } from 'react';
import FlyingSocialElement from './FlyingSocialElement';
import FlyingEmoji from './FlyingEmoji';

const ChaosBackground = ({ isOn }) => {
  const [socialElements, setSocialElements] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const totalElementsRef = useRef(0);
  
  // Significantly reduced element count for better performance
  const maxSocialElements = 6; // Reduced for better performance
  const maxEmojis = 8; // Reduced for better performance
  
  // Handle element animation completion with regeneration
  const handleElementComplete = (id) => {
    if (isOn) return; // Stop creating new elements if switch is on
    
    // Remove completed element
    setSocialElements(prev => prev.filter(item => item.id !== id));
    
    // Create a new element with delay to prevent too many animations at once
    if (socialElements.length < maxSocialElements) {
      setTimeout(() => {
        if (!isOn) { // Double-check switch is still off
          const types = ['instagram', 'tiktok', 'comment', 'shorts', 'notification'];
          const newElement = {
            id: `social-${totalElementsRef.current++}`,
            type: types[Math.floor(Math.random() * types.length)]
          };
          
          setSocialElements(prev => [...prev, newElement]);
        }
      }, 200 + Math.random() * 800); // Shorter delay for more consistent chaos
    }
  };
  
  // Handle emoji animation completion with regeneration
  const handleEmojiComplete = (id) => {
    if (isOn) return; // Stop creating new emojis if switch is on
    
    // Remove completed emoji
    setEmojis(prev => prev.filter(item => item.id !== id));
    
    // Create a new emoji with delay to prevent too many animations at once
    if (emojis.length < maxEmojis) {
      setTimeout(() => {
        if (!isOn) { // Double-check switch is still off
          const emojiList = ['❤️', '👍', '😍', '🔥', '😂', '👏', '💯', '🙌', '💬', '🎵'];
          const newEmoji = {
            id: `emoji-${totalElementsRef.current++}`,
            emoji: emojiList[Math.floor(Math.random() * emojiList.length)]
          };
          
          setEmojis(prev => [...prev, newEmoji]);
        }
      }, 100 + Math.random() * 600); // Faster regeneration for constant flow
    }
  };

  // Generate initial social media elements with staggered creation
  useEffect(() => {
    if (isOn || socialElements.length > 0 || emojis.length > 0) return;
    
    const types = ['instagram', 'tiktok', 'comment', 'shorts', 'notification'];
    const emojiList = ['❤️', '👍', '😍', '🔥', '😂', '👏', '💯', '🙌', '💬', '🎵'];
    
    // Create elements with staggered timing
    const createElementsWithDelay = () => {
      const initialBatch = 8; // Start with smaller batch then grow
      
      // Initial social elements - with more spacing
      for (let i = 0; i < Math.min(initialBatch, 4); i++) {
        setTimeout(() => {
          setSocialElements(prev => [
            ...prev, 
            {
              id: `social-${totalElementsRef.current++}`,
              type: types[Math.floor(Math.random() * types.length)]
            }
          ]);
        }, i * 400); // Much more staggered creation to reduce CPU spikes
      }
      
      // Initial emojis - with more spacing
      for (let i = 0; i < Math.min(initialBatch, 4); i++) {
        setTimeout(() => {
          setEmojis(prev => [
            ...prev, 
            {
              id: `emoji-${totalElementsRef.current++}`,
              emoji: emojiList[Math.floor(Math.random() * emojiList.length)]
            }
          ]);
        }, 200 + i * 500); // Much more staggered creation and offset from social elements
      }
      
      // Add more elements gradually to build up chaos
      setTimeout(() => {
        if (!isOn) {
          for (let i = 0; i < maxSocialElements - initialBatch / 2; i++) {
            setTimeout(() => {
              if (!isOn) {
                setSocialElements(prev => [
                  ...prev, 
                  {
                    id: `social-${totalElementsRef.current++}`,
                    type: types[Math.floor(Math.random() * types.length)]
                  }
                ]);
              }
            }, i * 200);
          }
          
          for (let i = 0; i < maxEmojis - initialBatch / 2; i++) {
            setTimeout(() => {
              if (!isOn) {
                setEmojis(prev => [
                  ...prev, 
                  {
                    id: `emoji-${totalElementsRef.current++}`,
                    emoji: emojiList[Math.floor(Math.random() * emojiList.length)]
                  }
                ]);
              }
            }, i * 150);
          }
        }
      }, 2000); // Wait a bit before adding more
    };
    
    createElementsWithDelay();
  }, [isOn]);

  // Reset elements when switching states
  useEffect(() => {
    // Clear all elements when turning on focus mode
    if (isOn) {
      setSocialElements([]);
      setEmojis([]);
      totalElementsRef.current = 0;
    } 
    // Reinitialize when turning chaos mode back on (if empty)
    else if (socialElements.length === 0 && emojis.length === 0) {
      const types = ['instagram', 'tiktok', 'comment', 'shorts', 'notification'];
      const emojiList = ['❤️', '👍', '😍', '🔥', '😂', '👏', '💯', '🙌', '💬', '🎵'];
      
      // Start with a burst of elements
      const initialSocialElements = [];
      for (let i = 0; i < maxSocialElements; i++) {
        initialSocialElements.push({
          id: `social-${totalElementsRef.current++}`,
          type: types[Math.floor(Math.random() * types.length)]
        });
      }
      
      const initialEmojis = [];
      for (let i = 0; i < maxEmojis; i++) {
        initialEmojis.push({
          id: `emoji-${totalElementsRef.current++}`,
          emoji: emojiList[Math.floor(Math.random() * emojiList.length)]
        });
      }
      
      // Stagger the introduction of elements
      setTimeout(() => {
        setSocialElements(initialSocialElements.slice(0, 5));
        setEmojis(initialEmojis.slice(0, 7));
        
        setTimeout(() => {
          if (!isOn) {
            setSocialElements(prev => [...prev, ...initialSocialElements.slice(5, 10)]);
            setEmojis(prev => [...prev, ...initialEmojis.slice(7, 14)]);
            
            setTimeout(() => {
              if (!isOn) {
                setSocialElements(prev => [...prev, ...initialSocialElements.slice(10)]);
                setEmojis(prev => [...prev, ...initialEmojis.slice(14)]);
              }
            }, 1000);
          }
        }, 800);
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Enhanced glass effect with dusty mirror look */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 100%)',
          boxShadow: 'inset 0 0 100px rgba(255,255,255,0.05)',
          backdropFilter: isOn ? 'blur(6px) brightness(0.4)' : 'blur(3px) brightness(0.15)',
          transition: 'all 0.8s ease-in-out'
        }}
      />
      
      {/* Subtle reflective surface effects */}
      <div 
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isOn ? 'opacity-5' : 'opacity-15'}`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 20%),
            linear-gradient(to bottom, transparent, rgba(30,30,50,0.15))
          `,
        }}
      />
      
      {/* Vignette effect to enhance depth */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
          opacity: isOn ? 0.3 : 0.7,
          transition: 'opacity 0.8s ease-in-out'
        }}
      />
      
      {/* Social media chaos - fixed container to full viewport */}
      <div 
        className={`fixed inset-0 w-full h-full transition-opacity duration-1000 ${isOn ? 'opacity-0' : 'opacity-100'}`} 
        style={{ perspective: '800px' }}
      >
        {!isOn && socialElements.map(item => (
          <FlyingSocialElement 
            key={item.id} 
            type={item.type} 
            onAnimationComplete={() => handleElementComplete(item.id)}
          />
        ))}
        
        {!isOn && emojis.map(item => (
          <FlyingEmoji 
            key={item.id} 
            emoji={item.emoji} 
            onAnimationComplete={() => handleEmojiComplete(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChaosBackground;