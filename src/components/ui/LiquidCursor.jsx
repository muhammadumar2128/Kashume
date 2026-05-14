import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const LiquidCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleHover = (e) => {
      const target = e.target;
      if (target.closest('button') || target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleHover);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleHover);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        scale: isHovering ? 2 : 1,
        backgroundColor: isHovering ? 'rgba(26, 26, 26, 0.1)' : 'rgba(26, 26, 26, 0)',
        borderWidth: isHovering ? '0.5px' : '1px',
      }}
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-charcoal pointer-events-none z-[9999] mix-blend-difference hidden md:block"
    />
  );
};

export default LiquidCursor;
