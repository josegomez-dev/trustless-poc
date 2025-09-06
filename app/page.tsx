'use client';

import { EscrowProvider } from '@/contexts/EscrowContext';
import { useEffect } from 'react';
import Image from 'next/image';
import PlasmaBubbles from '@/components/effects/PlasmaBubbles';


function HomeContent() {

  // Mouse following plasma ball effect
  useEffect(() => {
    const plasmaBall = document.getElementById('plasma-ball');
    if (!plasmaBall) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = plasmaBall.getBoundingClientRect();
      const containerRect = plasmaBall.parentElement?.getBoundingClientRect();

      if (containerRect) {
        // Calculate relative position within the character container
        const relativeX = e.clientX - containerRect.left;
        const relativeY = e.clientY - containerRect.top;

        // Constrain the plasma ball to stay within the character area
        const maxX = containerRect.width - 48; // 48px is the plasma ball width
        const maxY = containerRect.height - 48; // 48px is the plasma ball height

        const constrainedX = Math.max(0, Math.min(relativeX, maxX));
        const constrainedY = Math.max(0, Math.min(relativeY, maxY));

        // Apply smooth movement with easing
        plasmaBall.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
        plasmaBall.style.transition = 'transform 0.1s ease-out';
      }
    };

    // Add mouse move listener to the character container
    const characterContainer = plasmaBall.parentElement;
    if (characterContainer) {
      characterContainer.addEventListener('mousemove', handleMouseMove);

      // Reset position when mouse leaves
      const handleMouseLeave = () => {
        plasmaBall.style.transform = 'translate(-50%, -50%)';
        plasmaBall.style.transition = 'transform 0.5s ease-out';
      };

      characterContainer.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        characterContainer.removeEventListener('mousemove', handleMouseMove);
        characterContainer.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <EscrowProvider>
      <div id='top' className='min-h-screen bg-gradient-to-br from-neutral-900 via-brand-900 to-neutral-900 relative overflow-hidden'>
        {/* Floating Plasma Bubbles with Analytics Info */}
        <PlasmaBubbles />
        
        {/* Animated background elements */}
        <div className='absolute inset-0 opacity-20 bg-gradient-to-r from-brand-500/10 via-transparent to-accent-500/10'></div>

        {/* Main Content */}
        <main className='relative z-10 pb-16 pt-20'>
          {/* Demos Section */}
          <section className='container mx-auto px-4'>
            <div className='max-w-4xl mx-auto text-center'>
              <div className='max-w-4xl mx-auto p-6 relative'>
                {/* Floating Particles */}
                <div className='epic-particle'></div>
                <div className='epic-particle'></div>
                <div className='epic-particle'></div>
                <div className='epic-particle'></div>
                <div className='epic-particle'></div>

                <p className='epic-text text-2xl md:text-3xl text-center leading-relaxed'>
                  Experience the future of Decentralized Technology
                </p>
              </div>

              <div className='flex justify-center -mb-10 relative group'>
                {/* Super Powerful Fire Plasma Energy Background Effect */}
                <div className='absolute inset-0 flex justify-center items-center pointer-events-none z-0'>
                  {/* Primary Fire Plasma Core */}
                  <div className='relative w-96 h-96'>
                    {/* Inner Fire Ring - Most Intense */}
                    <div
                      className='absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-red-600 to-yellow-400 opacity-80 blur-sm scale-110'
                      style={{ animation: 'firePulse 4s ease-in-out infinite' }}
                    ></div>

                    {/* Middle Fire Ring - Medium Intensity */}
                    <div
                      className='absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-orange-600 to-yellow-500 opacity-60 blur-md scale-125'
                      style={{ animation: 'firePulse 3s ease-in-out infinite' }}
                    ></div>

                    {/* Outer Fire Ring - Subtle Glow */}
                    <div
                      className='absolute inset-0 rounded-full bg-gradient-to-r from-red-400 via-orange-500 to-yellow-300 animate-pulse opacity-40 blur-lg scale-150'
                      style={{ animationDuration: '3s' }}
                    ></div>
                  </div>

                  {/* Floating Fire Particles */}
                  <div className='absolute inset-0'>
                    {/* Particle 1 - Top Left */}
                    <div
                      className='absolute top-8 left-16 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-70'
                      style={{ animation: 'fireParticle 2s ease-in-out infinite' }}
                    ></div>
                    {/* Particle 2 - Top Right */}
                    <div
                      className='absolute top-12 right-20 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-ping opacity-80'
                      style={{ animationDelay: '0.5s' }}
                    ></div>
                    {/* Particle 3 - Bottom Left */}
                    <div
                      className='absolute bottom-16 left-24 w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-orange-500 rounded-full animate-ping opacity-60'
                      style={{ animationDelay: '1s' }}
                    ></div>
                    {/* Particle 4 - Bottom Right */}
                    <div
                      className='absolute bottom-20 right-16 w-3 h-3 bg-gradient-to-r from-yellow-500 to-red-400 rounded-full animate-ping opacity-90'
                      style={{ animationDelay: '1.5s' }}
                    ></div>
                  </div>

                  {/* Energy Wave Rings */}
                  <div className='absolute inset-0'>
                    {/* Wave 1 - Fast */}
                    <div
                      className='absolute inset-0 rounded-full border-2 border-orange-400/50 animate-ping scale-110'
                      style={{ animationDuration: '1.5s' }}
                    ></div>
                    {/* Wave 2 - Medium */}
                    <div
                      className='absolute inset-0 rounded-full border border-red-400/40 animate-ping scale-130'
                      style={{ animationDuration: '2.5s' }}
                    ></div>
                    {/* Wave 3 - Slow */}
                    <div
                      className='absolute inset-0 rounded-full border border-yellow-400/30 animate-ping scale-150'
                      style={{ animationDuration: '3.5s' }}
                    ></div>
                  </div>
                </div>

                <Image
                  src='/images/character/character.png'
                  alt='Nexus Prime'
                  width={350}
                  height={200}
                  className='relative z-10 transition-all duration-500 ease-out'
                />

                <div
                  id='plasma-ball'
                  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 animate-float -ml-[115px] transition-all duration-300 ease-out pointer-events-none z-10'
                  style={{
                    filter:
                      'drop-shadow(0 0 30px rgba(14, 165, 233, 0.7)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.5))',
                  }}
                >
                  {/* Core Plasma Ball */}
                  <div className='plasma-core absolute inset-0 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-accent-600 animate-pulse'></div>
                  <div className='flex justify-center mb-8'>
                    <div className='relative'>
                      <Image
                        src='/images/logo/logoicon.png'
                        alt='STELLAR NEXUS'
                        width={300}
                        height={100}
                        className='animate-logo-rotate hover:animate-logo-flicker transition-all duration-500 ease-out hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(14,165,233,0.8)] relative z-20'
                        style={{
                          filter:
                            'drop-shadow(0 0 20px rgba(14, 165, 233, 0.6)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.4))',
                          animation:
                            'logoRotate 8s linear infinite, logoFlicker 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                  </div>

                  {/* Energy Rings */}
                  <div
                    className='plasma-ring-1 absolute inset-0 rounded-full border-2 border-brand-300/60 animate-spin'
                    style={{ animationDuration: '3s' }}
                  ></div>
                  <div
                    className='plasma-ring-2 absolute inset-0 rounded-full border border-brand-400/40 animate-spin'
                    style={{ animationDuration: '4s', animationDirection: 'reverse' }}
                  ></div>
                  <div
                    className='plasma-ring-3 absolute inset-0 rounded-full border border-accent-500/50 animate-spin group-hover:border-accent-400/80 group-hover:border-2 transition-all duration-500'
                    style={{ animationDuration: '5s' }}
                  ></div>

                  {/* Energy Particles */}
                  <div
                    className='plasma-particle-1 absolute top-0 left-1/2 w-3 h-3 bg-brand-300 rounded-full animate-bounce group-hover:w-4 group-hover:h-4 group-hover:bg-brand-200 transition-all duration-500'
                    style={{ animationDelay: '0s' }}
                  ></div>
                  <div
                    className='plasma-particle-2 absolute top-1/4 right-0 w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce group-hover:w-3.5 group-hover:h-3.5 group-hover:bg-brand-300 transition-all duration-500'
                    style={{ animationDelay: '0.5s' }}
                  ></div>
                  <div
                    className='plasma-particle-3 absolute bottom-1/4 left-0 w-2 h-2 bg-accent-400 rounded-full animate-bounce group-hover:w-3 group-hover:h-3 group-hover:bg-accent-300 transition-all duration-500'
                    style={{ animationDelay: '1s' }}
                  ></div>
                  <div
                    className='plasma-particle-4 absolute bottom-0 right-1/4 w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce group-hover:w-3.5 group-hover:h-3.5 group-hover:bg-brand-300 transition-all duration-500'
                    style={{ animationDelay: '1.5s' }}
                  ></div>

                  {/* Glow Effect */}
                  <div className='plasma-glow absolute inset-0 rounded-full bg-gradient-to-r from-brand-400/20 via-brand-500/20 to-accent-600/20 blur-xl animate-pulse group-hover:from-brand-300/40 group-hover:via-brand-400/40 group-hover:to-accent-500/40 group-hover:blur-2xl transition-all duration-500'></div>
                </div>
              </div>
              <a
                href='/demos'
                className='w-full px-12 py-6 bg-gradient-to-r from-brand-500 via-accent-600 to-brand-700 hover:from-brand-600 hover:via-accent-700 hover:to-brand-800 text-white font-bold rounded-2xl transition-all duration-700 ease-out transform hover:scale-105 shadow-2xl hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] flex items-center justify-center space-x-4 relative z-50 overflow-hidden group/button border-2 border-brand-400/50 hover:border-brand-300/80 inline-block text-center'
              >
                {/* Epic Plasma Background Effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-brand-500/20 via-accent-600/30 to-brand-700/20 animate-pulse'></div>

                {/* Shiny Glass Reflection Effect */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1200 ease-out'></div>

                {/* Additional Shine Layer */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover/button:-translate-x-full transition-transform duration-1000 ease-out delay-300'></div>

                {/* Subtle Inner Glow */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1500 ease-out delay-200'></div>

                {/* Button Content with Epic START Animation */}
                <span className='relative z-10 text-center'>
                  <span className='text-3xl md:text-4xl font-black text-yellow-300 group-hover/button:text-yellow-100 group-hover/button:scale-110 transition-all duration-500 ease-out inline-block drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse'>
                    START
                  </span>
                  <br />
                  <span className='text-xl md:text-2xl font-bold text-white group-hover/button:text-brand-200 transition-all duration-500 ease-out drop-shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-pulse group-hover/button:animate-bounce'>
                    STELLAR NEXUS EXPERIENCE
                  </span>
                </span>
              </a>

              {/* Powered by Trustless Work */}
              <div className='text-center mt-4'>
                <p className='text-brand-300/70 text-sm font-medium animate-pulse'>
                  Powered by <span className='text-brand-200 font-semibold'>Trustless Work</span>
                </p>

                {/* Epic Subtitle */}
                <p className='text-brand-300 text-lg text-center mt-4 font-medium animate-pulse'>
                  ✨ Where Trust Meets Innovation ✨
                </p>
              </div>
            </div>
          </section>

          {/* Nexus Codex Section */}
          {/* <NewsSection 
            title="📚 Nexus Codex" 
            articles={[...nexusNews.slice(0, 2), ...nexusBlog.slice(0, 2)]}
          /> */}
        </main>

        {/* Custom Footer - Revolutionary Impact Section */}
        <footer className="relative mt-16 py-16 bg-gradient-to-b from-transparent via-brand-900/30 to-brand-900/60 border-t border-brand-400/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-accent-500/20 to-brand-600/10 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-brand-900/60 to-accent-900/40 backdrop-blur-sm border border-brand-400/40 rounded-2xl p-8 text-center hover:border-brand-300/60 transition-all duration-500">
                  <div className="mb-6">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      🌟 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Revolutionary Impact
                      </span> 🌟
                    </h3>
                    <p className="text-xl text-brand-200 max-w-4xl mx-auto leading-relaxed">
                      Trustless Work is pioneering the future of decentralized employment on Stellar. 
                      With exponential growth in user adoption and transaction volume, we're creating 
                      the infrastructure for a <span className="text-yellow-400 font-semibold">$50B+ market opportunity</span>.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-brand-300 mb-3">🚀 Market Opportunity</h4>
                      <ul className="space-y-2 text-brand-200">
                        <li>• $50B+ global freelance market</li>
                        <li>• 57M+ freelancers worldwide</li>
                        <li>• Growing demand for trustless solutions</li>
                        <li>• Stellar ecosystem expansion</li>
                      </ul>
                    </div>
                    
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-accent-300 mb-3">💎 Competitive Advantages</h4>
                      <ul className="space-y-2 text-brand-200">
                        <li>• First-mover advantage on Stellar</li>
                        <li>• Proven product-market fit</li>
                        <li>• Exponential user growth</li>
                        <li>• Enterprise-ready infrastructure</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-brand-400/30">
                    <p className="text-lg text-brand-300 font-medium">
                      📈 <span className="text-white font-semibold">Ready to scale</span> with the right funding partner
                    </p>
                  </div>

                  {/* Footer Links */}
                  <div className="mt-8 pt-6 border-t border-brand-400/20">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                      <div className="flex items-center space-x-6">
                        <div className="text-brand-300 text-sm">
                          © 2025 • Nexus Trustless Work • Built on Stellar
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <a href="#" className="text-brand-300 hover:text-white transition-colors text-sm">Privacy</a>
                        <a href="#" className="text-brand-300 hover:text-white transition-colors text-sm">Terms</a>
                        <a href="#" className="text-brand-300 hover:text-white transition-colors text-sm">Contact</a>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm font-medium">Platform Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Back to Top Button */}
        <a
          href='#top'
          className='fixed bottom-8 right-8 z-50 bg-gradient-to-r from-brand-500 to-accent-600 text-white p-3 rounded-full shadow-lg hover:from-brand-600 hover:to-accent-700 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border border-brand-400/30'
          title='Back to top'
        >
          <span className='text-xl font-bold'>↑</span>
        </a>
      </div>
    </EscrowProvider>
  );
}

export default function Home() {
  return <HomeContent />;
}