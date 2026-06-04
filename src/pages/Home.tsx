import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Wrench, Package, Palette, Settings, RefreshCw, ClipboardList, Truck, ShieldCheck } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import StatsCounter from '../components/home/StatsCounter';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturedProducts from '../components/home/FeaturedProducts';
import NewsletterSection from '../components/home/NewsletterSection';
import BackgroundSlideshow from '../components/home/BackgroundSlideshow';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { supabase, Testimonial } from '../lib/supabase';

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const kitchenImages = [
    '/1aa.avif',
    '/2aa.avif',
    '/3aaa.avif',
    '/4aa.avif',
  ];

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .limit(3);

      if (data) setTestimonials(data);
    }

    fetchTestimonials();
  }, []);

  const services = [
    {
      icon: <Wrench className="h-10 w-10" />,
      title: 'Kitchen Design',
      description: 'Custom commercial kitchen layouts optimized for efficiency and workflow'
    },
    {
      icon: <Package className="h-10 w-10" />,
      title: 'Equipment Supply',
      description: 'Premium quality kitchen equipment from trusted global manufacturers'
    },
    {
      icon: <Palette className="h-10 w-10" />,
      title: 'Interior Decoration',
      description: 'Professional restaurant interior design that enhances dining experience'
    },
    {
      icon: <Settings className="h-10 w-10" />,
      title: 'Installation & Commissioning',
      description: 'Expert installation and testing to ensure optimal performance'
    },
    {
      icon: <RefreshCw className="h-10 w-10" />,
      title: 'Remodeling',
      description: 'Transform existing kitchens with modern upgrades and improvements'
    }
  ];

  const process = [
    { step: '01', title: 'Consultation & Planning', description: 'We assess your needs and create a fully tailored solution for your space and budget.', icon: <ClipboardList className="h-6 w-6 text-white" /> },
    { step: '02', title: 'Supply & Delivery', description: 'Quality equipment sourced from trusted manufacturers and delivered safely on time.', icon: <Truck className="h-6 w-6 text-white" /> },
    { step: '03', title: 'Installation & Commissioning', description: 'Expert installation and full testing of every unit to ensure optimal performance.', icon: <Settings className="h-6 w-6 text-white" /> },
    { step: '04', title: 'Warranty & After-Sales', description: 'Ongoing support, maintenance, and warranty coverage to keep your kitchen running.', icon: <ShieldCheck className="h-6 w-6 text-white" /> },
  ];

  const benefits = [
    'Affordable, high-quality equipment',
    'Reliable and timely delivery',
    'Professional installation services',
    'Comprehensive after-sales support',
    '10+ years of industry experience',
    'Trusted by top restaurants worldwide'
  ];

  return (
    <>
      <HeroSection />
      <StatsCounter />
      <CategoryShowcase />

      <Section background="dark" className="relative overflow-hidden">
        <BackgroundSlideshow images={kitchenImages} opacity={0.60} />
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-xl text-white/90">Comprehensive solutions for your commercial kitchen needs</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service, index) => (
              <Card key={index} hover className="p-8 group backdrop-blur-md bg-white/20 hover:bg-white/30 shadow-xl border border-white/30">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl mb-4 w-fit group-hover:shadow-lg transition-all duration-300">
                  <div className="text-white">{service.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-300 transition-colors">{service.title}</h3>
                <p className="text-white/80">{service.description}</p>
              </Card>
            ))}
            {services.slice(3).map((service, index) => (
              <Card key={index + 3} hover className="p-8 group backdrop-blur-md bg-white/20 hover:bg-white/30 shadow-xl border border-white/30">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl mb-4 w-fit group-hover:shadow-lg transition-all duration-300">
                  <div className="text-white">{service.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-300 transition-colors">{service.title}</h3>
                <p className="text-white/80">{service.description}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 bg-white/20" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      <FeaturedProducts />

      <Section background="light" className="relative overflow-hidden">
        <BackgroundSlideshow images={kitchenImages} opacity={0.55} interval={6000} />
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Our Process</h2>
            <p className="text-xl text-white/90">From consultation to completion</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((item, index) => (
              <div key={index} className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:border-orange-400/40 transition-all duration-300 group">
                <div className="absolute -bottom-3 -right-2 text-8xl font-black text-white/10 select-none group-hover:text-orange-400/20 transition-colors duration-300 leading-none">
                  {item.step}
                </div>
                <div className="mb-5 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">Step {item.step}</p>
                <h3 className="text-white font-bold text-lg mb-2 leading-snug">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section background="light">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Flames Up Solutions?</h2>
            <p className="text-gray-600 mb-8 text-lg">
              We combine quality products, expert service, and competitive pricing to deliver exceptional value for your business.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 group bg-white p-4 rounded-lg hover:shadow-md transition-all duration-300">
                  <div className="bg-orange-100 p-1 rounded-full group-hover:bg-orange-600 transition-colors">
                    <CheckCircle className="h-5 w-5 text-orange-600 group-hover:text-white flex-shrink-0 transition-colors" />
                  </div>
                  <span className="text-gray-700 text-lg group-hover:text-gray-900 transition-colors">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-400/20 rounded-2xl blur-3xl"></div>
            <img
              src="/1bb.avif"
              alt="Commercial Kitchen"
              className="relative rounded-2xl shadow-2xl border border-gray-200"
            />
          </div>
        </div>
      </Section>

      {testimonials.length > 0 && (
        <Section background="darker">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Trusted by the finest establishments</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6 hover:border-orange-400 border-2 border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-orange-500 fill-orange-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">&quot;{testimonial.message}&quot;</p>
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-orange-600">{testimonial.company}</div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section background="light">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <NewsletterSection />
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-center">
            <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20"></div>
            <div className="relative z-10 px-10 py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
                Ready to Transform Your Kitchen?
              </h2>
              <p className="text-lg text-white/80 max-w-md mx-auto mb-10">
                Get a free consultation with our experts and discover how we can help you build the perfect commercial kitchen.
              </p>
              <Link to="/contact">
                <Button size="lg" className="shadow-2xl hover:scale-105 transition-transform">
                  Get Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
