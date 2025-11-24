import React, { useEffect, useRef } from 'react';
import type { GalleryItem } from '../types';

declare const gsap: any;

interface ModalProps {
  item: GalleryItem;
  onClose: () => void;
}

// Helper to detect and format embed URLs
const getEmbedUrl = (url: string): { url: string; isEmbed: boolean } => {
  // YouTube Detection
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    // Adding origin can help with some embed restrictions and error 153
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return { 
        url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${origin}`, 
        isEmbed: true 
    };
  }

  // Vimeo Detection
  const vimeoMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`, isEmbed: true };
  }

  // Fallback for standard video files
  return { url: url, isEmbed: false };
};

const Modal: React.FC<ModalProps> = ({ item, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.inOut' })
      .fromTo(contentRef.current, { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, "-=0.3");
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(contentRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.3, ease: 'power2.in' })
      .to(backdropRef.current, { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, "-=0.1");
  };

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { url, isEmbed } = item.type === 'video' ? getEmbedUrl(item.src) : { url: item.src, isEmbed: false };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={backdropRef} className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer-grow" onClick={handleClose}></div>
      
      <div ref={contentRef} className="relative bg-black border border-white/10 rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Media Container - Handles Aspect Ratio */}
        <div className="relative w-full flex-shrink-0 bg-black flex items-center justify-center">
          {item.type === 'image' ? (
            <img src={url} alt={item.title} className="w-full h-auto max-h-[70vh] object-contain" />
          ) : isEmbed ? (
            <div className="w-full aspect-video">
                <iframe 
                    src={url} 
                    title={item.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
          ) : (
            <video src={url} autoPlay loop controls className="w-full h-auto max-h-[70vh] object-contain"></video>
          )}
        </div>

        {/* Info Footer */}
        <div className="flex-1 p-6 bg-brand-secondary/50 backdrop-blur-sm border-t border-white/5">
          <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-brand-light text-sm md:text-base">{item.description}</p>
              </div>
              <button onClick={handleClose} className="text-brand-muted hover:text-brand-accent transition-colors">
                  <span className="sr-only">Cerrar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
          </div>
        </div>

        {/* Close Button Overlay (Top Right) */}
        <button onClick={handleClose} className="cursor-pointer-grow absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-brand-accent hover:text-black transition-all z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Modal;