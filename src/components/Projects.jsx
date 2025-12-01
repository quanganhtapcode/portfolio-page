import React from 'react';
import { projects } from '../data/projects';

const Projects = () => {
  return (
    <section id="projects" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">Selected Analysis</h2>
          <span className="text-base text-gray-400">2024 - 2025</span>
        </div>

        <div className="space-y-12">
          {projects.map((project) => (
            <a 
              key={project.id} 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-3">
                <h3 className="text-2xl font-medium group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <span className="text-base text-gray-400 font-mono">{project.company}</span>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-4xl text-lg">
                {project.description}
              </p>
              <div className="mt-4 flex gap-2 flex-wrap">
                {project.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                      project.isPersonal 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="h-px w-full bg-gray-100 mt-8 group-hover:bg-gray-200 transition-colors"></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
