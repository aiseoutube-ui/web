
import React, { useRef, useEffect } from 'react';
import type { HeroContent } from '../types';

declare const gsap: any;
declare const SplitText: any;

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
  const animationStarted = useRef(false);

  useEffect(() => {
    // Manejo de reproducción de Video con Audio
    const video = videoRef.current;
    if (video) {
        // 1. Cuando el usuario hace clic en el orbe, desbloqueamos el audio
        const handleUnlock = () => {
            video.volume = 0;
            video.play().then(() => {
                video.pause();
                video.currentTime = 0;
            }).catch(e => console.log("Unlock video failed", e));
        };

        // 2. Cuando termina el preloader, reproducimos con sonido
        const handlePlay = () => {
            video.volume = 0; // Empezar en 0 para fade in
            video.currentTime = 0;
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Fade in del audio para que sea elegante
                    gsap.to(video, { volume: 0.8, duration: 2 });
                }).catch(error => {
                    console.warn("Auto-play prevented, falling back to muted", error);
                    video.muted = true;
                    video.play();
                });
            }
        };

        window.addEventListener('unlockMedia', handleUnlock);
        window.addEventListener('preloaderFinished', handlePlay);

        return () => {
            window.removeEventListener('unlockMedia', handleUnlock);
            window.removeEventListener('preloaderFinished', handlePlay);
        };
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const runTextAnimation = () => {
      if (!titleRef.current || animationStarted.current) return;
      animationStarted.current = true;
      
      try {
        gsap.set([subtitleRef.current, ctaRef.current], { opacity: 1 });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        
        // Fallback if SplitText is not available
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
      // We check for SplitText OR if a timeout passes to just run the fallback
      if (typeof (window as any).SplitText === 'function') {
        clearInterval(intervalId);
        window.addEventListener('startHeroTextAnimation', runTextAnimation);
      }
    };
    intervalId = window.setInterval(checkSplitText, 100);
    
    // Safety timeout to run animation even if scripts lag
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
    // Changed h-screen to h-[100dvh] for better mobile browser support
    <section id="hero" ref={heroRef} className="relative h-[100dvh] w-full flex items-center justify-center text-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="hero-video absolute top-0 left-0 w-full h-full object-contain bg-black"
          src={content.backgroundVideoUrl}
          playsInline
          // @ts-ignore
          webkit-playsinline="true" 
          // Removed autoPlay, loop, and muted to handle programmatically
        />
        <div className="absolute inset-0 bg-brand-primary opacity-60"></div>
      </div>
      
      <div className="relative z-10 px-4 w-full max-w-5xl mx-auto">
        <div className="hero-content-anim">
            <h1 ref={titleRef} className="text-4xl md:text-6xl lg:text-7xl font-strasua text-white mb-4 leading-tight tracking-wide">
              {content.title}
            </h1>
            <p ref={subtitleRef} className="text-lg md:text-xl lg:text-2xl text-brand-light max-w-3xl mx-auto mb-8 px-4" style={{ opacity: 0 }}>
              {content.subtitle}
            </p>
            <a ref={ctaRef} href={content.ctaLink} className="cursor-pointer-grow inline-block bg-brand-accent text-brand-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,255,0.3)]" style={{ opacity: 0 }}>
              {content.ctaText}
            </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
