import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Hero = ({ isVisible }) => {
  const fadeInUp = "transition-all duration-1000 ease-out transform";
  const visibleClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";

  return (
    <header className="pt-40 pb-20 px-6">
      <div className={`max-w-4xl mx-auto ${fadeInUp} ${visibleClass}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-500 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Available for Opportunities
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6 text-gray-900">
          Decoding Value in <br/>
          <span className="text-gray-400">Complex Markets.</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-light">
          Tôi là Quang Anh. Một chuyên gia tài chính với tư duy định lượng. 
          Kết hợp kiến thức <span className="text-gray-900 font-medium">CFA</span> với kỹ năng <span className="text-gray-900 font-medium">Lập trình dữ liệu</span> để xây dựng các chiến lược đầu tư hiệu quả.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a href="mailto:quanganh.ibd@gmail.com" className="bg-[#1D1D1F] text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all flex items-center gap-2">
            Contact Me <ArrowUpRight size={18} />
          </a>
          <a href="https://bit.ly/quanganhlinkedin" target="_blank" rel="noreferrer" className="bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-all">
            LinkedIn Profile
          </a>
        </div>
      </div>
    </header>
  );
};

export default Hero;
