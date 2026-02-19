import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import RegistrationModal from './components/RegistrationModal';
import LiveChat from './components/LiveChat';

// Layout Components
import Navigation from './sections/Navigation';
import Footer from './sections/Footer';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import News from './pages/News';
import NewsDetails from './pages/NewsDetails';
import ContactPage from './pages/ContactPage';

import './App.css';

// Layout Component
function Layout() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#f0f7ff]">
      <Navigation onOpenRegistration={() => setIsRegistrationOpen(true)} />

      <main>
        <Outlet />
      </main>

      <Footer />

      {/* Global Components */}
      <LiveChat />
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/eventos/:id" element={<EventDetails />} />
          <Route path="/noticias" element={<News />} />
          <Route path="/noticias/:id" element={<NewsDetails />} />
          <Route path="/contactos" element={<ContactPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
