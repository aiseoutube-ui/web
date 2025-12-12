
export interface NavLink {
  name: string;
  href: string;
}

export interface SocialLink {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'github' | 'Youtube';
  url: string;
}

export interface HeaderContent {
  logoUrl: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
}

export interface HeroContent {
  backgroundVideoUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export interface AboutContent {
  title: string;
  paragraphs: string[];
  imageUrl: string;
}

export interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  thumbnail: string;
  src: string;
  title: string;
  description: string;
}

export interface TeamMemberStat {
  label: string;
  value: number; // 0 to 100
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string; // Base image
  burstImages: string[]; // Array of 3 images for the "Wosh" effect
  stats: TeamMemberStat[]; // HUD Data from CMS
  social: SocialLink[];
  alignment?: string; // Optional: 'object-top', 'object-center', etc.
}

export interface ContactContent {
  preTitle: string;
  mainTitle: string;
  paragraph: string;
  illustrationUrl: string;
  disclaimer: string;
}

export interface FooterContent {
  copyright: string;
  links: NavLink[];
  socialLinks: SocialLink[];
}

export interface CMSContent {
  header: HeaderContent;
  hero: HeroContent;
  about: AboutContent;
  gallery: GalleryItem[];
  team: TeamMember[];
  contact: ContactContent;
  footer: FooterContent;
}
