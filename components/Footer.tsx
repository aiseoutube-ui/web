import React from 'react';
import type { FooterContent } from '../types';
import { SocialIcons } from './icons/SocialIcons';

interface FooterProps {
  content: FooterContent;
}

const Footer: React.FC<FooterProps> = ({ content }) => {
  return (
    <footer className="bg-brand-secondary py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-brand-muted">
        <div className="flex justify-center space-x-6 mb-6">
          {content.links.map((link) => (
            <a key={link.name} href={link.href} className="cursor-pointer-grow hover:text-brand-accent transition-colors">
              {link.name}
            </a>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mb-8">
            {content.socialLinks.map(link => (
                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer-grow text-brand-light hover:text-brand-accent transition-colors duration-300">
                    <SocialIcons platform={link.platform} className="w-6 h-6" />
                </a>
             ))}
        </div>
        <p>{content.copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;