import React, { useEffect, useRef } from 'react';

declare const Swiper: any;

const consistencyContent = {
  title: "Consistencia de Personaje con Nano Banana",
  description: "Gracias a los avances en la generación de imágenes, ahora podemos crear múltiples escenas y poses manteniendo la identidad y rasgos del personaje principal, una capacidad clave para la narrativa visual y el branding.",
  slides: [
    {
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh53GERrGpL1wOodX-JQAgyaVthDbppyFLPnjBadlJL5K5DnbcuMY-7KxyousjCfiQzidKjkkq89fmNRgoI7jEb30C96r4eBJY-H0QDrZvb_DGy5Yo1UQpzPLPR6wM3Lq0V3G0Uytxq5so7fOsIy9Rqtxuqw6stUce-xtETRpXEiZFGPtesAxalSG92Lx4/s1024/s1.webp',
      caption: 'Pose inicial de frente, estableciendo el look base.'
    },
    {
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiJZHuE4A-2iVSamm9dbEJQuKx62GKo9CZgdzTCwG0kTvyAZM8IhSDUfsWLjjFw9iTwHQAI4DFX1377sXyDrrkACbLJoBXhKAvOjng0sNUCVitIkn8Jkn-nNRpRXaax7tkjwXLXGcO-qdfSgRFogSXhyphenhyphenqR_xJ2HP_WgjkprfeTKtrqZ930PfvEsd6UCDIY/s1024/s2.webp',
      caption: 'Giro sutil, manteniendo la coherencia en el peinado y la ropa.'
    },
    {
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiMbxZ9waLS81b_l0wZ6HpoWb4t-tmLz_5zIw6DW5KwjqE_qUfP27R5GRvmbObyyBZqj5ohmrrUtaNd0kIipQ82n0Ai4Rhn5SByfFFsBUMHd0wLpgt-FXCEkR5caPMNou4exvUMV-sRVXLMgfEM4UuURgm-C18anGF1Qu1qaiyByby9cNCRexKxE8_NV33P/s1024/s3.webp',
      caption: 'Perfilado, demostrando consistencia en los rasgos faciales.'
    },
    {
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEidASlipok-_w2w4pwJp-GHSYAQbx8ovDDHKr8MiJ_dFPBJdgDQCiEaDLh5CZAZ1EFnBuFr2lacwu59GLFRDM6L2Np-oCsQf4H3DykNEZM01FEZixYenoBEnFnS7fZjE126JF98ALCUgoLPS3ODE68fHtH6VpkEeSbmAV1hCf7tWMcUTTLNro6OPeeJqxue/s1024/s4.webp',
      caption: 'Cambio de ángulo e iluminación, sin perder la identidad.'
    },
    {
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhHSPvkX4pzX0MVsywvr3054dTd2RYBC3msR76wwn7MPljBM3bozjbch_iL_hwGVTY_ebRx4HQG3ERFeSdfHaprPeF5jpVgDQOCQo84FMglMPGo0zIdZe69Hp7VGRkuJfNPydQZUnOF3-mN_sG0Ff0LvZ0mbimpRhre50c5vzAa0mQoTk2wejKKmNS7my83/s1024/s5.webp',
      caption: 'Pose final, confirmando la estabilidad del personaje.'
    },

{
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgrkdWU9RMUKpbl8VFg5MtHiOjafgrUOI-IoouFzrfZEB2L5TTTPsV8kPmqUUoT1zn2VdexEYQQdXyEUbTEHxIn41bwqt74-25hWQdcRIsJ-jr3QW8OJEdL2O_KMIHSF0otJF9vWpwmpVMaaVoJTFaFWHCYJuj7to2Axuu-Y-zaO0MrsKxddNJ6kgtjTHja/s1344/imagen-generada%20%2811%29.webp',
      caption: 'Pose final, confirmando la estabilidad del personaje.'
    },


  ]
};

const CharacterConsistency: React.FC = () => {
  const swiperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (swiperRef.current) {
      new Swiper(swiperRef.current, {
        loop: true,
        centeredSlides: true,
        slidesPerView: 1,
        spaceBetween: 20,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        },
      });
    }
  }, []);

  return (
    <section id="consistency" className="section-reveal pt-48 md:pt-64 pb-28 md:pb-40 bg-brand-secondary overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{consistencyContent.title}</h2>
            <p className="text-brand-light leading-relaxed">{consistencyContent.description}</p>
        </div>
        <div className="swiper" ref={swiperRef}>
          <div className="swiper-wrapper">
            {consistencyContent.slides.map((slide, index) => (
              <div key={index} className="swiper-slide">
                <div className="aspect-[9/16] rounded-lg overflow-hidden shadow-xl">
                    <img 
                        src={slide.image} 
                        alt={`Modelo pose ${index + 1}`} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                    />
                </div>
                <p className="mt-4 text-center text-brand-muted text-sm px-2 h-10">{slide.caption}</p>
              </div>
            ))}
          </div>
          <div className="swiper-pagination mt-8 relative !bottom-0"></div>
          <div className="swiper-button-prev cursor-pointer-grow"></div>
          <div className="swiper-button-next cursor-pointer-grow"></div>
        </div>
      </div>
    </section>
  );
};

export default CharacterConsistency;