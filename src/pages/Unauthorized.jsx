import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div 
      className="min-h-screen bg-gray-900 text-purple-100 flex flex-col items-center justify-center p-4 overflow-hidden relative"
      style={{
        // Grid pattern
        '--grid-pattern': `linear-gradient(to right, rgba(192, 132, 252, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(192, 132, 252, 0.1) 1px, transparent 1px)`,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-600 rounded-full mix-blend-screen opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-400 rounded-full mix-blend-screen opacity-15 animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-screen opacity-10 animate-bounce"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'var(--grid-pattern)',
          backgroundSize: '20px 20px',
          opacity: '0.05'
        }}
      ></div>
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Glitch effect title */}
        <div className="relative">
          <h1 
            className="text-6xl md:text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-300"
            style={{
              position: 'relative'
            }}
          >
            <span 
              className="glitch" 
              data-text="403"
              style={{
                position: 'relative'
              }}
            >
              403
              <span 
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  content: 'attr(data-text)',
                  left: '2px',
                  textShadow: '-2px 0 #ff00ff',
                  clip: 'rect(44px, 450px, 56px, 0)',
                  animation: 'glitch-anim-1 2s infinite linear alternate-reverse'
                }}
              ></span>
              <span 
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  content: 'attr(data-text)',
                  left: '-2px',
                  textShadow: '-2px 0 #00ffff',
                  clip: 'rect(44px, 450px, 56px, 0)',
                  animation: 'glitch-anim-2 2s infinite linear alternate-reverse'
                }}
              ></span>
            </span>
          </h1>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-mono mb-6 text-cyan-300 tracking-wider">
          ACCESS DENIED
        </h2>
        
        <div className="mb-8">
          <p className="text-lg md:text-xl text-purple-200 mb-4 leading-relaxed">
            <span className="border-b-2 border-pink-500">Unauthorized territory detected</span>
          </p>
          <p className="text-purple-300 font-mono">
            You lack the necessary credentials to proceed beyond this point.
          </p>
        </div>
        
        {/* Animated button */}
        <Link 
          to="/" 
          className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-full 
                    hover:from-purple-700 hover:to-cyan-600 transition-all duration-300
                    shadow-lg hover:shadow-xl hover:scale-105 transform-gpu
                    border-2 border-purple-400 hover:border-cyan-300
                    relative overflow-hidden group"
        >
          <span className="relative z-10">RETURN TO SAFETY</span>
          <span 
            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></span>
          <span 
            className="absolute top-0 left-0 w-2 h-full bg-white opacity-30 group-hover:left-full group-hover:opacity-0 transition-all duration-700"
          ></span>
        </Link>
        
        {/* Binary code animation */}
        <div 
          className="mt-12 text-xs text-purple-400 opacity-50 font-mono overflow-hidden h-8"
          style={{
            animation: 'scroll-up 15s linear infinite'
          }}
        >
          <div>
            <div>01101000 01100001 01100011 01101011 00100000 01100001 01110100 01110100 01100101 01101101 01110000 01110100 00100000 01100100 01100101 01110100 01100101 01100011 01110100 01100101 01100100</div>
            <div>01110011 01100101 01100011 01110101 01110010 01101001 01110100 01111001 00100000 01110110 01101001 01101111 01101100 01100001 01110100 01101001 01101111 01101110</div>
            <div>01110000 01100101 01110010 01101101 01101001 01110011 01110011 01101001 01101111 01101110 00100000 01100100 01100101 01101110 01101001 01100101 01100100</div>
          </div>
        </div>
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-purple-500"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-pink-500"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-purple-400"></div>

      {/* Embedded CSS styles */}
      <style>{`
        @keyframes glitch-anim-1 {
          0% { clip: rect(61px, 9999px, 52px, 0); }
          20% { clip: rect(33px, 9999px, 14px, 0); }
          40% { clip: rect(43px, 9999px, 37px, 0); }
          60% { clip: rect(23px, 9999px, 58px, 0); }
          80% { clip: rect(54px, 9999px, 21px, 0); }
          100% { clip: rect(9px, 9999px, 98px, 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip: rect(25px, 9999px, 99px, 0); }
          20% { clip: rect(3px, 9999px, 63px, 0); }
          40% { clip: rect(58px, 9999px, 20px, 0); }
          60% { clip: rect(92px, 9999px, 12px, 0); }
          80% { clip: rect(1px, 9999px, 98px, 0); }
          100% { clip: rect(82px, 9999px, 77px, 0); }
        }
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
};

export default Unauthorized;