
import React, { useEffect, useRef } from 'react';

declare const gsap: any;

const metrics = [
  {
    id: 1,
    value: 80,
    suffix: '%',
    label: 'Ahorro de Recursos',
    description: 'Reducción drástica en costos de producción sin sacrificar la calidad visual.',
  },
  {
    id: 2,
    value: 70,
    suffix: '%',
    label: 'Más Rápido',
    description: 'Aceleración del flujo de trabajo. De la idea al render final en tiempo récord.',
  },
  {
    id: 3,
    value: 100,
    suffix: '%',
    label: 'Creatividad Liberada',
    description: 'Eliminamos las barreras técnicas. Si puedes imaginarlo, podemos crearlo.',
  }
];

const ImpactMetrics: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. SETUP INITIAL STATE (Force hidden immediately)
      gsap.set('.metric-card', { 
        autoAlpha: 0, 
        y: 100, 
        scale: 0.6, 
        rotationX: -45 
      });

      // 2. ENTRADA CINEMÁTICA (WOW FACTOR)
      gsap.to('.metric-card', {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: 'elastic.out(1, 0.75)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%', // Waits until the section is 65% into the viewport (more strict)
            toggleActions: 'play none none reverse' // Reverses if you scroll back up
          }
        }
      );

      // 3. ANIMACIÓN DE NÚMEROS (COUNT UP)
      metrics.forEach((metric) => {
        const counter = { val: 0 };
        const element = document.getElementById(`counter-${metric.id}`);
        
        if (element) {
            gsap.to(counter, {
                val: metric.value,
                duration: 2.5, 
                ease: 'power2.out', 
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 65%', // Sync with cards
                    toggleActions: 'play none none reverse'
                },
                onUpdate: () => {
                    element.innerText = Math.floor(counter.val) + metric.suffix;
                }
            });
        }
      });

      // 4. ANIMACIÓN DE FONDO (PULSO)
      gsap.to('.bg-blob', {
        y: 'random(-30, 30)',
        x: 'random(-30, 30)',
        scale: 'random(0.9, 1.2)',
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 1
      });

    }, sectionRef);

    // 5. EFECTO SPOTLIGHT INTERACTIVO (MOUSE MOVE)
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardsRef.current) return;
      
      const cards = cardsRef.current.getElementsByClassName('metric-card');
      
      for (const card of cards as any) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section id="impact" ref={sectionRef} className="py-24 md:py-40 bg-brand-primary relative overflow-hidden perspective-1000">
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="bg-blob absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px]"></div>
        <div className="bg-blob absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-block mb-4 overflow-hidden">
             <h2 className="text-sm font-bold text-brand-accent tracking-[0.3em] uppercase animate-fade-in-up">
                La Ventaja Competitiva
             </h2>
          </div>
          <h3 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
            Tú marcas el rumbo <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-white">La IA la materializa.</span>
          </h3>
          <p className="text-brand-light/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Recupera el control total. Nuestra tecnología elimina la fricción técnica para que tu equipo pueda enfocarse 100% en dirigir, imaginar y crear, mientras nosotros nos encargamos de hacerlo posible.
          </p>
        </div>

        {/* Cards Grid with Spotlight Effect */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 lg:gap-8 perspective-1000">
          {metrics.map((metric) => (
            <div 
              key={metric.id} 
              className="metric-card group relative bg-brand-secondary/30 border border-white/10 rounded-2xl p-8 md:p-10 overflow-hidden transition-transform duration-300 hover:-translate-y-2 will-change-transform"
              style={{
                // @ts-ignore - Custom CSS variables for the spotlight effect
                '--mouse-x': '0px',
                '--mouse-y': '0px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Spotlight Gradient Layer */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0, 255, 255, 0.15), transparent 40%)`
                }}
              />
              
              {/* Border Spotlight */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                    background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(0, 255, 255, 0.4), transparent 40%)`,
                    padding: '1px',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-6 flex items-baseline">
                    {/* Responsive Font Size: 5xl on mobile, 7xl on desktop */}
                    <span 
                        id={`counter-${metric.id}`} 
                        className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                    >
                        0%
                    </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    {metric.label}
                    <svg className="w-5 h-5 text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </h4>
                <p className="text-brand-muted leading-relaxed text-sm md:text-base group-hover:text-brand-light transition-colors duration-300">
                    {metric.description}
                </p>
              </div>
              
              {/* Decorative Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactMetrics;
