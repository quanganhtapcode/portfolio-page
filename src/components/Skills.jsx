import React from 'react';
import { Award, Code, TrendingUp, ArrowUpRight } from 'lucide-react';

const Skills = () => {
  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8 tracking-tight">Core Competencies</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:auto-rows-[180px]">
          {/* CFA Block - Large */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Award size={120} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Certification</p>
              <h3 className="text-3xl font-bold">CFA Level 2 Candidate</h3>
            </div>
            <p className="text-gray-500 mt-2">Đang trên hành trình chinh phục chứng chỉ danh giá nhất trong lĩnh vực đầu tư.</p>
          </div>

          {/* GPA Block */}
          <div className="bg-[#F5F5F7] md:bg-white border border-gray-200 md:border-gray-100 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
            <h3 className="text-5xl font-bold text-blue-600">3.67</h3>
            <p className="text-gray-500 font-medium mt-2">GPA / 4.0</p>
            <p className="text-xs text-gray-400 mt-1">Top 5% Program @ VNU-UEB</p>
          </div>

          {/* Tech Stack Block */}
          <div className="bg-black text-white rounded-3xl p-6 flex flex-col justify-between shadow-sm group">
            <div className="flex justify-between items-start">
              <Code className="text-gray-400" />
              <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Fintech & Data</h3>
              <p className="text-gray-400 text-sm mt-1">Python, Flask, SQL, Valuation Modeling</p>
            </div>
          </div>

          {/* Market Research */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
             <div className="max-w-xs">
               <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Expertise</p>
               <h3 className="text-2xl font-bold mb-2">Market Research & Strategy</h3>
               <p className="text-gray-500 text-sm">Chuyên sâu về Bất động sản KCN, Vĩ mô Việt Nam & Quỹ ETF.</p>
             </div>
             <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <TrendingUp size={32} />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
