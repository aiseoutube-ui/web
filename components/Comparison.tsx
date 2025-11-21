
import React, { useEffect, useRef, useState } from 'react';

declare const gsap: any;

// Content for the new process showcase section
const processContent = {
  title: "From Idea to Motion",
  simplePrompt: "A dynamic, photorealistic video of a whisk mixing ingredients in a bowl, creating a delicious sauce, with dramatic lighting.",
  technicalPrompt: "Cinematic, ultra-realistic photo, Kodak Portra 400 film. Mood: pensive, mysterious.A 50-year-old rugged man with a backpack and a small white robot stand back to viewer on a grassy hill, sharp focus.Background: A smooth, flat, non-reflective, luminous green chroma key studio wall, no distortions.Dramatic low-key lighting silhouettes man and robot against the uniform green.Foreground grass softly lit with gentle shadows.Shallow depth of field: man/robot extremely sharp, chroma key flat in soft focus.Slightly high-angle shot, muted greens on hill and bright chroma key.",
  steps: [
    {
      id: 1,
      title: "1. Generating Key Assets",
      description: "The main subject, the whisk, is generated with precise detail and realistic textures based on the prompt's description."
    },
    {
      id: 2,
      title: "2. Building the Scene",
      description: "Next, the environment and other elements are created, like this bowl with raw ingredients, ready for action."
    },
    {
      id: 3,
      title: "3. Compositing a Keyframe",
      description: "The elements are combined into a single, cohesive image that serves as the visual anchor and starting point for the animation."
    },
    {
      id: 4,
      title: "4. Animating the Final Shot",
      description: "Finally, the keyframe is brought to life. The AI generates the motion, creating a fluid and captivating video sequence."
    }
  ],
  assets: {
    image2: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjz2KndddO5ApH9P2Ic8li8zIdMYMxyhCxxXlJPDFXA1zSNNGI0szA6DGTxIvfT_zUtsJfAK-UHRtdVP9CzksJePX9Rj_n15LBQAsDUbJLYuRPaBV9U2UjsbFcBbKiMR6GmldN3TcoxG-tE_XHZzVwRGBTABRRINB-m7yi_-jcBLObtXwOzS49DwcJxBpZ1/s1600/Gemini_Generated_Image_k0e5hek0e5hek0e5.png',
    image3: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhW0C7_WUTw0stvYIc9HhhzTlcQpuv48Z9FnRSu9UmOGGWzJhms8AxwHvBmN89KbEf5Q-2RznNiUYjXoogyTmKT8ZmGybwb2jFwOTg06mT-yks6iKzmAtXpphV6XJMsHzlVbkQ4vM7l3laqwh5yQsZcitAcB2uF9cvnO9NVBptbIPOsw2TwaP8jkiZUK6b4/s1600/Whisk_6c2b320cb27dbe58ebc41b7da48239a3dr.png',
    image4: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjmC96iMf3DZLTRaXmHYSqXBzAi5FtqWc1h_r7LKFszk4lyfhzHcXOZ-s1jPmSruo_2tsD-T8xDx7AWgMtf7XEG2aQOXTWw1hXLENkqLZtm7vgD9mSYNDRrc4OdUrylJQqffFWiZgFflbF6HRKTkg5uT33Oa21SPsfAB_SUYncuSvBDkv3dVP2Qy2kdJsxT/s1600/Gemini_Generated_Image_k0e5hek0e5hek0e5%20%280-00-00-00%29.png',
    video: 'https://aiseoutube-ui.github.io/thelastart/video.mp4'
  }
};

