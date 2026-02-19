import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';
import { useScroll } from '../hooks/useScroll';

interface NavigationProps {
  onOpenRegistration?: () => void;
}

export default function Navigation({ onOpenRegistration }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScroll(50);
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Navigation Links Configuration
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Sobre', path: '/#sobre' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Notícias', path: '/noticias' },
    { name: 'Contactos', path: '/contactos' },
  ];

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    if (path.startsWith('/#')) {
      const hash = path.substring(2);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled || !isHome || isMenuOpen
        ? 'py-3'
        : 'bg-transparent py-6'
        } ${isScrolled || !isHome ? 'bg-white/90 backdrop-blur-xl shadow-lg' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-[101] group">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Arena Eventos"
                className="h-12 w-auto transition-all duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {link.path.startsWith('/#') ? (
                    <a
                      href={link.path}
                      className={`text-sm font-semibold font-['Montserrat'] tracking-wide transition-all duration-300 hover:-translate-y-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full ${isScrolled || !isHome
                        ? 'text-[#1a1a1a] hover:text-[#4A90D9] after:bg-[#4A90D9]'
                        : 'text-white/90 hover:text-white after:bg-white'
                        }`}
                      onClick={(e) => {
                        if (location.pathname === '/' && link.path.startsWith('/#')) {
                          e.preventDefault();
                          handleNavClick(link.path);
                        }
                      }}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => handleNavClick(link.path)}
                      className={`text-sm font-semibold font-['Montserrat'] tracking-wide transition-all duration-300 hover:-translate-y-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full ${(isScrolled || !isHome)
                        ? (location.pathname === link.path ? 'text-[#4A90D9] after:w-full after:bg-[#4A90D9]' : 'text-[#1a1a1a] hover:text-[#4A90D9] after:bg-[#4A90D9]')
                        : 'text-white/90 hover:text-white after:bg-white'
                        }`}
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <button
              onClick={onOpenRegistration}
              className={`group relative px-6 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isScrolled || !isHome
                ? 'bg-[#4A90D9] hover:bg-[#1e3a5f] text-white shadow-[#4A90D9]/25'
                : 'bg-white text-[#1a1a1a] hover:bg-[#f0f7ff]'
                }`}
            >
              <div className="relative z-10 flex items-center gap-2 font-bold text-sm font-['Montserrat']">
                <span>Inscrever-se</span>
                <Rocket className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isScrolled || !isHome ? 'text-white' : 'text-[#4A90D9]'
                  }`} />
              </div>
            </button>
          </div>

          {/* Mobile Menu Button - Fixed relative Z-Index */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden relative z-[101] p-2 transition-colors duration-300 ${isMenuOpen
                ? 'text-white'
                : (isScrolled || !isHome ? 'text-[#1a1a1a]' : 'text-white')
              }`}
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Portal - Renders outside of app root */}
      {createPortal(
        <>
          {/* Backdrop Overlay */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Side Drawer */}
          <div
            className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-[9999] bg-[#0a1628] shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
          >
            <div className="flex flex-col h-full relative">
              {/* Logo in Drawer */}
              <div className="absolute top-6 left-8 z-50">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto opacity-90 grayscale brightness-200" />
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col items-start justify-center h-full gap-8 px-8 pt-24 pb-12 overflow-y-auto">
                {navLinks.map((link) => (
                  link.path.startsWith('/#') ? (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        if (location.pathname === '/' && link.path.startsWith('/#')) {
                          e.preventDefault();
                          handleNavClick(link.path);
                        }
                      }}
                      className="text-2xl font-bold text-white font-['Montserrat'] hover:text-[#4A90D9] transition-colors w-full border-b border-white/10 pb-4"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => handleNavClick(link.path)}
                      className={`text-2xl font-bold font-['Montserrat'] transition-colors w-full border-b border-white/10 pb-4 ${location.pathname === link.path ? 'text-[#4A90D9]' : 'text-white hover:text-[#4A90D9]'
                        }`}
                    >
                      {link.name}
                    </Link>
                  )
                ))}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onOpenRegistration) onOpenRegistration();
                  }}
                  className="w-full px-6 py-4 bg-[#4A90D9] text-white rounded-none font-bold font-['Montserrat'] shadow-lg hover:bg-[#3a7bc0] transition-all mt-4 flex items-center justify-center gap-3"
                >
                  <span>Inscrever-se Agora</span>
                  <Rocket className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-6 left-0 right-0 px-8 text-center text-white/30 text-xs">
                &copy; 2026 Arena Eventos
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
}
