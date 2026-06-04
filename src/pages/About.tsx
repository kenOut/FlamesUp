import { Target, Eye, Award, Users, Clock, Shield } from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';

export default function About() {
  const values = [
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality',
      description: 'We supply only premium equipment from trusted global manufacturers'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Customer Focus',
      description: 'Your success is our priority, we provide tailored solutions'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Reliability',
      description: 'Timely delivery and dependable service you can count on'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Integrity',
      description: 'Transparent pricing and honest business practices'
    }
  ];

  return (
    <>
      <section className="bg-black py-16">
        <Container>
          <h1 className="text-5xl font-bold text-white mb-4 text-center">About Flames Up Solutions</h1>
          <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
            Building excellence in commercial kitchens since 2014
          </p>
        </Container>
      </section>

      <Section background="light">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 text-lg">
              <p>
                Flames Up Solutions was established in 2014 with a clear vision: to become Ghana's most trusted supplier of commercial kitchen and restaurant equipment. What started as a small operation has grown into a leading provider of comprehensive kitchen solutions.
              </p>
              <p>
                Over the past decade, we have equipped hundreds of restaurants, hotels, cafes, and food businesses across Ghana with world-class kitchen equipment and professional installation services.
              </p>
              <p>
                Our commitment to quality, reliability, and customer satisfaction has earned us the trust of Ghana's finest establishments. From family-owned restaurants to five-star hotels, we deliver the same level of excellence to every client.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/2291599/pexels-photo-2291599.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Commercial Kitchen"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </Section>

      <Section background="white">
        <div className="grid md:grid-cols-2 gap-12">
          <Card className="p-8 bg-white border border-gray-200">
            <div className="text-orange-500 mb-4">
              <Target className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700 text-lg">
              To empower food businesses across Ghana with premium commercial kitchen equipment, expert installation services, and ongoing support that enables them to deliver exceptional culinary experiences.
            </p>
          </Card>

          <Card className="p-8 bg-white border border-gray-200">
            <div className="text-orange-500 mb-4">
              <Eye className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-700 text-lg">
              To be the leading provider of commercial kitchen solutions in West Africa, recognized for innovation, quality, and unwavering commitment to customer success.
            </p>
          </Card>
        </div>
      </Section>

      <Section background="light">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-xl text-gray-600">The principles that guide everything we do</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="p-6 text-center bg-white border border-gray-200">
              <div className="text-orange-500 mb-4 flex justify-center">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-700">{value.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section background="white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Track Record</h2>
          <p className="text-xl text-gray-600">Numbers that speak for themselves</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">10+</div>
            <div className="text-gray-700 text-lg">Years in Business</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">500+</div>
            <div className="text-gray-700 text-lg">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">300+</div>
            <div className="text-gray-700 text-lg">Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500 mb-2">100%</div>
            <div className="text-gray-700 text-lg">Satisfaction Rate</div>
          </div>
        </div>
      </Section>

      <Section background="light">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Partner With Ghana's Kitchen Equipment Experts
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Experience the Flames Up Solutions difference. Let's build something amazing together.
          </p>
        </div>
      </Section>
    </>
  );
}
