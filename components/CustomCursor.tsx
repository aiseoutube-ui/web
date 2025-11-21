import React, { useEffect, useRef } from 'react';

declare const gsap: any;

const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      gsap.to(dotRef.current, { x: clientX, y: clientY, duration: 0.1, ease: 'power3' });
      gsap.to(outlineRef.current, { x: clientX, y: clientY, duration: 0.5, ease: 'power3' });
    };

    const handleMouseEnter = () => {
      outlineRef.current?.classList.add('hovered');
    };

    const handleMouseLeave = () => {
      outlineRef.current?.classList.remove('hovered');
    };

    window.addEventListener('mousemove', mouseMove);
    
    const elementsToWatch = document.querySelectorAll('.cursor-pointer-grow');
    elementsToWatch.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      elementsToWatch.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
    });
    };
  }, []);

  return (
    <div className="custom-cursor hidden md:block">
      <div ref={dotRef} className="cursor-dot"></div>
      <div ref={outlineRef} className="cursor-outline"></div>
    </div>
  );
};

export default CustomCursor;