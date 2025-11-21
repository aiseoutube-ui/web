
import React, { useState } from 'react';

const consistencyContent2 = {
  title: "Branding Intacto y Diversidad con IA",
  description: "Protegemos tu branding de los imprevistos de la vida real (como cambios físicos en el talento), asegurando una identidad visual coherente campaña tras campaña. A la vez, alterando ligeramente las especificaciones, la IA nos da la flexibilidad de crear personajes completamente nuevos y diversos cuando la marca lo pida.",
  slides: [
    {
      id: 0,
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjI8FzvcIlGAJx6qW6gh_MqEonxrVY6C6rEU1eNO5zTlYe9bBG5Hx0vySboyEjp3Dw5sISqG9IVvrECMYwVGeG5d7CH84rMAsUIq_fqXK-GQQtvoNuR0WNIE-MG4xl_1t0yjnXjOfULykDoxE-2vo9nAUSg0Qa2JXgMgNm1KzgoxvjHgX07gZakjNUACPd4/s1024/Whisk_d070730a5400704b5fb4b5943ce2594bdr.webp',
      title: 'Nueva Identidad',
      caption: 'Definiendo un nuevo arquetipo con una pose frontal y una estética diferente.'
    },
    {
      id: 1,
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVV9c3jgk2Dla-Z0N5TbIDSkgD2lUg7DbWcFvcwOol7gQqFrqcmX8nB8ymtz8hOsa_BO-lEnumStNFYthfyvP9dvYUgwm_t8Hlh15vt07ziGfhCWZAHMgxwJ7s1MHN-eiXJCc9_DhbvEzCh4IxrOWuF2T_oBvBTTdf2HRKBXRgVRVntnWV1cmsCV2e7YZw/s1024/Whisk_635d4b0904473a2afea4ace7ed2e387aeg.webp',
      title: 'Perfil Coherente',
      caption: 'Un ligero cambio de perfil que mantiene los rasgos faciales clave del nuevo personaje.'
    },
    {
      id: 2,
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhUVtEwy4ZSj4vsC4MAnBVJmRRuX2pWFRAbIGI9rtAy7YkNFDxYK_ZxzYwv2nLqlbxlx6Zbbj5JZknD9JXxq2tfJCCd7H4BEXUCo12qehsZeX50eKZ8gUVT-uLsDEqDrImQKXTz5krrV31ysCrcnpRrONnoVEvV29MQtoO1EhTSnVnrquSzCaysvM6VnmGw/s1024/Whisk_34a59944ac%20%281%29.webp',
      title: 'Ángulos Diversos',
      caption: 'La consistencia se prueba en diferentes ángulos, preservando la identidad visual.'
    },
    {
      id: 3,
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7sGrCF4dwOVg9IEdVDDY51JVUKD8XSpEa84uriGvvLUm17v6DotgfZ8-hxvLRuFzK4ZrNDAWkx2ZCdSCWkss2WO1Gr5Xy9JEo-FNerK2T82WjAxVvZ8qDtm22DmSw-9dFXFqpEzPG1iJoiV-aqG1XyFZH3xx2HlVLj6s3Jii9NNpEHMxbt0MzWxteCZyY/s1024/Whisk_322cf973d2%20%281%29.webp',
      title: 'Expresión',
      caption: 'Incluso con cambios en la expresión, la fisionomía del personaje se mantiene coherente.'
    },
    {
      id: 4,
      image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgidS97FS5gz72dkOvnUuXkP1sVvdYtur_gihbZKzcC_THctBUAQkQ4JORdsg8LsyYITAxVnc2UsPs2C-VNV8Ok7vkEpVfwzVKkDy9bykQmcscQWL4rWGf9oz3V7yvvw3Q3tUCy8cNy9UvkSn91iydMJM8dTsVNZsFOKdUc3csiru98zxaoGkpSxHlgka7M/s1024/Whisk_cff890c0e8%20%281%29.webp',
      title: 'Estabilidad Final',
      caption: 'Una pose final que reafirma la capacidad de la IA para mantener la consistencia.'
    },
  ]
};

const CharacterConsistency2: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="consistency2" className="section-reveal py-20 md:py-32 bg-brand-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{consistencyContent2.title}</h2>
            <p className="text-brand-light leading-relaxed">{consistencyContent2.description}</p>
        </div>

        {/* Accordion Container */}
        {/* Increased Mobile Height to 800px for better touch targets */}
        <div className="flex flex-col md:flex-row h-[800px] md:h-[600px] gap-2 md:gap-4">
          {consistencyContent2.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] 
                ${activeIndex === index ? 'flex-[3] md:flex-[3.5] opacity-100' : 'flex-[1] opacity-80 md:opacity-60 hover:opacity-80'}
              `}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.caption}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out"
                style={{
                   transform: activeIndex === index ? 'scale(1.05)' : 'scale(1.2)'
                }}
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 transition-opacity duration-500 
                ${activeIndex === index ? 'opacity-100' : 'opacity-0 md:opacity-40'}`} 
              />

              {/* Label (Inactive State) */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none
                 ${activeIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                  {/* Mobile: Horizontal (rotate-0), Desktop: Vertical (-rotate-90) */}
                  <span className="text-white/90 text-lg font-bold tracking-widest uppercase rotate-0 md:-rotate-90 whitespace-nowrap drop-shadow-md">
                      {slide.title}
                  </span>
              </div>

              {/* Content (Active State) */}
              <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-all duration-500 transform 
                ${activeIndex === index ? 'translate-y-0 opacity-100 delay-100' : 'translate-y-8 opacity-0'}`}
              >
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{slide.title}</h3>
                <p className="text-brand-light text-sm md:text-base leading-relaxed max-w-lg">
                    {slide.caption}
                </p>
                
                {/* Decorative Line */}
                <div className="w-12 h-1 bg-brand-accent mt-4 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CharacterConsistency2;
