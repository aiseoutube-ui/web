import React, { useRef, useEffect } from 'react';

declare const gsap: any;

const AnimatedLogo: React.FC = () => {
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const isAnimated = useRef(false);

  useEffect(() => {
    const logoContainer = logoContainerRef.current;
    if (!logoContainer) return;

    const startAnimation = () => {
      if (isAnimated.current) return;
      isAnimated.current = true;

      fetch('https://aiseoutube-ui.github.io/Tap/logo.svg')
        .then(response => response.text())
        .then(svgText => {
          if (logoContainer) {
            logoContainer.innerHTML = svgText;
            const svgElement = logoContainer.querySelector('svg');
            if (svgElement) {
              svgElement.setAttribute('class', 'w-full h-full');
              const paths = svgElement.querySelectorAll('path');
              if (paths.length > 0) {
                paths.forEach((path, index) => {
                    const length = path.getTotalLength();
                    
                    gsap.set(path, {
                      strokeDasharray: length,
                      strokeDashoffset: length,
                      stroke: 'currentColor',
                      fill: 'none',
                      strokeWidth: 60,
                    });

                    gsap.to(path, {
                      strokeDashoffset: 0,
                      duration: 2.5,
                      delay: 0.2,
                      ease: 'power1.inOut',
                      onComplete: () => {
                          gsap.to(path, {
                              fill: 'currentColor',
                              duration: 0.5,
                              ease: 'power1.in'
                          });
                          if (index === paths.length - 1) {
                            window.dispatchEvent(new CustomEvent('logoAnimationFinished'));
                          }
                      }
                    });
                });
              }
            }
          }
        })
        .catch(error => console.error('Error fetching SVG:', error));
    };

    window.addEventListener('preloaderFinished', startAnimation);
    
    return () => {
      window.removeEventListener('preloaderFinished', startAnimation);
    };
  }, []);

  return <div 
    id="animated-logo-wrapper"
    ref={logoContainerRef} 
    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] sm:w-[50vw] md:w-[40vw] max-w-lg z-[51] text-brand-accent pointer-events-none"
  ></div>;
};

export default AnimatedLogo;