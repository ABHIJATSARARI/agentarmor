import React, { useState, useEffect, useRef } from 'react';

/**
 * Animated number counter that smoothly transitions between values.
 */
export default function AnimatedCounter({ value, duration = 800, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = typeof value === 'number' ? value : parseFloat(value) || 0;

    if (from === to || typeof to !== 'number') {
      setDisplay(value);
      prevRef.current = to;
      return;
    }

    const startTime = performance.now();
    const diff = to - from;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + diff * eased;

      setDisplay(Number.isInteger(to) ? Math.round(current) : current.toFixed(1));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(to);
        prevRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <>{prefix}{display}{suffix}</>;
}
