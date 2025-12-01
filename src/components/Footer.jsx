import React from 'react';
import { Mail, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-[#1D1D1F] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div>
          <h2 className="text-4xl font-bold mb-8">Let's work together.</h2>
          <div className="space-y-4">
            <a href="mailto:quanganh.ibd@gmail.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-lg">
              <Mail size={22} /> quanganh.ibd@gmail.com
            </a>
            <a href="tel:0813601054" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-lg">
              <span className="font-mono">0813 601 054</span>
            </a>
            <a href="https://bit.ly/quanganhlinkedin" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-lg">
              <Linkedin size={22} /> LinkedIn Profile
            </a>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-base text-gray-500 mb-1">Education</p>
          <p className="font-medium text-lg">VNU - University of Economics & Business</p>
          <p className="text-base text-gray-400">Bachelor of Business Administration (2025)</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-gray-800 text-sm text-gray-500 flex justify-between">
        <span>© 2025 Le Quang Anh. All rights reserved.</span>
        <span>Design inspired by Apple.</span>
      </div>
    </footer>
  );
};

export default Footer;
