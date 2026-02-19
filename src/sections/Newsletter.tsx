import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bell, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

export default function Newsletter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const heading = contentRef.current.querySelector('h2');
        const subheading = contentRef.current.querySelector('p');
        const form = contentRef.current.querySelector('form');

        gsap.fromTo(heading, { opacity: 0, y: -50 }, {
          opacity: 1, y: 0, duration: 0.6, ease: 'bounce.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }, delay: 0.2,
        });

        gsap.fromTo(subheading, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }, delay: 0.4,
        });

        gsap.fromTo(form, { opacity: 0, y: 40, translateZ: -50 }, {
          opacity: 1, y: 0, translateZ: 0, duration: 0.6, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }, delay: 0.6,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert({ email });

        if (error) {
          // Check for duplicate email error (unique constraint)
          if (error.code === '23505') {
            setIsSubmitted(true); // Treat as success to not reveal existence? Or show message?
            // For now, treat as success but maybe shorter timeout or same.
          } else {
            throw error;
          }
        }

        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setEmail('');
        }, 3000);

      } catch (err) {
        console.error('Error subscribing:', err);
        alert('Erro ao subscrever. Tente novamente.');
      }
    }
  };

  return (
    <section
      id="noticias"
      ref={sectionRef}
      className="relative py-12 lg:py-16 overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/OQCI430.jpg)',
        }}
      />

      {/* Subtle Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4A90D9]/40 via-[#6BB8E8]/30 to-[#89CFF0]/40" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white/8 blur-xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-3xl mx-auto">
          <div ref={contentRef} className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-6">
              <Bell className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-['Montserrat']">
              Fique atento
            </h2>

            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto font-['Open_Sans']">
              Subscreva a nossa newsletter para ficar a par das últimas novidades e eventos
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" style={{ perspective: '1000px' }}>
              <div className="flex-1 relative">
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email" required disabled={isSubmitted}
                  className="w-full px-6 py-4 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder-white/50 outline-none transition-all duration-300 focus:bg-white/25 focus:border-white/50 font-['Open_Sans']"
                />
              </div>
              <button
                type="submit" disabled={isSubmitted}
                className={`px-8 py-4 rounded-full font-semibold font-['Montserrat'] flex items-center justify-center gap-2 transition-all duration-300 ${isSubmitted
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-[#4A90D9] hover:bg-white/90 hover:scale-105 hover:shadow-lg'
                  }`}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Subscrito!</span>
                  </>
                ) : (
                  <>
                    <span>Subscrever</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-white/40 text-sm mt-4 font-['Open_Sans']">
              Ao subscrever, concorda com a nossa política de privacidade
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
