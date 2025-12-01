import React from 'react';

const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-semibold text-sm tracking-tight">Le Quang Anh.</span>
        <div className="flex gap-6 text-sm text-gray-500 font-medium">
          <a href="#about" className="hover:text-black transition-colors">About</a>
          <a href="#projects" className="hover:text-black transition-colors">Work</a>
          <a href="#contact" className="hover:text-black transition-colors">Contact</a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
