import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Send, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const contactInfo = [
  {
    icon: MapPin,
    title: 'Endereço',
    content: 'Oficinas Gerais dos Caminhos de ferro de Luanda',
    subContent: 'Cazenga | Angola',
  },
  {
    icon: Phone,
    title: 'Telefone',
    content: '+244 924 901 280',
    link: 'tel:+244924901280',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'geral@eventosarena.co.ao',
    link: 'mailto:geral@eventosarena.co.ao',
  },
];

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
          }
        );
      }

      if (infoRef.current) {
        const items = infoRef.current.querySelectorAll('.contact-item');
        items.forEach((item, index) => {
          const icon = item.querySelector('.contact-icon');
          const text = item.querySelector('.contact-text');
          gsap.fromTo(icon, { opacity: 0, scale: 0, rotateY: 180 }, {
            opacity: 1, scale: 1, rotateY: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' }, delay: index * 0.2,
          });
          gsap.fromTo(text, { opacity: 0, x: -30 }, {
            opacity: 1, x: 0, duration: 0.4, ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' }, delay: index * 0.2 + 0.1,
          });
        });
      }

      if (formRef.current) {
        const inputs = formRef.current.querySelectorAll('.form-group');
        gsap.fromTo(inputs, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 50%' }, delay: 0.3,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section
      id="contactos"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-[#89CFF0]/8 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-[#6BB8E8]/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div ref={headingRef} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#89CFF0]/10 mb-4">
              <MessageSquare className="w-4 h-4 text-[#4A90D9]" />
              <span className="text-sm font-semibold text-[#4A90D9] font-['Montserrat']">Contacto</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a1a1a] font-['Montserrat']">
              Fale Connosco
            </h2>
            <div className="mt-4 w-32 h-1 bg-gradient-to-r from-[#4A90D9] to-[#89CFF0] mx-auto rounded-full" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div ref={infoRef}>
              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-item flex items-start gap-4">
                    <div
                      className="contact-icon flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A90D9] to-[#6BB8E8] flex items-center justify-center shadow-lg shadow-[#89CFF0]/20"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="contact-text">
                      <h4 className="text-sm font-semibold text-[#6c757d] uppercase tracking-wider mb-1 font-['Montserrat']">
                        {info.title}
                      </h4>
                      {info.link ? (
                        <a href={info.link} className="text-lg text-[#1a1a1a] hover:text-[#4A90D9] transition-colors duration-300 font-['Open_Sans']">
                          {info.content}
                        </a>
                      ) : (
                        <>
                          <p className="text-lg text-[#1a1a1a] font-['Open_Sans']">{info.content}</p>
                          {info.subContent && <p className="text-[#6c757d] font-['Open_Sans']">{info.subContent}</p>}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-10 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#4A90D9] to-[#6BB8E8] h-64 flex items-center justify-center"
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                <div className="text-center text-white p-8">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-60" />
                  <p className="text-lg font-['Montserrat']">Cazenga, Luanda</p>
                  <p className="text-white/60 text-sm mt-2 font-['Open_Sans']">Angola</p>
                </div>
              </div>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-xl shadow-[#89CFF0]/10 p-8 lg:p-10 border border-[#e0eaf5]"
              style={{ perspective: '1000px' }}
            >
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-['Montserrat']">
                Envie uma mensagem
              </h3>

              <div className="space-y-6">
                <div className="form-group">
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 font-['Montserrat'] ${focusedField === 'name' ? 'text-[#4A90D9]' : 'text-[#6c757d]'}`}>
                    Nome *
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'translate-z-20' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                    <input
                      type="text" required value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 rounded-xl border-2 bg-[#f0f7ff] transition-all duration-300 outline-none font-['Open_Sans'] ${focusedField === 'name' ? 'border-[#4A90D9] shadow-lg shadow-[#89CFF0]/15' : 'border-transparent hover:border-[#89CFF0]/30'}`}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 font-['Montserrat'] ${focusedField === 'email' ? 'text-[#4A90D9]' : 'text-[#6c757d]'}`}>
                    Email *
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'translate-z-20' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                    <input
                      type="email" required value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 rounded-xl border-2 bg-[#f0f7ff] transition-all duration-300 outline-none font-['Open_Sans'] ${focusedField === 'email' ? 'border-[#4A90D9] shadow-lg shadow-[#89CFF0]/15' : 'border-transparent hover:border-[#89CFF0]/30'}`}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 font-['Montserrat'] ${focusedField === 'message' ? 'text-[#4A90D9]' : 'text-[#6c757d]'}`}>
                    Mensagem *
                  </label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'message' ? 'translate-z-20' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                    <textarea
                      required rows={4} value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-4 rounded-xl border-2 bg-[#f0f7ff] transition-all duration-300 outline-none resize-none font-['Open_Sans'] ${focusedField === 'message' ? 'border-[#4A90D9] shadow-lg shadow-[#89CFF0]/15' : 'border-transparent hover:border-[#89CFF0]/30'}`}
                      placeholder="Como podemos ajudar?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="group w-full py-4 px-6 bg-gradient-to-r from-[#4A90D9] to-[#6BB8E8] text-white rounded-xl font-semibold font-['Montserrat'] shadow-lg hover:shadow-xl hover:shadow-[#89CFF0]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <span>Enviar Mensagem</span>
                  <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
