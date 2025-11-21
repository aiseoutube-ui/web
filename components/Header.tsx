
import React, { useState, useEffect } from 'react';
import type { HeaderContent } from '../types';
import { SocialIcons } from './icons/SocialIcons';

interface HeaderProps {
  content: HeaderContent;
}

const Header: React.FC<HeaderProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMenu = () => setIsOpen(!isOpen);

  /* TEMPORARILY DISABLED SASHA AI
  const openSashaAI = (e: React.MouseEvent) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('openSashaAI'));
      setIsOpen(false); // Close mobile menu if open
  };
  */

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isOpen ? 'bg-brand-primary/80 backdrop-blur-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#hero" className="cursor-pointer-grow" aria-label="Ir al inicio">
            <span className="text-2xl font-bold text-brand-light font-['Archivo'] tracking-wider hover:text-brand-accent transition-colors duration-300">
              The Last Art
            </span>
          </a>
          
          <nav className="hidden md:flex items-center space-x-8">
            {content.navLinks.map((link) => (
              <a key={link.name} href={link.href} className="cursor-pointer-grow text-brand-light hover:text-brand-accent transition-colors duration-300 text-sm font-medium">
                {link.name}
              </a>
            ))}
            
            {/* SASHA AI BUTTON - DESKTOP (DISABLED) */}
            {/* 
            <button 
                onClick={openSashaAI}
                aria-label="Activar Sasha AI"
                className="cursor-pointer-grow ml-4 relative group overflow-hidden rounded-full bg-white/10 border border-brand-accent/30 hover:border-brand-accent transition-all duration-300 px-4 py-1.5 flex items-center gap-2"
            >
                <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_#00FFFF]"></div>
                <span className="text-xs font-bold text-white uppercase tracking-widest group-hover:text-brand-accent transition-colors">
                    Sasha AI <span className="text-[10px] opacity-60">BETA</span>
                </span>
            </button>
            */}
          </nav>

          <div className="hidden md:flex items-center space-x-4 ml-4">
             {content.socialLinks.map(link => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`Síguenos en ${link.platform}`} className="cursor-pointer-grow text-brand-light hover:text-brand-accent transition-colors duration-300">
                    <SocialIcons platform={link.platform} className="w-5 h-5" />
                </a>
             ))}
          </div>

          <div className="md:hidden flex items-center gap-4">
            {/* SASHA AI BUTTON - MOBILE COMPACT (DISABLED) */}
             {/* 
             <button 
                onClick={openSashaAI}
                aria-label="Activar Sasha AI"
                className="cursor-pointer-grow relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/50 animate-pulse-subtle"
            >
                <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_5px_#00FFFF]"></div>
            </button>
            */}

            <button onClick={toggleMenu} className="cursor-pointer-grow text-brand-light focus:outline-none" aria-label="Abrir menú de navegación">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-brand-secondary overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <nav className="flex flex-col items-center p-4 space-y-4">
            
          {/* SASHA AI BUTTON - MOBILE MENU BIG (DISABLED) */}
          {/* 
          <button 
                onClick={openSashaAI}
                aria-label="Hablar con Sasha AI"
                className="w-full py-3 bg-brand-accent/10 border border-brand-accent/30 rounded-lg flex items-center justify-center gap-2 mb-2"
            >
                <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></div>
                <span className="text-sm font-bold text-white uppercase tracking-widest">
                    Hablar con Sasha
                </span>
            </button>  
          */}

          {content.navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-brand-light text-lg hover:text-brand-accent transition-colors duration-300">
              {link.name}
            </a>
          ))}
          <div className="flex items-center space-x-6 pt-4">
             {content.socialLinks.map(link => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`Síguenos en ${link.platform}`} className="text-brand-light hover:text-brand-accent transition-colors duration-300">
                    <SocialIcons platform={link.platform} className="w-6 h-6" />
                </a>
             ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
