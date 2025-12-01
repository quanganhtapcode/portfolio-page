import React from 'react';
import { experiences } from '../data/experiences';

const Experience = () => {
  return (
    <section className="py-20 px-6 bg-[#F5F5F7]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold tracking-tight mb-8">Work History</h2>
        <div className="border-l-2 border-gray-200 pl-8 space-y-12">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative">
              <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white bg-gray-300"></div>
              <h4 className="text-lg font-medium text-gray-900">{exp.title}</h4>
              <p className="text-sm text-gray-500 mb-2">{exp.company} | {exp.period}</p>
              <p className="text-gray-600 text-sm">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
