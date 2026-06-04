import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';
import Section from '../ui/Section';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { supabase, Product } from '../../lib/supabase';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(6);

      if (data) setProducts(data);
    }

    fetchProducts();
  }, []);

  return (
    <Section background="light">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Equipment</h2>
        <p className="text-xl text-gray-600">Top-quality commercial kitchen equipment</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} hover className="group relative">
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Featured
              </span>
            </div>

            <div className="relative overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-orange-500 fill-orange-500" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 text-sm">(5.0)</span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>

              <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{product.description}</p>

              {product.features && product.features.length > 0 && (
                <ul className="space-y-2 mb-5">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <Link to="/contact" className="flex-1">
                  <Button size="sm" className="w-full group">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Request Quote
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/products">
          <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white" size="lg">
            View All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </Section>
  );
}
