'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiTwitter, 
  FiGithub, 
  FiDisc, 
  FiMail,
  FiMusic,
  FiHeart,
  FiExternalLink
} from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: React.ElementType;
  href: string;
  label: string;
}

const footerSections: FooterSection[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Market', href: '/market' },
      { label: 'Upload Track', href: '/upload' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Leaderboard', href: '/leaderboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs', external: true },
      { label: 'API Reference', href: '/api-docs', external: true },
      { label: 'Help Center', href: '/help' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Press Kit', href: '/press' },
    ],
  },
];

const socialLinks: SocialLink[] = [
  { icon: FiTwitter, href: 'https://twitter.com/QuiqerrTrade', label: 'Twitter' },
  { icon: FaTelegramPlane, href: 'https://t.me/QuiqerrTrade', label: 'Telegram' },
  { icon: FiDisc, href: 'https://discord.gg/quiqerrtrade', label: 'Discord' },
  { icon: FiGithub, href: 'https://github.com/quiqerrtrade', label: 'GitHub' },
  { icon: FiMail, href: 'mailto:hello@quiqerrtrade.market', label: 'Email' },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8">
<Image
  src="/logo.png"
  alt="QuiqerrTrade"
  fill
  sizes="(max-width: 768px) 32px, 36px"
  className="object-contain"
  priority
/>
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                QuiqerrTrade
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Turn music remixes into tradable assets. Create, remix, trade, and earn with AI-powered discovery on Solana.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-100 dark:bg-dark-300 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-500 hover:text-white transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 flex items-center gap-1"
                      >
                        {link.label}
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-lg mb-1">Stay in the loop</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Subscribe to get updates on new features and opportunities.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-gray-100 dark:bg-dark-300 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors duration-200 text-sm"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} QuiqerrTrade Market. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                Cookies
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              Made with <FiHeart className="w-3 h-3 text-red-500 fill-current" /> by the QuiqerrTrade Team
            </p>
          </div>
        </div>
      </div>

      {/* Powered By */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiMusic className="w-4 h-4" />
              <span>Powered by</span>
            </div>
            <PoweredByBadge name="Solana" href="https://solana.com" />
            <PoweredByBadge name="Bags" href="https://bags.fm" />
            <PoweredByBadge name="IPFS" href="https://ipfs.tech" />
            <PoweredByBadge name="OpenAI" href="https://openai.com" />
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// POWERED BY BADGE COMPONENT
// ============================================

interface PoweredByBadgeProps {
  name: string;
  href: string;
}

const PoweredByBadge: React.FC<PoweredByBadgeProps> = ({ name, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
    >
      {name}
    </a>
  );
};

export default Footer;