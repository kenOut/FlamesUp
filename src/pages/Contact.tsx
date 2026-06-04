import { useState, FormEvent } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      <section className="bg-black py-16">
        <Container>
          <h1 className="text-5xl font-bold text-white mb-4 text-center">Contact Us</h1>
          <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto">
            Get in touch with our team and let's discuss your commercial kitchen needs
          </p>
        </Container>
      </section>

      <Section background="darker">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Get In Touch</h2>
            <p className="text-gray-300 mb-8">
              Have questions about our products or services? Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-3 rounded-lg shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Our Location</h3>
                    <a href="https://share.google/Sr307kB3AmSKX3Z8V" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500">
                      Flame up Kitchen Equipment, Accra, Ghana
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-3 rounded-lg shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <a href="tel:+233270131313" className="text-gray-400 hover:text-orange-500">
                      +233 27 013 1313
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-3 rounded-lg shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <a href="mailto:info@flameupghana.com" className="text-gray-400 hover:text-orange-500">
                      info@flameupghana.com
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-3 rounded-lg shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Business Hours</h3>
                    <p className="text-gray-400">Monday - Saturday</p>
                    <p className="text-gray-400">8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

            {success && (
              <div className="bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg mb-6">
                Thank you for contacting us! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="bg-orange-600/20 border border-orange-600 text-orange-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-white font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="+233 123 456 789"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-white font-medium mb-2">
                  Inquiry Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="general">General Inquiry</option>
                  <option value="quote">Request Quote</option>
                  <option value="consultation">Free Consultation</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>
      </Section>

      <Section background="dark">
        <div className="rounded-2xl overflow-hidden h-96">
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
      </Section>
    </>
  );
}
