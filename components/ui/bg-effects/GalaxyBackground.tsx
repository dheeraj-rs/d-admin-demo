'use client';

import React, { useEffect, useState, useMemo } from 'react';
import './galaxy.scss';

interface Star {
  id: string;
  className: string;
  left: number;
  top: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleDelay: number;
  moveSpeed: number;
  moveRadius: number;
  moveDelay: number;
}

interface CosmicDust {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  animationDelay: number;
  animationDuration: number;
}

interface MovingObject {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  size: number;
  speed: number;
  tailLength: number;
  brightness: number;
  color: string;
}

interface LightningStrike {
  id: number;
  x: number;
  y: number;
  size: number;
  intensity: number;
}

interface StarCluster {
  id: string;
  centerX: number;
  centerY: number;
  radius: number;
  density: number;
  starCount: number;
}
const GalaxyBackground = () => {
  const [isClient, setIsClient] = useState(false);
  const [lightningStrikes, setLightningStrikes] = useState<LightningStrike[]>([]);
  const [movingObject, setMovingObject] = useState<MovingObject | null>(null);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate stars with a balanced Milky Way distribution
  const starsData = useMemo(() => {
    if (!isClient) return { backgroundStars: [], midStars: [], foregroundStars: [] };

    // Define star clusters to represent a more visible Milky Way
    const starClusters: StarCluster[] = [
      // Main galactic core
      {
        id: 'core',
        centerX: 50,
        centerY: 50,
        radius: 30, // Increased radius for a more prominent core
        density: 0.7, // Increased density
        starCount: 300 // Increased star count
      },
      // Primary spiral arms
      {
        id: 'arm-a1',
        centerX: 70,
        centerY: 30,
        radius: 25, // Increased radius
        density: 0.6, // Increased density
        starCount: 200 // Increased star count
      },
      {
        id: 'arm-a2',
        centerX: 30,
        centerY: 70,
        radius: 25, // Increased radius
        density: 0.6, // Increased density
        starCount: 200 // Increased star count
      },
      // Secondary, slightly fainter clusters
      {
        id: 'clst-1',
        centerX: 20,
        centerY: 45,
        radius: 12,
        density: 0.4,
        starCount: 80
      },
      {
        id: 'clst-2',
        centerX: 80,
        centerY: 55,
        radius: 12,
        density: 0.4,
        starCount: 80
      },
      {
        id: 'clst-3',
        centerX: 45,
        centerY: 18,
        radius: 9,
        density: 0.3,
        starCount: 60
      },
      {
        id: 'clst-4',
        centerX: 55,
        centerY: 82,
        radius: 9,
        density: 0.3,
        starCount: 60
      }
    ];

    const generateStarInCluster = (cluster: StarCluster, starClass: string): Star[] => {
      const stars: Star[] = [];
      for (let i = 0; i < cluster.starCount; i++) {
        // Smooth spiral distribution with slightly more definition
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.pow(Math.random(), 1.5) * cluster.radius; // Distribute stars more evenly, less concentrated in center
        const spiralFactor = Math.log(distance + 1) / Math.log(cluster.radius + 1);
        const x = cluster.centerX + Math.cos(angle + spiralFactor * 1.8) * distance; // Adjusted spiral factor for clearer arms
        const y = cluster.centerY + Math.sin(angle + spiralFactor * 1.8) * distance; // Adjusted spiral factor for clearer arms

        // Balanced brightness and size based on layer and position
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - cluster.centerX, 2) + Math.pow(y - cluster.centerY, 2)
        );
        const normalizedDistance = distanceFromCenter / cluster.radius;
        let brightness = (1 - Math.pow(normalizedDistance, 1.2)) * cluster.density * (Math.random() * 0.3 + 0.7); // Increased base brightness, less sharp falloff

        // Adjust brightness based on layer
        if (starClass === 'bg-star') brightness *= 0.5; // More visible background stars
        else if (starClass === 'mid-star') brightness *= 0.8; // More visible mid stars
        else brightness *= 1.0; // Brighter foreground stars

        brightness = Math.max(0.1, Math.min(1.0, brightness)); // Clamp brightness to a more visible range

        const size = starClass === 'fg-star' 
          ? Math.random() * 1.2 + 0.5  // Slightly larger foreground stars
          : Math.random() * 0.8 + 0.3; // Slightly larger background/mid stars

        stars.push({
          id: `${cluster.id}-${starClass}-${i}`,
          className: starClass,
          left: x,
          top: y,
          size,
          brightness,
          twinkleSpeed: Math.random() * 5 + 3, // Slightly faster twinkle
          twinkleDelay: Math.random() * 6,
          moveSpeed: Math.random() * 70 + 30, // Moderate movement
          moveRadius: Math.random() * 10 + 2,
          moveDelay: Math.random() * 10
        });
      }
      return stars;
    };

    // Generate stars for each layer with balanced characteristics
    const backgroundStars = starClusters.flatMap(cluster => 
      generateStarInCluster(cluster, 'bg-star')
    );
    
    const midStars = starClusters.flatMap(cluster => 
      generateStarInCluster(cluster, 'mid-star')
    );
    
    const foregroundStars = starClusters.flatMap(cluster => 
      generateStarInCluster(cluster, 'fg-star')
    );

    // Moderately increased and visible random stars
    const addRandomStars = (count: number, starClass: string): Star[] => {
      return Array.from({ length: count }, (_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        let brightness = Math.random() * 0.2 + 0.1; // More visible random stars
        if (starClass === 'fg-star') brightness *= 0.7;
        else if (starClass === 'mid-star') brightness *= 0.5;
        else brightness *= 0.3; // Background random stars are still dim

        const size = starClass === 'fg-star' 
          ? Math.random() * 0.8 + 0.2
          : Math.random() * 0.5 + 0.1;

        return {
          id: `random-${starClass}-${i}`,
          className: starClass,
          left: x,
          top: y,
          size,
          brightness,
          twinkleSpeed: Math.random() * 5 + 3,
          twinkleDelay: Math.random() * 6,
          moveSpeed: Math.random() * 70 + 30,
          moveRadius: Math.random() * 10 + 2,
          moveDelay: Math.random() * 10
        };
      });
    };

    return {
      backgroundStars: [...backgroundStars, ...addRandomStars(250, 'bg-star')], // Increased random stars
      midStars: [...midStars, ...addRandomStars(120, 'mid-star')],
      foregroundStars: [...foregroundStars, ...addRandomStars(50, 'fg-star')] // A good amount of foreground random stars
    };
  }, [isClient]);

  // Generate cosmic dust data once
  const cosmicDustData = useMemo(() => {
    if (!isClient) return [];

    return Array.from({ length: 25 }, (_, i) => ({
      id: `dust-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 200 + 100,
      height: Math.random() * 200 + 100,
      animationDelay: Math.random() * 20,
      animationDuration: Math.random() * 40 + 60
    }));
  }, [isClient]);

  // Single moving object with varying tail effect
  useEffect(() => {
    if (!isClient) return;

    const createMovingObject = (): MovingObject => {
      const angle = Math.random() * 360;
      const distance = Math.random() * 80 + 40;
      
      // Start from left edge
      const startX = -15;
      const startY = Math.random() * 120 - 10;
      const endX = startX + distance * Math.cos(angle * Math.PI / 180);
      const endY = startY + distance * Math.sin(angle * Math.PI / 180);
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const movementAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      return {
        id: Date.now(),
        startX,
        startY,
        endX,
        endY,
        angle: movementAngle,
        size: 3,
        speed: Math.random() * 3 + 8,
        tailLength: Math.random() * 100 + 50, // Varying tail length between 50 and 150
        brightness: Math.random() * 0.2 + 0.8,
        color: 'rgba(255, 255, 255, 1)'
      };
    };

    const addMovingObject = () => {
      const newObject = createMovingObject();
      setMovingObject(newObject);
      
      setTimeout(() => {
        setMovingObject(null);
        // Create new object after a delay
        setTimeout(() => {
          addMovingObject();
        }, 1000); // 1 second delay before next object
      }, newObject.speed * 1000 + 500);
    };

    // Start with initial object
    addMovingObject();

    return () => {
      setMovingObject(null);
    };
  }, [isClient]);

  // Lightning effect
 useEffect(() => {
  if (!isClient) return;

  const triggerLightning = () => {
    // You can still use randomness if you want to skip some 5s intervals
    if (Math.random() < 0.8) { // Optional: 80% chance to strike
      const newStrike: LightningStrike = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 5,
        intensity: Math.random() * 0.2 + 0.1
      };

      setLightningStrikes(prev => [...prev, newStrike]);

      setTimeout(() => {
        setLightningStrikes(prev => prev.filter(strike => strike.id !== newStrike.id));
      }, 150 + Math.random() * 200);
    }
  };

  const interval = setInterval(triggerLightning, 10000); // One try every 5s

  return () => clearInterval(interval);
}, [isClient]);

  // Render stars
  const renderStars = (starsArray: Star[]) => {
    return starsArray.map(star => (
      <div
        key={star.id}
        className={`star ${star.className}`}
        style={{
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.brightness,
          animationDuration: `${star.twinkleSpeed}s, ${star.moveSpeed}s`,
          animationDelay: `${star.twinkleDelay}s, ${star.moveDelay}s`,
          ['--move-radius' as string]: `${star.moveRadius}px`
        }}
      />
    ));
  };

  if (!isClient) {
    return <div className="milky-way-container" />;
  }

  return (
    <div className="milky-way-container">
      {/* Deep space base */}
      <div className="deep-space-base" />
      
      {/* Star field layers */}
      <div className="star-field background-stars">
        {renderStars(starsData.backgroundStars)}
      </div>
      
      <div className="star-field mid-stars">
        {renderStars(starsData.midStars)}
      </div>
      
      {/* Cosmic dust clouds */}
      <div className="cosmic-dust-field">
        {cosmicDustData.map(dust => (
          <div
            key={dust.id}
            className="dust-cluster"
            style={{
              left: `${dust.left}%`,
              top: `${dust.top}%`,
              width: `${dust.width}px`,
              height: `${dust.height}px`,
              animationDelay: `${dust.animationDelay}s`,
              animationDuration: `${dust.animationDuration}s`,
            }}
          />
        ))}
      </div>
      
       {/* Single moving object with tail */}
      <div className="moving-objects-container">
        {movingObject && (
          <div
            key={movingObject.id}
            className="moving-object"
            style={{
              ['--start-x' as string]: `${movingObject.startX}%`,
              ['--start-y' as string]: `${movingObject.startY}%`,
              ['--end-x' as string]: `${movingObject.endX}%`,
              ['--end-y' as string]: `${movingObject.endY}%`,
              ['--object-size' as string]: `${movingObject.size}px`,
              ['--tail-length' as string]: `${movingObject.tailLength}px`,
              ['--object-color' as string]: movingObject.color,
              ['--brightness' as string]: movingObject.brightness,
              ['--rotation' as string]: `${movingObject.angle}deg`,
              ['--speed' as string]: `${movingObject.speed}s`,
            }}
          >
            <div className="object-tail"></div>
            <div className="object-core"></div>
          </div>
        )}
      </div>
      
      {/* Lightning strikes */}
      {lightningStrikes.map(strike => (
        <div
          key={strike.id}
          className="lightning-strike"
          style={{
            left: `${strike.x}%`,
            top: `${strike.y}%`,
            width: `${strike.size}%`,
            height: `${strike.size}%`,
            opacity: strike.intensity,
          }}
        />
      ))}
      
      {/* Galactic center */}
      <div className="galactic-center" />
      
      <div className="star-field foreground-stars">
        {renderStars(starsData.foregroundStars)}
      </div>
      
      {/* Galactic dust band */}
      <div className="galactic-dust-band" />
    </div>
  );
};

export default GalaxyBackground;