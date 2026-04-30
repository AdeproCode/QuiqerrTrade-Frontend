'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiTrendingUp, FiMusic, FiDollarSign, FiCpu, FiPlay,
  FiArrowRight, FiStar, FiShield, FiZap, FiUsers,
  FiBarChart2, FiGlobe, FiRadio
} from 'react-icons/fi';
import MarketFeed from '@/components/market/MarketFeed';
import TrendingSection from '@/components/market/TrendingSection';
import { useAuthStore } from '@/lib/store/authStore';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* ============================================ */}
      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      {/* ============================================ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.jpg"
            alt="Music production background"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 mix-blend-overlay" />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float animation-delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 text-center py-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-semibold mb-6">
              <FiZap className="w-4 h-4 text-yellow-400" />
              Powered by Solana & Bags Protocol
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-6 text-white leading-tight"
          >
            Turn Music Remixes Into{' '}
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              Tradable Assets
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            The first decentralized platform where music remixes become tokenized assets. 
            Create original tracks, remix your favorites, and trade them like stocks — 
            all powered by AI and Solana blockchain.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              <Button variant="primary" size="xl" className="text-lg px-10 py-5 rounded-2xl shadow-2xl hover:shadow-primary-500/25">
                <FiPlay className="mr-2 w-5 h-5" />
                Get Started Now
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="secondary" size="xl" className="text-lg px-10 py-5 rounded-2xl">
                <FiBarChart2 className="mr-2 w-5 h-5" />
                Explore Market
              </Button>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16"
          >
            {[
              { value: '$2.5M+', label: 'Trading Volume', icon: FiBarChart2 },
              { value: '10K+', label: 'Remixes Created', icon: FiMusic },
              { value: '50K+', label: 'Active Traders', icon: FiUsers },
              { value: '$500K+', label: 'Creator Earnings', icon: FiDollarSign },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
              >
                <stat.icon className="w-6 h-6 text-primary-400 mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-gray-400 mt-1 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full mt-2"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TRUSTED BY / PARTNERS SECTION */}
      {/* ============================================ */}
      <section className="py-12 px-4 bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">
            Built on Industry-Leading Technology
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {['Solana', 'Bags Protocol', 'IPFS', 'OpenAI', 'Meteora'].map((partner) => (
              <div key={partner} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-lg font-semibold">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-dark-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Why QuiqerrTrade</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              The Future of{' '}
              <span className="gradient-text">Music Finance</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Everything you need to create, trade, and earn from music — all on the blockchain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiMusic,
                title: 'Create & Upload',
                description: 'Share your original tracks as tokenized assets and earn perpetual royalties from every remix trade.',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-500/10',
              },
              {
                icon: FiTrendingUp,
                title: 'Trade Remixes',
                description: 'Each remix becomes a tradable token. Buy low, sell high — just like stocks, but for music.',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-500/10',
              },
              {
                icon: FiDollarSign,
                title: 'Earn Automatically',
                description: 'Smart contracts split revenue instantly. Creators get 50%, remixers get 45% — automatically.',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-500/10',
              },
              {
                icon: FiCpu,
                title: 'AI-Powered Insights',
                description: 'Our AI predicts viral potential, suggests remix opportunities, and provides trading signals.',
                color: 'from-orange-500 to-yellow-500',
                bgColor: 'bg-orange-500/10',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-dark-200 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-5`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS SECTION */}
      {/* ============================================ */}
      <section className="py-20 px-4 bg-white dark:bg-dark-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How It{' '}
              <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: FiMusic, title: 'Upload Original Track', description: 'Creators upload music which gets tokenized on Solana via Bags Protocol. Set your royalty splits and go live.' },
              { step: '02', icon: FiRadio, title: 'Remixers Create Versions', description: 'Producers find tracks, create remixes, and mint them as tradable tokens. Each remix has its own market.' },
              { step: '03', icon: FiTrendingUp, title: 'Trade & Earn', description: 'Traders buy/sell remix tokens. Creators and remixers earn royalties from every trade automatically.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-6xl font-display font-bold text-gray-200 dark:text-gray-700 mb-4">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <TrendingSection />

      {/* Market Feed Preview */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-dark-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge variant="outline" className="mb-2">Live Market</Badge>
              <h2 className="text-3xl font-display font-bold">
                🔥 Hot on QuiqerrTrade
              </h2>
            </div>
            <Link
              href="/market"
              className="text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <MarketFeed limit={6} />
        </div>
      </section>

      {/* Testimonials / Trust Section */}
      <section className="py-20 px-4 bg-white dark:bg-dark-200">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">Why Trust Us</Badge>
          <h2 className="text-4xl font-display font-bold mb-12">
            Built for{' '}
            <span className="gradient-text">Creators & Traders</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FiShield, title: 'Secure & Transparent', description: 'All transactions are on-chain and verifiable. Smart contracts handle royalty splits automatically.' },
              { icon: FiZap, title: 'Lightning Fast', description: 'Built on Solana for sub-second transactions and negligible fees. Trade without friction.' },
              { icon: FiGlobe, title: 'Truly Decentralized', description: 'No gatekeepers. Anyone can create, remix, and trade. The community decides what\'s valuable.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6"
              >
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-90" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and traders who are already earning from music on QuiqerrTrade Market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={isAuthenticated ? '/dashboard' : '/register'}>
                <Button variant="secondary" size="xl" className="text-lg px-10 py-5 rounded-2xl bg-white text-primary-600 hover:bg-gray-100">
                  <FiStar className="mr-2 w-5 h-5" />
                  {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                </Button>
              </Link>
              <Link href="/market">
                <Button variant="outline" size="xl" className="text-lg px-10 py-5 rounded-2xl border-white text-white hover:bg-white/10">
                  <FiTrendingUp className="mr-2 w-5 h-5" />
                  Browse Market
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}