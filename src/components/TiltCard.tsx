"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
  scale?: number;
}

export function TiltCard({ children, className = "", maxRotation = 10, scale = 1.02 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Calculate mouse position relative to center of card (-1 to 1)
      const x = (clientX - rect.left) / width;
      const y = (clientY - rect.top) / height;
      
      const multiplierX = (x - 0.5) * 2; // -1 (left) to 1 (right)
      const multiplierY = (y - 0.5) * 2; // -1 (top) to 1 (bottom)
      
      // Calculate rotation. Note: Y rotation goes with X position, X rotation goes with Y position.
      // Negative on rotateX so it tilts TOWARDS the mouse on top/bottom.
      setRotation({
        x: multiplierY * -maxRotation,
        y: multiplierX * maxRotation,
      });

      // Update glare position (0 to 100)
      setGlarePosition({
        x: x * 100,
        y: y * 100,
      });
    },
    [maxRotation]
  );

  const onMouseMove = (e: React.MouseEvent) => {
    setIsHovering(true);
    handleMove(e.clientX, e.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setIsHovering(true);
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const resetTilt = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-200 ease-out will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? scale : 1})`,
        zIndex: isHovering ? 10 : 1,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      onTouchMove={onTouchMove}
      onTouchEnd={resetTilt}
    >
      {/* Glare effect */}
      <div
        className="pointer-events-none absolute inset-0 z-50 rounded-inherit transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.3 : 0,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`,
          borderRadius: "inherit",
          mixBlendMode: "overlay",
        }}
      />
      {/* Content translated slightly forward in Z-space for depth */}
      <div style={{ transform: "translateZ(30px)", borderRadius: "inherit", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
