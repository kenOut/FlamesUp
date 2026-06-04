import { useState, FormEvent } from 'react';
import { Mail } from 'lucide-react';
import Button from '../ui/Button';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setEmail('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-10 relative overflow-hidden shadow-2xl h-full flex flex-col justify-center">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10"></div>

      <div className="relative z-10 text-center">
        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">
          Stay Updated with Latest Products
        </h2>
        <p className="text-white/90 text-base mb-8">
          Subscribe to our newsletter and get exclusive deals, new product announcements, and expert kitchen tips.
        </p>

        {success ? (
          <div className="bg-white/20 border border-white/40 text-white px-6 py-4 rounded-lg inline-block">
            Thank you for subscribing! Check your email for confirmation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="px-5 py-4 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white backdrop-blur-sm"
            />
            <Button type="submit" size="lg" variant="secondary" className="w-full">
              Subscribe Now
            </Button>
          </form>
        )}

        <p className="text-white/70 text-sm mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}