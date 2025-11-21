import React, { useRef, useEffect } from 'react';
import type { GalleryItem } from '../types';
import { PlayIcon, PhotographIcon } from './icons/MediaIcons';

// GSAP is loaded from CDN, declare for TS
declare const gsap: any;
declare const ScrollTrigger: any;

interface GalleryProps {
  content: GalleryItem[];
  onOpenModal: (item: GalleryItem) => void;
}

const Gallery: React.FC<GalleryProps> = ({ content, onOpenModal }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    const anim = gsap.to(titleRef.current, {
      skewX: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: titleRef.current.parentElement, // Trigger on the whole section
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1, // Smooth scrubbing
      }
    });

    return () => {
      // Clean up GSAP instances
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    }
  }, []);

  return (
    <section id="gallery" className="section-reveal py-20 md:py-32 bg-brand-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">Galería de Proyectos</h2>
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 lg:gap-6">
          {content.map((item) => (
            <div
              key={item.id}
              className="group relative mb-4 lg:mb-6 break-inside-avoid cursor-pointer overflow-hidden rounded-lg cursor-pointer-grow"
              onClick={() => onOpenModal(item)}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-500 ease-in-out flex flex-col justify-end p-6">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
                    <div className="mb-2">
                        {item.type === 'video' ? <PlayIcon className="w-8 h-8 text-white opacity-80" /> : <PhotographIcon className="w-8 h-8 text-white opacity-80" />}
                    </div>
                    <h3 className="text-white text-xl font-bold ">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;