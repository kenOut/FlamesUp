import { Link } from 'react-router-dom';
import { Wrench, Package, Palette, Settings, RefreshCw, CheckCircle } from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Services() {
  const services = [
    {
      icon: <Wrench className="h-12 w-12" />,
      title: 'Kitchen Design',
      description: 'Transform your vision into reality with our expert kitchen design services. We create efficient, functional layouts that optimize workflow and maximize productivity.',
      features: [
        'Custom layout planning',
        'Workflow optimization',
        '3D visualization',
        'Equipment placement strategy',
        'Compliance with health codes',
        'Ergonomic design principles'
      ],
      image: 'https://images.unsplash.com/photo-1728433663452-e68c114a7ebb?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      icon: <Package className="h-12 w-12" />,
      title: 'Equipment Supply',
      description: 'Access to premium commercial kitchen equipment from leading global manufacturers. We source the best equipment at competitive prices to suit your budget and needs.',
      features: [
        'Wide product selection',
        'Trusted brand partnerships',
        'Competitive pricing',
        'Quality assurance',
        'Warranty coverage',
        'Energy-efficient options'
      ],
      image: 'https://plus.unsplash.com/premium_photo-1687697860857-7b148d12b93b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      icon: <Palette className="h-12 w-12" />,
      title: 'Interior Decoration',
      description: 'Create an inviting atmosphere that enhances your customers\' dining experience. Our design team combines aesthetics with functionality.',
      features: [
        'Theme development',
        'Color scheme planning',
        'Furniture selection',
        'Lighting design',
        'Ambiance creation',
        'Brand integration'
      ],
      image: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: <Settings className="h-12 w-12" />,
      title: 'Installation & Commissioning',
      description: 'Professional installation services ensure your equipment operates at peak performance from day one. Our certified technicians handle everything.',
      features: [
        'Expert installation',
        'Equipment testing',
        'Performance verification',
        'Staff training',
        'Safety compliance',
        'Documentation'
      ],
      image: 'https://plus.unsplash.com/premium_photo-1694557827529-9d90e18fc39e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fHJlc3R1YXJhbnRzJTIwa2l0Y2hlbiUyMGluc3RhbGxhdGlvbnxlbnwwfHwwfHx8MA%3D%3D'
    },
    {
      icon: <RefreshCw className="h-12 w-12" />,
      title: 'Remodeling',
      description: 'Breathe new life into your existing kitchen with our comprehensive remodeling services. Upgrade equipment, improve layouts, and enhance efficiency.',
      features: [
        'Space assessment',
        'Upgrade planning',
        'Equipment replacement',
        'Layout improvements',
        'Minimal downtime',
        'Budget-conscious solutions'
      ],
      image: '/chef-working-together-professional-kitchen.jpg'
    }
  ];

  return (
    <>
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16">
        <Container>
          <h1 className="text-5xl font-bold text-white mb-4 text-center">Our Services</h1>
          <p className="text-xl text-gray-200 text-center max-w-3xl mx-auto">
            Comprehensive solutions for every stage of your commercial kitchen journey
          </p>
        </Container>
      </section>

      <Section background="light">
        <div className="space-y-16">
          {services.map((service, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                <div className="text-orange-600 mb-4">{service.icon}</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h2>
                <p className="text-gray-700 text-lg mb-6">{service.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-2 bg-white p-3 rounded-lg shadow-sm">
                      <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/contact">
                  <Button>Get Started</Button>
                </Link>
              </div>

              <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                <Card hover>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-80 object-cover rounded-xl"
                  />
                </Card>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section background="darker">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Let's discuss your project and create a customized solution that meets your needs and budget.
          </p>
          <Link to="/contact">
            <Button variant="secondary" size="lg">
              Request a Consultation
            </Button>
          </Link>
        </div>
      </Section>
    </>
  );
}
