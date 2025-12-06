
import React, { useRef, useEffect, useState } from 'react';
import type { HeroContent } from '../types';

declare const gsap: any;
declare const SplitText: any;
declare const ScrollTrigger: any;

interface HeroProps {
  content: HeroContent;
  isLoaded: boolean;
}

const Hero: React.FC<HeroProps> = ({ content, isLoaded }) => {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  
  // Estado para controlar si el video terminó
  const [isEnded, setIsEnded] = useState(false);
  // Estado para usuarios recurrentes (Intro ya vista)
  const [showReplayOption, setShowReplayOption] = useState(false);
  
  // Refs para control interno sin re-renderizar
  const animationStarted = useRef(false);
  const isPreloaderFinished = useRef(false);
  const userInteracted = useRef(false);

  // --- LÓGICA DE VIDEO Y AUDIO ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Detectar si ya vio la intro (localStorage set en index.html)
    const hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true';

    // 1. Desbloqueo inicial (Clic en el Orbe)
    const handleUnlock = () => {
        userInteracted.current = true;
        video.volume = 0;
        video.play().then(() => {
            video.pause();
            video.currentTime = 0;
        }).catch(e => console.log("Unlock video failed", e));
    };

    // 2. Inicio real (Fin del Preloader)
    const handlePlay = () => {
        isPreloaderFinished.current = true;
        video.volume = 0; 
        video.currentTime = 0;
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                gsap.to(video, { volume: 0.8, duration: 2 });
            }).catch(error => {
                console.warn("Auto-play prevented", error);
                video.muted = true;
                video.play();
            });
        }
    };

    if (hasSeenIntro) {
        // SI YA VIO LA INTRO: No agregamos listeners de auto-play.
        // Mostramos el botón discreto para volver a ver.
        setShowReplayOption(true);
        // Forzamos que el texto aparezca inmediatamente sin esperar video
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('startHeroTextAnimation'));
        }, 100);
    } else {
        // SI ES NUEVO: Agregamos listeners para el flujo normal
        window.addEventListener('unlockMedia', handleUnlock);
        window.addEventListener('preloaderFinished', handlePlay);
    }

    // 3. Lógica de SCROLL
    const ctx = gsap.context(() => {
        ScrollTrigger.create({
            trigger: heroRef.current,
            start: "top top",
            end: "bottom center",
            
            onLeave: () => {
                if (!video.paused && !isEnded) {
                    gsap.to(video, { volume: 0, duration: 0.5, onComplete: () => video.pause() });
                }
            },
            onEnterBack: () => {
                // Solo reproducir si NO ha terminado Y NO es un usuario recurrente que lo tiene pausado a propósito
                if (isPreloaderFinished.current && !isEnded && !showReplayOption) {
                    video.play().then(() => {
                        gsap.to(video, { volume: 0.8, duration: 1 });
                    }).catch(() => {});
                }
            }
        });
    }, heroRef);

    return () => {
        window.removeEventListener('unlockMedia', handleUnlock);
        window.removeEventListener('preloaderFinished', handlePlay);
        ctx.revert();
    };
  }, [isEnded, showReplayOption]); 

  // --- MANEJADOR DE FIN DE VIDEO ---
  const handleVideoEnded = () => {
    setIsEnded(true);
    if (videoRef.current) {
        videoRef.current.pause();
    }
  };

  // --- FUNCIÓN REPLAY ---
  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsEnded(false);
    setShowReplayOption(false); // Ocultamos el botón pequeño si existe
    isPreloaderFinished.current = true; // Marcamos como listo para permitir scroll logic

    video.currentTime = 0;
    video.volume = 0;
    video.play().then(() => {
        gsap.to(video, { volume: 0.8, duration: 1 });
    });
  };

  // --- ANIMACIÓN DE TEXTOS ---
  useEffect(() => {
    if (!isLoaded) return;

    const runTextAnimation = () => {
      if (!titleRef.current || animationStarted.current) return;
      animationStarted.current = true;
      
      try {
        gsap.set([subtitleRef.current, ctaRef.current], { opacity: 1 });
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        
        if (typeof (window as any).SplitText === 'function') {
            const split = new (window as any).SplitText(titleRef.current, { type: "chars, words" });
            tl.from(split.chars, {
              opacity: 0,
              y: 80,
              rotateX: -90,
              stagger: 0.03
            }, "+=0.2");
        } else {
             tl.from(titleRef.current, { opacity: 0, y: 50, duration: 1 }, "+=0.2");
        }

        tl.from(subtitleRef.current, { y: 30, opacity: 0, duration: 1.2 }, "-=1.2")
          .from(ctaRef.current, { y: 30, opacity: 0, duration: 1.2 }, "-=0.9");
      } catch (error) {
        console.error("Animation error:", error);
        gsap.to([titleRef.current, subtitleRef.current, ctaRef.current], { opacity: 1, y: 0, duration: 0.5 });
      }
    };

    let intervalId: number;
    const checkSplitText = () => {
      if (typeof (window as any).SplitText === 'function') {
        clearInterval(intervalId);
        window.addEventListener('startHeroTextAnimation', runTextAnimation);
      }
    };
    intervalId = window.setInterval(checkSplitText, 100);
    
    // Fallback trigger if event doesn't fire fast enough
    setTimeout(() => {
        if(!animationStarted.current) {
             window.dispatchEvent(new CustomEvent('startHeroTextAnimation'));
        }
    }, 2000);

    const parallaxInstance = gsap.to(".hero-video", {
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      yPercent: 30,
      ease: "none"
    });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('startHeroTextAnimation', runTextAnimation);
      if (parallaxInstance.scrollTrigger) {
        parallaxInstance.scrollTrigger.kill();
      }
      parallaxInstance.kill();
    };
  }, [isLoaded]);

  return (
    <section id="hero" ref={heroRef} className="relative h-[100dvh] w-full flex items-center justify-center text-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className={`hero-video absolute top-0 left-0 w-full h-full object-contain bg-black transition-opacity duration-1000 ${isEnded ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          src={content.backgroundVideoUrl}
          playsInline
          // @ts-ignore
          webkit-playsinline="true"
          onEnded={handleVideoEnded}
        />
        <div className="absolute inset-0 bg-brand-primary opacity-60"></div>
      </div>
      
      {/* ELIMINADO EL BOTÓN GRANDE CENTRAL DE REPLAY */}
      
      <div className={`relative z-10 px-4 w-full max-w-5xl mx-auto transition-all duration-500 ${isEnded ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
        <div className="hero-content-anim">
            <h1 ref={titleRef} className="text-4xl md:text-6xl lg:text-7xl font-strasua text-white mb-4 leading-tight tracking-wide">
              {content.title}
            </h1>
            <p ref={subtitleRef} className="text-lg md:text-xl lg:text-2xl text-brand-light max-w-3xl mx-auto mb-8 px-4" style={{ opacity: 0 }}>
              {content.subtitle}
            </p>
            
            <div className="flex flex-col items-center gap-6">
                <a ref={ctaRef} href={content.ctaLink} className="cursor-pointer-grow inline-block bg-brand-accent text-brand-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,255,0.3)]" style={{ opacity: 0 }}>
                {content.ctaText}
                </a>

                {/* BOTÓN REPLAY PEQUEÑO (Para usuarios recurrentes que no vieron auto-play) */}
                {showReplayOption && (
                    <button 
                        onClick={handleReplay}
                        className="animate-fade-in-up text-xs font-mono text-white/40 hover:text-brand-accent uppercase tracking-[0.2em] border-b border-transparent hover:border-brand-accent transition-all pb-1 flex items-center gap-2 cursor-pointer-grow"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                        Ver Intro Completa
                    </button>
                )}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