const Comparison: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const pinnedContainerRef = useRef<HTMLDivElement>(null);
    const videoMediaRef = useRef<HTMLVideoElement>(null);
    const [typedText, setTypedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    
    useEffect(() => {
        if (!sectionRef.current || !pinnedContainerRef.current) return;

        const textSteps = gsap.utils.toArray('.step-content', sectionRef.current);
        const simplePromptContainer = pinnedContainerRef.current.querySelector('.simple-prompt-container');
        const technicalPromptContainer = pinnedContainerRef.current.querySelector('.technical-prompt-container');
        const image2El = pinnedContainerRef.current.querySelector('.image2-el');
        const image3El = pinnedContainerRef.current.querySelector('.image3-el');
        const image4El = pinnedContainerRef.current.querySelector('.image4-el');
        const videoEl = pinnedContainerRef.current.querySelector('.video-el');

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    pin: pinnedContainerRef.current,
                    scrub: 1, // Increased scrub for smoother, heavier feel
                    start: 'top top',
                    end: `+=${window.innerHeight * 15}` // Increased to 15x for much slower pacing
                }
            });

            // Set initial states
            gsap.set(textSteps, { opacity: 0 });
            gsap.set([simplePromptContainer, technicalPromptContainer, image2El, image3El, image4El, videoEl], { opacity: 0 });
            gsap.set([image2El, image3El, image4El, videoEl], { scale: 0.95 });
            setTypedText('');
            setShowCursor(true);

            // 1. Simple prompt appears
            tl.to(simplePromptContainer, { opacity: 1, duration: 2 });
            
            // 2. Technical prompt types out
            tl.to(technicalPromptContainer, { opacity: 1, duration: 0.5 }, "<");
            const fullText = processContent.technicalPrompt;
            const proxy = { value: 0 };
            tl.to(proxy, {
                value: fullText.length,
                duration: 4, 
                ease: 'none',
                onUpdate: () => {
                    setTypedText(fullText.substring(0, Math.ceil(proxy.value)));
                },
                onComplete: () => {
                    setShowCursor(false);
                }
            }, "+=0.5");

            // 3. Pause, then fade out both prompts
            tl.to([simplePromptContainer, technicalPromptContainer], { opacity: 0, duration: 1 }, "+=1");

            // 4. Text Step 1 & Image 2 appear
            tl.to(textSteps[0], { opacity: 1, duration: 2 }, "+=0.5")
              .to(image2El, { opacity: 1, scale: 1, duration: 2 }, "<");

            // 5. Fade out step 1, fade in step 2 & image 3
            tl.to(textSteps[0], { opacity: 0, duration: 1 }, "+=2") 
              .to(textSteps[1], { opacity: 1, duration: 2 }, "<")
              .to(image2El, { opacity: 0, duration: 1 }, "<")
              .to(image3El, { opacity: 1, scale: 1, duration: 2 }, "<+=0.2");

            // 6. Fade out step 2, fade in step 3 & image 4
            tl.to(textSteps[1], { opacity: 0, duration: 1 }, "+=2")
              .to(textSteps[2], { opacity: 1, duration: 2 }, "<")
              .to(image3El, { opacity: 0, duration: 1 }, "<")
              .to(image4El, { opacity: 1, scale: 1, duration: 2 }, "<+=0.2");

            // 7. Fade out step 3, fade in step 4 & video
            tl.to(textSteps[2], { opacity: 0, duration: 1 }, "+=2")
              .to(textSteps[3], { opacity: 1, duration: 2 }, "<")
              .to(image4El, { opacity: 0, scale: 0.95, duration: 1 }, "<")
              .to(videoEl, { 
                opacity: 1, 
                scale: 1, 
                duration: 2, 
                onStart: () => videoMediaRef.current?.play().catch(e => console.error("Video play failed", e)) 
              }, "<+=0.2");
              
            // Add a final pause
            tl.to({}, {duration: 3});

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative bg-brand-primary">
            {/* Using min-h-[100dvh] helps mobile browsers address bar resizing */}
            <div ref={pinnedContainerRef} className="min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-20 items-center">
                    
                    {/* Left side: Text content */}
                    <div className="z-10 relative order-2 md:order-1">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-8">{processContent.title}</h2>
                        <div className="relative min-h-[12rem] md:min-h-[10rem]">
                            {/* Container for initial simple prompt */}
                            <div className="simple-prompt-container absolute top-0 left-0 w-full">
                                <div className="bg-brand-secondary/50 p-4 md:p-6 rounded-lg backdrop-blur-sm border border-white/10">
                                    <p className="text-brand-accent font-mono text-xs md:text-sm mb-2">// PROMPT</p>
                                    <p className="text-brand-light leading-relaxed text-sm md:text-base">{processContent.simplePrompt}</p>
                                </div>
                            </div>
                            {/* Container for subsequent steps */}
                            {processContent.steps.map(step => (
                                <div key={step.id} className="step-content absolute top-0 left-0 w-full">
                                    <h3 className="text-xl md:text-2xl font-bold text-white mt-2 mb-2">{step.title}</h3>
                                    <p className="text-brand-muted text-sm md:text-base">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Media stage */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black/20 shadow-2xl shadow-brand-accent/10 order-1 md:order-2">
                        {/* Container for technical prompt */}
                        <div className="technical-prompt-container absolute inset-0 p-4 sm:p-6 bg-black/50 flex items-center justify-center font-mono text-[10px] sm:text-sm text-brand-accent leading-relaxed">
                          <p>{typedText}{showCursor && <span className="animate-pulse">|</span>}</p>
                        </div>

                        <div className="image2-el absolute inset-0">
                            <img 
                              src={processContent.assets.image2} 
                              alt="Generated whisk asset" 
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="image3-el absolute inset-0">
                            <img 
                              src={processContent.assets.image3} 
                              alt="Generated bowl with ingredients" 
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="image4-el absolute inset-0">
                            <img 
                              src={processContent.assets.image4} 
                              alt="Composited keyframe" 
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="video-el absolute inset-0">
                            <video ref={videoMediaRef} className="w-full h-full object-cover" src={processContent.assets.video} muted loop playsInline></video>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Comparison;
