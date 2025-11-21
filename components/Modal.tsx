import React, { useEffect, useRef } from 'react';
import type { GalleryItem } from '../types';

declare const gsap: any;

interface ModalProps {
  item: GalleryItem;
  onClose: () => void;
}

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

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={backdropRef} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer-grow" onClick={handleClose}></div>
      <div ref={contentRef} className="relative bg-brand-secondary rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex-shrink-0 relative">
          {item.type === 'image' ? (
            <img src={item.src} alt={item.title} className="w-full h-auto max-h-[70vh] object-contain" />
          ) : (
            <video src={item.src} autoPlay loop controls className="w-full h-auto max-h-[70vh] object-contain"></video>
          )}
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
          <p className="text-brand-light">{item.description}</p>
        </div>
        <button onClick={handleClose} className="cursor-pointer-grow absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Modal;