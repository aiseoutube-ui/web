import React, { useState, useEffect, useRef } from 'react';

const ScrollIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Esta función se llama con cualquier interacción del usuario.
    const handleUserInteraction = () => {
      // Oculta el indicador inmediatamente.
      setIsVisible(false);

      // Limpia el temporizador anterior para reiniciar el período de inactividad.
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      // Establece un nuevo temporizador. Después de 3 segundos de inactividad, comprueba si debemos mostrar el indicador.
      idleTimerRef.current = window.setTimeout(() => {
        // Comprueba si el usuario está cerca del final de la página.
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
        
        // Muestra el indicador solo si el usuario NO está al final.
        if (!isAtBottom) {
          setIsVisible(true);
        }
      }, 3000); // 3 segundos de inactividad
    };

    // Eventos que cuentan como interacción del usuario.
    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove', 
      'mousedown', 
      'touchstart', 
      'keydown', 
      'scroll'
    ];
    
    // Adjunta los listeners de eventos para todas las acciones especificadas.
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserInteraction, { passive: true });
    });

    // Se ejecuta una vez al inicio para establecer el estado inicial correcto.
    handleUserInteraction();

    // Función de limpieza para eliminar los listeners y el temporizador cuando el componente se desmonta.
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserInteraction);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []); // El array de dependencias vacío asegura que este efecto se ejecute solo una vez al montar.

  const handleScrollDown = () => {
    // Desplaza la página hacia abajo en una cantidad equivalente al 80% de la altura de la ventana para una sensación más suave.
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={handleScrollDown}
      aria-label="Desplazarse hacia abajo"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center cursor-pointer-grow transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-70 hover:opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <span className="text-white font-sans text-sm font-semibold tracking-wider mb-2">SCROLL DOWN</span>
      <svg
        width="40"
        height="20"
        viewBox="0 0 40 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-bounce"
      >
        <path
          d="M2 2L20 18L38 2"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ScrollIndicator;
