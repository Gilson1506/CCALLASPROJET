import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const quickLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Sobre', href: '#sobre' },
  { name: 'Eventos', href: '#eventos' },
  { name: 'Notícias', href: '#noticias' },
];



export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);

  const [contactInfo, setContactInfo] = useState<any>(null);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    // Use helper if available or direct supabase
    // Importing supabase from lib
    const { supabase } = await import('../lib/supabase');
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'contact_info')
        .single();

      if (data) setContactInfo(data.value);
    } catch (err) {
      console.error("Error fetching footer contact:", err);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (logoRef.current) {
        gsap.fromTo(logoRef.current, { opacity: 0, scale: 0.8 }, {
          opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%' },
        });
      }

      if (linksRef.current) {
        const headers = linksRef.current.querySelectorAll('h4');
        const links = linksRef.current.querySelectorAll('a');
        gsap.fromTo(headers, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, {
          opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.4, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%' }, delay: 0.2,
        });
        gsap.fromTo(links, { opacity: 0, x: -20 }, {
          opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%' }, delay: 0.3,
        });
      }

      if (contactRef.current) {
        const items = contactRef.current.querySelectorAll('.contact-item');
        gsap.fromTo(items, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%' }, delay: 0.4,
        });
      }

      if (socialRef.current) {
        const icons = socialRef.current.querySelectorAll('.social-icon');
        gsap.fromTo(icons, { opacity: 0, scale: 0, rotateY: 180 }, {
          opacity: 1, scale: 1, rotateY: 0, duration: 0.4, stagger: 0.08, ease: 'elastic.out(1, 0.5)',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%' }, delay: 0.5,
        });
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { address, phone, email, facebook, instagram, linkedin } = contactInfo || {};

  return (
    <footer
      ref={footerRef}
      className="relative bg-white text-gray-600 pt-16 lg:pt-20 pb-8 border-t border-gray-100"
    >
      {/* Top Gradient Line REMOVED as per white theme request, or keep consistent? keeping minimal */}

      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
            <div ref={logoRef} className="sm:col-span-2 lg:col-span-1">
              <div className="space-y-6">
                <Link to="/" className="inline-block group">
                  <div className="flex items-center gap-2">
                    {/* Logo normal color */}
                    <img src="/logo.png" alt="Arena Eventos" className="h-16 w-auto opacity-100 transition-opacity" />
                  </div>
                </Link>
                <p className="text-gray-500 text-sm leading-relaxed font-['Open_Sans']">
                  Somos uma empresa angolana especializada na organização e gestão de
                  feiras e eventos.
                </p>
              </div>
            </div>

            <div ref={linksRef}>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#0a1628] font-['Montserrat']">
                Links Rápidos
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                      className="text-gray-500 hover:text-[#4A90D9] hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1 font-['Open_Sans']"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div ref={contactRef}>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#0a1628] font-['Montserrat']">
                Contactos
              </h4>
              <ul className="space-y-3">
                <li className="contact-item flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#4A90D9] mt-1 flex-shrink-0" />
                  <span className="text-gray-500 text-sm font-['Open_Sans']">
                    {address ? (
                      <>
                        {address}
                      </>
                    ) : (
                      <>
                        Oficinas Gerais dos Caminhos de ferro de Luanda<br />
                        Cazenga | Angola
                      </>
                    )}
                  </span>
                </li>
                <li className="contact-item">
                  <a href={`tel:${phone}`} className="flex items-center gap-3 text-gray-500 hover:text-[#4A90D9] transition-colors duration-200">
                    <Phone className="w-4 h-4 text-[#4A90D9] flex-shrink-0" />
                    <span className="text-sm font-['Open_Sans']">{phone || '+244 924 901 280'}</span>
                  </a>
                </li>
                <li className="contact-item">
                  <a href={`mailto:${email}`} className="flex items-center gap-3 text-gray-500 hover:text-[#4A90D9] transition-colors duration-200">
                    <Mail className="w-4 h-4 text-[#4A90D9] flex-shrink-0" />
                    <span className="text-sm font-['Open_Sans']">{email || 'geral@eventosarena.co.ao'}</span>
                  </a>
                </li>
              </ul>
            </div>

            <div ref={socialRef}>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-[#0a1628] font-['Montserrat']">
                Redes Sociais
              </h4>
              <div className="flex gap-3 items-center">
                {[
                  { icon: Facebook, href: facebook, label: 'Facebook' },
                  { icon: Instagram, href: instagram, label: 'Instagram' },
                  { icon: Linkedin, href: linkedin, label: 'LinkedIn' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`social-icon w-10 h-10 rounded-lg bg-gray-100 hover:bg-[#4A90D9] flex items-center justify-center transition-all duration-300 hover:scale-110 group ${!social.href ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <social.icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors duration-300" />
                  </a>
                ))}

                {/* WhatsApp Icon Only */}
                <a
                  href="https://wa.me/244924901280" target="_blank" rel="noopener noreferrer"
                  className="social-icon w-10 h-10 rounded-lg bg-green-50 hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110 group text-green-600 hover:text-white"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm font-['Open_Sans']">
                © 2026 Todos Direitos Reservados.
              </p>
              <p className="text-gray-400 text-sm flex items-center gap-1 font-['Open_Sans']">
                Desenvolvido por
                <a href="https://icudiama.com" target="_blank" rel="noopener noreferrer" className="text-[#4A90D9] hover:text-[#0a1628] transition-colors duration-200 inline-flex items-center gap-1 font-bold">
                  icudiama
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
