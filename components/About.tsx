
import React, { useRef, useEffect } from 'react';
import type { AboutContent } from '../types';

declare const gsap: any;
declare const ScrollTrigger: any;

interface AboutProps {
  content: AboutContent;
}

const About: React.FC<AboutProps> = ({ content }) => {
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imageRef.current) return;
        gsap.fromTo(imageRef.current, 
            { yPercent: -10, ease: 'none' },
            {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: {
                    trigger: imageRef.current.parentElement,
                    scrub: true,
                }
            }
        );
    }, []);

  return (
    <section id="about" className="section-reveal py-20 md:py-32 bg-brand-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="overflow-hidden rounded-lg">
             <img ref={imageRef} src={content.imageUrl} alt="About the project" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{content.title}</h2>
            {content.paragraphs.map((p, index) => (
              <p key={index} className="text-brand-light mb-4 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
