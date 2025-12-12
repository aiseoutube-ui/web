
import React, { useState, useEffect } from 'react';
import type { TeamMember } from '../types';
import { SocialIcons } from './icons/SocialIcons';

interface TeamProps {
  content: TeamMember[];
}

// --- TEXT SCRAMBLE COMPONENT ---
// Added 'trigger' prop to force re-scramble effect when image changes
const ScrambleText: React.FC<{ text: string; isActive: boolean; className?: string; trigger?: any }> = ({ text, isActive, className, trigger }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  
  useEffect(() => {
    if (!isActive) {
      setDisplayText(text); // Reset instantly when not active
      return;
    }

    let iteration = 0;
    let interval: number;

    interval = window.setInterval(() => {
      setDisplayText(prev => 
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 2; // Speed of decoding
    }, 30);

    return () => clearInterval(interval);
  }, [isActive, text, trigger]); // Re-run when trigger changes

  return <span className={className}>{displayText}</span>;
};

// --- INDIVIDUAL CARD COMPONENT ---
const TeamCard: React.FC<{ 
  member: TeamMember; 
  isActive: boolean; 
  index: number; 
  onActivate: (index: number) => void; 
  onDeactivate: () => void;
}> = ({ member, isActive, index, onActivate, onDeactivate }) => {
  // Combine base image and burst images into one timeline
  const allImages = [member.image, ...(member.burstImages || [])];
  
  const [currentImg, setCurrentImg] = useState(allImages[0]);
  const [scanX, setScanX] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  // Logic: Interactive Scrubbing (Scanning) - Unified for Mouse and Touch
  const processInput = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    setScanX(x); // Track position for the visual scanner line

    // Map horizontal position to image index
    if (allImages.length > 1) {
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newIndex = Math.floor(percentage * allImages.length);
        const safeIndex = Math.min(newIndex, allImages.length - 1);

        if (safeIndex !== imgIndex) {
            setImgIndex(safeIndex);
            setCurrentImg(allImages[safeIndex]);
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    processInput(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent default only if necessary to stop scrolling (optional, but usually better UX to allow scroll + scrub)
    // e.preventDefault(); 
    if (!isActive) return;
    processInput(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    onActivate(index);
    // Calculate immediate position on first touch so it doesn't wait for a move
    processInput(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleDeactivate = () => {
    onDeactivate();
    setCurrentImg(allImages[0]); // Reset to identity
    setImgIndex(0);
  };

  return (
    <div 
        className={`
            relative border-b md:border-b-0 md:border-r border-white/10 overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] select-none touch-pan-y
            ${isActive ? 'flex-[5] opacity-100 grayscale-0' : 'flex-[1] opacity-80 md:opacity-50 grayscale hover:opacity-80 hover:grayscale-0'}
        `}
        onMouseEnter={() => onActivate(index)}
        onMouseLeave={handleDeactivate}
        onMouseMove={handleMouseMove}
        
        // Mobile Touch Events
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDeactivate}
        onTouchCancel={handleDeactivate}
    >
        {/* BACKGROUND IMAGE */}
        <div className="absolute inset-0 bg-black pointer-events-none">
             <img 
                src={currentImg} 
                alt={member.name}
                // Changed from object-top to object-center to fix cropping issues
                className={`w-full h-full object-cover transition-transform duration-100 ease-linear ${isActive ? 'scale-100' : 'scale-110'} object-center`}
                loading={isActive ? "eager" : "lazy"}
                decoding={isActive ? "sync" : "async"}
             />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/20 to-brand-primary"></div>
        </div>

        {/* SCANNER LINE UI (The "WOW" Factor) */}
        {isActive && allImages.length > 1 && (
            <div 
                className="absolute top-0 bottom-0 w-[2px] bg-brand-accent z-20 pointer-events-none shadow-[0_0_15px_#00FFFF] mix-blend-screen transition-transform duration-75 ease-out"
                style={{ transform: `translateX(${scanX}px)` }}
            >
                {/* Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-32 bg-gradient-to-b from-brand-accent/40 to-transparent"></div>
                {/* Bottom Data Label */}
                <div className="absolute bottom-10 left-2 text-[10px] font-mono text-brand-accent font-bold whitespace-nowrap bg-black/50 px-1 backdrop-blur-sm border border-brand-accent/30">
                    VAR_0{imgIndex} // {((imgIndex + 1) / allImages.length * 100).toFixed(0)}%
                </div>
            </div>
        )}

        {/* LABEL (Inactive State) */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
            {/* Mobile: Horizontal text, Desktop: Vertical Rotated Text */}
            <span className="text-white font-mono text-lg md:text-xl tracking-widest uppercase rotate-0 md:-rotate-90 whitespace-nowrap drop-shadow-md">
                {member.name}
            </span>
        </div>

        {/* EXPANDED CONTENT (Active State) */}
        <div className={`absolute inset-0 flex flex-col justify-end p-6 md:p-12 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} pointer-events-none`}>
            
            {/* Name & Role with DECODING EFFECT */}
            <div className="mb-4 md:mb-6">
                <div className="text-brand-accent font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
                    <span className={`w-2 h-2 bg-brand-accent rounded-full ${imgIndex > 0 ? 'animate-ping' : 'animate-pulse'}`}></span>
                    {/* Re-trigger scramble on image change for dynamic feel */}
                    <ScrambleText text={member.role} isActive={isActive} trigger={imgIndex} />
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white uppercase leading-none mb-4">
                    <ScrambleText text={member.name} isActive={isActive} />
                </h3>
                <div className="h-1 w-20 bg-brand-accent shadow-[0_0_10px_#00FFFF]"></div>
            </div>

            {/* Stats Grid (HUD) - ANIMATED BARS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 max-w-2xl border-t border-white/10 pt-4 md:pt-6">
                {member.stats.map((stat, i) => (
                    <div key={i} className="group/stat">
                        <div className="flex justify-between text-xs text-brand-light font-mono mb-1 md:mb-2">
                            <span className="uppercase tracking-wider">{stat.label}</span>
                            <span className="text-brand-accent font-bold">{stat.value}%</span>
                        </div>
                        <div className="h-1 bg-white/10 w-full overflow-hidden relative">
                            {/* Bar fills up when isActive is true */}
                            <div 
                                className="h-full bg-brand-accent shadow-[0_0_8px_#00FFFF] transition-all duration-1000 ease-out" 
                                style={{ 
                                    width: isActive ? `${stat.value}%` : '0%',
                                    transitionDelay: `${i * 100}ms` // Stagger the bars
                                }} 
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Socials - Enable pointer events for links */}
            <div className="flex gap-4 relative z-30 pointer-events-auto">
                 {member.social.map(link => (
                    <a key={link.platform} href={link.url} className="text-brand-muted hover:text-white transition-colors p-2 border border-transparent hover:border-white/20 rounded-full">
                        <SocialIcons platform={link.platform} className="w-5 h-5" />
                    </a>
                ))}
            </div>
        </div>
    </div>
  );
};

const Team: React.FC<TeamProps> = ({ content }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  // PRELOAD IMAGES to ensure "Scrub" effect is instant
  useEffect(() => {
    content.forEach(member => {
        if (member.burstImages) {
            member.burstImages.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }
    });
  }, [content]);

  return (
    <section id="team" className="section-reveal pt-16 pb-0 bg-brand-primary">
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">El Núcleo Humano</h2>
            <p className="text-brand-light leading-relaxed">
                Expertos en narrativa visual potenciados por inteligencia sintética.
            </p>
          </div>
      </div>

      {/* HOLOGRAPHIC DECK INTERFACE */}
      {/* Increased height on mobile to 850px to ensure enough space when expanded */}
      <div className="w-full h-[850px] md:h-[600px] flex flex-col md:flex-row bg-brand-primary border-y border-white/5">
        {content.map((member, index) => (
           <TeamCard 
             key={member.id} 
             member={member} 
             index={index} 
             isActive={activeIndex === index} 
             onActivate={setActiveIndex}
             onDeactivate={() => setActiveIndex(null)} 
           />
        ))}
      </div>

    </section>
  );
};

export default Team;
