import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Section from '../ui/Section';
import Card from '../ui/Card';

export default function ProjectsGallery() {
  const projects = [
    {
      title: 'Golden Palace Restaurant',
      category: 'Full Kitchen Setup',
      image: 'https://images.pexels.com/photos/2291599/pexels-photo-2291599.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Skyview Hotel Kitchen',
      category: 'Equipment Upgrade',
      image: 'https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'City Grill & Bar',
      category: 'Kitchen Remodeling',
      image: 'https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Tasty Bites Cafe',
      category: 'Complete Installation',
      image: 'https://images.pexels.com/photos/2291601/pexels-photo-2291601.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Royal Feast Catering',
      category: 'Equipment Supply',
      image: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Downtown Diner',
      category: 'Kitchen Design',
      image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Section background="darker">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Recent Projects</h2>
        <p className="text-xl text-gray-600">
          Explore our portfolio of successful commercial kitchen installations
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card
            key={index}
            hover
            className="group relative overflow-hidden"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative h-80 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className={`transition-all duration-300 ${hoveredIndex === index ? 'translate-y-0' : 'translate-y-2'}`}>
                  <span className="inline-block bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>

                  <div className={`transition-all duration-300 ${hoveredIndex === index ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
                    <div className="flex items-center text-orange-400 hover:text-orange-300 transition-colors">
                      <span className="text-sm font-medium">View Project</span>
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
