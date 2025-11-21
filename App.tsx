import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import type { GalleryItem } from './types';
import { content } from './cms/content';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import ImpactMetrics from './components/ImpactMetrics';
import Comparison from './components/Comparison';
import CharacterConsistency from './components/CharacterConsistency';
import CharacterConsistency2 from './components/CharacterConsistency2';
import Gallery from './components/Gallery';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';
// Import CustomCursor directly as it's needed for UI feel immediately
import CustomCursor from './components/CustomCursor';
import ScrollIndicator from './components/ScrollIndicator';

// Lazy load modal as it's not needed on initial load
const Modal = lazy(() => import('./components/Modal'));

// GSAP & other libraries are loaded from CDN, so we declare them globally for TypeScript
declare const gsap: any;
declare const ScrollTrigger: any;

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    const initializeApp = () => {
        // GSAP PLUGINS REGISTRATION
        gsap.registerPlugin(ScrollTrigger);

        // ANIMATE SECTIONS ON SCROLL WITH CLIP-PATH
        const sections = gsap.utils.toArray('.section-reveal');
        sections.forEach((section: any) => {
          gsap.set(section, { autoAlpha: 1 }); // Make sure it's visible for clip-path to work
          gsap.fromTo(section, 
            { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }, 
            {
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
              duration: 1.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        });

        // Trigger hero text animation immediately
        window.dispatchEvent(new CustomEvent('startHeroTextAnimation'));
        
        ScrollTrigger.refresh();
        
        cleanup = () => {
            ScrollTrigger.getAll().forEach((st: any) => st.kill());
        };
    };
    
    window.addEventListener('preloaderFinished', initializeApp);

    return () => {
        window.removeEventListener('preloaderFinished', initializeApp);
        cleanup?.();
    }
  }, []);


  const handleOpenModal = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <>
      <CustomCursor />
      <div ref={mainRef} className="bg-brand-primary font-sans antialiased overflow-x-hidden">
        <Header content={content.header} />
        <main>
          <Hero content={content.hero} isLoaded={true} />
          <About content={content.about} />
          <ImpactMetrics />
          <Comparison />
          <CharacterConsistency />
          <CharacterConsistency2 />
          <Gallery content={content.gallery} onOpenModal={handleOpenModal} />
          <Team content={content.team} />
          <Contact content={content.contact} />
        </main>
        <Footer content={content.footer} />
        <ScrollIndicator />
        {selectedItem && (
          <Suspense fallback={null}>
             <Modal item={selectedItem} onClose={handleCloseModal} />
          </Suspense>
        )}
      </div>
    </>
  );
};

export default App;