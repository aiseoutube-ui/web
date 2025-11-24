import type { CMSContent } from '../types';

export const content: CMSContent = {
  header: {
    logoUrl: 'https://aiseoutube-ui.github.io/Tap/logo.svg', // Placeholder, using text for now
    navLinks: [
      { name: 'Inicio', href: '#hero' },
      { name: 'Ventajas', href: '#impact' },
      { name: 'Proceso', href: '#comparison' },
      { name: 'Galería', href: '#gallery' },
      { name: 'Equipo', href: '#team' },
      { name: 'Contacto', href: '#contact' },
    ],
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
    ],
  },
  hero: {
    backgroundVideoUrl: 'https://aiseoutube-ui.github.io/thelastart/video.mp4',
    title: '',
    subtitle: 'Agencia creativa especializada en Inteligencia Artificial. Fusionamos arte y algoritmos para liberar el potencial de tu marca.',
    ctaText: 'Ver el Impacto',
    ctaLink: '#impact',
  },
  about: {
    title: 'Sobre el Proyecto',
    paragraphs: [
      'Somos una casa realizadora de vanguardia que aprovecha el poder de la inteligencia artificial para redefinir los límites de la creatividad. Nuestro Site The Last Art es un escaparate de esta visión.',
      'Aquí, exploramos y exhibimos contenido visual generado por IA, desde imágenes surrealistas hasta secuencias de video dinámicas, todo curado para inspirar y sorprender. Cada pieza es un testimonio de la colaboración entre la mente humana y la máquina.',
    ],
    imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgs1qGXV4xNbXKX71cOIHIzasdSX1siu2j239TemtO1C9c7-LXzSRJAQZ1VCuC2g9GkS5EsDvKkHKR2qBWm_XD2iHNA8qvqrjUlNGDbae7R7Rdz023xdnAv-J3ItXTpvBF6VeMsIvqbnSPzZPI6U961wnfVBWEXdn6vHqbAdYrZn-siiFqv9UdgmE8fuv6p/s1280/Adobe%20Express%20-%20file.jpg',
  },
  gallery: [
    { id: 1, type: 'video', thumbnail: 'https://img.youtube.com/vi/i_vfh_kB7i4/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=i_vfh_kB7i4', title: 'LOMO SALTADO: La Receta Perfecta y Definitiva', description: 'Descubre cómo hacer el Lomo Saltado Peruano perfecto, el plato más emblemático del Perú.' },
    // VIDEO 1: YouTube (Link CORREGIDO: ID LXb3EKWsInQ permite embedding)
    { id: 2, type: 'video', thumbnail: 'https://img.youtube.com/vi/vPJNx3g2MBA/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=vPJNx3g2MBA', title: 'Aji con Limon Tv | Humor Peruano', description: 'Sketches de Humor Peruano: Historias cortas con la chispa del día a día.' },
    { id: 3, type: 'video', thumbnail: 'https://img.youtube.com/vi/0g7eUwvaWqY/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=0g7eUwvaWqY', title: 'Canción para Antes de Dormir: El Osito de Crochet', description: 'Crea un momento de calma antes de dormir con El Osito de Crochet.' },
    { id: 4, type: 'video', thumbnail: 'https://img.youtube.com/vi/xoWMrPvjGCc/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=xoWMrPvjGCc', title: '@coco.projects', description: 'Creative Agency (@coco.projects)' },
    { id: 5, type: 'video', thumbnail: 'https://img.youtube.com/vi/XxGi7wkEvU8/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=XxGi7wkEvU8', title: '@Honda.projects', description: 'Creative Agency (@Honda.projects).' },
    // VIDEO 2: Vimeo (Link verificado de CGI de alta calidad)
    { id: 6, type: 'video', thumbnail: 'https://img.youtube.com/vi/VGmM9guMuxI/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=VGmM9guMuxI', title: '@Sasha.projects', description: 'Creative Agency (@Sasha.projects).' },
    { id: 7, type: 'video', thumbnail: 'https://img.youtube.com/vi/a3yci_Y8Ksw/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=a3yci_Y8Ksw', title: '@AlanRitchson.projects', description: 'Creative Agency (@AlanRitchson.projects)' },
    { id: 8, type: 'video', thumbnail: 'https://img.youtube.com/vi/8dzjTEDyhsI/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=8dzjTEDyhsI', title: '(@Sasha2.projects', description: 'Creative Agency (@Sasha2.projects).' },
    { id: 9, type: 'video', thumbnail: 'https://img.youtube.com/vi/lRC5MsRP_SY/maxresdefault.jpg', src: 'https://www.youtube.com/watch?v=_FtIc4ZZhu4', title: '(@SashaCR.projects', description: 'Creative Agency (@SashaCR.projects).' },
  ],
  team: [
    { 
        id: 1, 
        name: 'Cristobal Pallete', 
        role: 'Director Creativo', 
        image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhaglXGCfTfSx6bIN3Ym88Aw_09Xv2X62ytp_mMSyFWHEmvPl-l_tly6GtynOqQBBYSSfdnVGCoVIhM57AGFlM8W0IPuByO3vVA0VIX-K_AMNmSIlYV0_bCKIdKS4c5r7neZfyHRhS8Vki3AZluy9kX-mmjgQoOoM4NPYZN7X4Ompp2NDki-Elbbrze6uis/s769/cb971b78-d8b3-45a3-93c9-b9e2570d4ec2.webp', 
        burstImages: [
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhsy-tx2F3PzJykytuhdGks10b4DpLgbpwdXxPh4ILP6T0_I3rpgw5-A22DGtJwPBFLyJfF8wkvTBeWFwn6paSdrIaV7TMSRVWGSAZObZMCjBOBwIGIh8GSWFNAbbAKizY-SGJ7L8tySZyy98Dn-QDVSLRso61OetbcqGL7SgrWWQFLJQvdHeIafEl0jD7x/s787/8310fc70-9ad2-4475-aac0-56bc2b7c31bb.webp',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjhE2QG1rNEkgvsXQMjnbDRchEgFNZDuKLNWYkJJH5Ue4dLyLI95dgxZDBUYo1sMDxvKY4qLvrRW7LIcNHhdjTf9z8IXCFGQ8xRRf0LUn6olMgxCNW6xcy1ax1YVJG5rHAVCs1cKvBoQ5ASkATI0DRBfE6-gAYcHWHXa1zXP98_v55BUMXoFnVkZ5FFyZDb/s787/e662b3ff-d46d-46d9-8fd0-df61b6c14f26.webp',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj498qJ6j84Ts8dnCCvqlTM0qBjRMHYNPfa2kHvSfVYtYAOA-O1eYhN2tuGwWTyQRehq-sLpBnBdJHVOBH0TXksPCLZ-p7binGXjIiESMB7Ljty1ECFRc1Tqfe7BjgZzwSsd4ceMmZUou7HMnZRnNz9n5yfzwBwm45Wx6Kgl_EzV-biPUybfOhzYBcM8goY/s787/0dc1080c-e091-4dba-b458-fcec862ae6be.webp'
        ],
        stats: [
            { label: 'Creatividad', value: 98 },
            { label: 'Dirección', value: 100 },
            { label: 'Visión', value: 100 },
            { label: 'Baila Pegado', value: 20 }
        ],
        social: [{ platform: 'linkedin', url: '#' }, { platform: 'twitter', url: '#' }] 
    },
    { 
        id: 2, 
        name: 'Peter Queens', 
        role: 'Director IA', 
        image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3CO5r51IGOzX6xS9atNPnikklH7-EK6YtSydBx7Bx9y0A2yHguX3OJdBLWPSrYmkgEVZnFPCQvW71H9TC3jWMA60Kqaswi6THG6udQiZBzrBZ3DuUUhU9QeAjqn0tLIZv2qphqoAy_LVxpClis9yvauJAPVekUWqhcp_c2k6Ktbvj7S9M3DMSQrsgWAZ3/s1184/past-forward-1960s.jpg', 
        burstImages: [
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoPgDdMfFrFS7qm1HLPsF9MpSdPengO-lBV5c7xbbXfQgaWlAHnLnqubYgJBwBXXtyx9n1Jm5ayv6pazciKW6uJ0BYvhpWcWo-5XrACDLx_tesZG0-bB2NdpPtsBBF0SNTcUj3qblhQQiSL-uQE270Q0T5LDLU5lpgFoe3MqyaZseQp7ATR3yp3pSJN_m8/s1184/past-forward-1950s.jpg',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhUXtyYvdnnh1yBzWdPfpa5qLaStjsAoYmh_ROR9SH-fxL1nBTNmwmf5Kd4IVXB6r719QtM5aUfWugwJFsaSzi5h8VJUk4f9k4_2trjDCAIcoUNteDwMhtmCNp5hX6wIFswCvaqY0BaquTBEDwEHeHgf6e4VEQ8tzT_jfTeOLyo2Hp8bVitTJRAsIwVeppi/s1184/past-forward-1970s.jpg',
            'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjO_GqGPXHX0jU5ojEfJYuTth7kY1L7H32fNeYnBiLld-0iRpyTTbkZFNSGWTSN2ldWsU9-63cVjMFgnOP-6RxHBztWX_PtHX8UgDe3XApGwrNkF6Eoy0HcSWC5XBjHgODPuyNtP0s7QJSupGmqmlmvrDInMRa1RdlBg5tmbDeUjONOrDt7IitF7kixayGt/s1184/past-forward-1980s.jpg'
        ],
        stats: [
            { label: 'Ingeniería', value: 97 },
            { label: 'Prompting', value: 100 },
            { label: 'Sinergia AI', value: 98 },
            { label: 'Con Energia', value: 10 }
        ],
        social: [{ platform: 'linkedin', url: '#' }, { platform: 'github', url: '#' }] 
    },
    { 
        id: 3, 
        name: 'Carlos Gomez', 
        role: 'Diseñador Principal', 
        image: 'https://picsum.photos/500/700?random=40', 
        burstImages: [
            'https://picsum.photos/500/700?random=41',
            'https://picsum.photos/500/700?random=42',
            'https://picsum.photos/500/700?random=43'
        ],
        stats: [
            { label: 'Estilo', value: 95 },
            { label: 'UX/UI', value: 92 },
            { label: 'Composición', value: 97 }
        ],
        social: [{ platform: 'instagram', url: '#' }, { platform: 'linkedin', url: '#' }] 
    },
    { 
        id: 4, 
        name: 'Daniela Flores', 
        role: 'Estratega de Contenido', 
        image: 'https://picsum.photos/500/700?random=50', 
        burstImages: [
            'https://picsum.photos/500/700?random=51',
            'https://picsum.photos/500/700?random=52',
            'https://picsum.photos/500/700?random=53'
        ],
        stats: [
            { label: 'Narrativa', value: 98 },
            { label: 'Estrategia', value: 94 },
            { label: 'SEO', value: 90 }
        ],
        social: [{ platform: 'linkedin', url: '#' }, { platform: 'twitter', url: '#' }] 
    },
    { 
        id: 5, 
        name: 'Eva Mendez', 
        role: 'Project Manager', 
        image: 'https://picsum.photos/500/700?random=60', 
        burstImages: [
            'https://picsum.photos/500/700?random=61',
            'https://picsum.photos/500/700?random=62',
            'https://picsum.photos/500/700?random=63'
        ],
        stats: [
            { label: 'Agilidad', value: 100 },
            { label: 'Organización', value: 98 },
            { label: 'Liderazgo', value: 95 }
        ],
        social: [{ platform: 'linkedin', url: '#' }] 
    },
  ],
  contact: {
    preTitle: 'Looks like you need some help!!!',
    mainTitle: 'Reach Out!',
    paragraph: 'I usually respond within an hour, but designers do sleep two to three hours a night, so it might take a bit longer. Thank you and I am looking to hearing from you.',
    illustrationUrl: '', // Removed
    disclaimer: 'By submitting this form, you acknowledge receipt of our company Privacy and policy.',
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} AI Discovery. Todos los derechos reservados.`,
    links: [
      { name: 'Inicio', href: '#hero' },
      { name: 'Galería', href: '#gallery' },
      { name: 'Equipo', href: '#team' },
    ],
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
    ],
  }
};