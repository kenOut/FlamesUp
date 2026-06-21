import { useState, FormEvent, ReactNode } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import useInView from '../hooks/useInView';

interface ContactInfo {
  icon: ReactNode;
  title: string;
  content: ReactNode;
}

const contactInfo: ContactInfo[] = [
  {
    icon: <MapPin className="h-6 w-6 text-white" />,
    title: 'Our Location',
    content: (
      <a
        href="https://share.google/Sr307kB3AmSKX3Z8V"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-orange-600 transition-colors"
      >
        Flame up Kitchen Equipment, Accra, Ghana
      </a>
    ),
  },
  {
    icon: <Phone className="h-6 w-6 text-white" />,
    title: 'Phone',
    content: (
      <a href="tel:+233270131313" className="text-gray-600 hover:text-orange-600 transition-colors">
        +233 27 013 1313
      </a>
    ),
  },
  {
    icon: <Mail className="h-6 w-6 text-white" />,
    title: 'Email',
    content: (
      <a href="mailto:info@flameupghana.com" className="text-gray-600 hover:text-orange-600 transition-colors">
        info@flameupghana.com
      </a>
    ),
  },
  {
    icon: <Clock className="h-6 w-6 text-white" />,
    title: 'Business Hours',
    content: (
      <>
        <p className="text-gray-600">Monday - Saturday</p>
        <p className="text-gray-600">8:00 AM - 6:00 PM</p>
      </>
    ),
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { ref: infoRef, inView: infoInView } = useInView<HTMLDivElement>();
  const { ref: formRef, inView: formInView } = useInView<HTMLDivElement>();
  const { ref: mapRef, inView: mapInView } = useInView<HTMLDivElement>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const { error: submitError } = await supabase
      .from('inquiries')
      .insert([formData]);

    if (submitError) {
      setError('Failed to send message. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setFormData({ name: '', email: '', phone: '', message: '', type: 'general' });
    setLoading(false);

    setTimeout(() => setSuccess(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <section className="relative bg-black py-20 md:py-28 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl" />

        <Container className="relative z-10">
          <div className="text-center">
            <div
              className="inline-flex items-center space-x-2 bg-orange-600/20 border border-orange-600/50 rounded-full px-4 py-2 mb-6 animate-fade-in"
            >
              <MessageCircle className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">We'd love to hear from you</span>
            </div>
            <h1
              className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              Contact Us
            </h1>
            <p
              className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              Get in touch with our team and let's discuss your commercial kitchen needs
            </p>
          </div>
        </Container>
      </section>

      <Section background="darker">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about our products or services? Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div ref={infoRef} className="space-y-6">
              {contactInfo.map((item, index) => (
                <Card
                  key={item.title}
                  className={`p-6 border-gray-200 transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-xl ${
                    infoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-lg shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold mb-1">{item.title}</h3>
                      {item.content}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div
            ref={formRef}
            className={`transition-all duration-700 ease-out ${
              formInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Card className="p-8 border-gray-200 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

              {success && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>Thank you for contacting us! We'll get back to you soon.</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-900 font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-900 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-gray-900 font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                    placeholder="+233 123 456 789"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-gray-900 font-medium mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="quote">Request Quote</option>
                    <option value="consultation">Free Consultation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-900 font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </Section>

      <Section background="light">
        <div
          ref={mapRef}
          className={`transition-all duration-700 ease-out ${
            mapInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Us</h2>
            <p className="text-gray-600">Visit our showroom in Accra, Ghana</p>
          </div>
          <div className="rounded-2xl overflow-hidden h-96 shadow-xl border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.7887788931684!2d-0.1969!3d5.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnMTMuMyJOIDDCsDExJzQ4LjgiVw!5e0!3m2!1sen!2sgh!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Flames Up Solutions Location"
            ></iframe>
          </div>
        </div>
      </Section>
    </>
  );
}
