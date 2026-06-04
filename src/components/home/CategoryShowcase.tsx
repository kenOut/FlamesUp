import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Section from '../ui/Section';
import { supabase, Category } from '../../lib/supabase';

const imageMap: { [key: string]: string } = {
  flame: '/commercial_gas_range.jpg',
  snowflake: '/commercial_walk_in_cooler.png',
  utensils: '/commercial_mixer.jpg',
  droplet: '/commercial_deep_fryer.png',
  archive: '/commercial_reach_refrigerator.png',
  store: '/pizza_oven.jpg',
};

const fallbackImage = '/commercial_gas_range.jpg';

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (data) setCategories(data);
    }

    fetchCategories();
  }, []);

  return (
    <Section background="darker">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
        <p className="text-xl text-gray-600">Find the perfect equipment for your commercial kitchen</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <Link key={category.id} to="/products">
            <div className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 hover:border-orange-300 cursor-pointer">
              <div className="relative h-36 overflow-hidden">
                <img
                  src={category.image_url || imageMap[category.icon] || fallbackImage}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-gray-900 font-semibold text-sm mb-1 group-hover:text-orange-600 transition-colors duration-200">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-xs line-clamp-2">{category.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
