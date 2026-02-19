import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/events/EventsList';
import EventForm from './pages/events/EventForm';
import NewsList from './pages/NewsList';
import NewsForm from './pages/NewsForm';
import RegistrationsList from './pages/RegistrationsList';
import PartnersPage from './pages/PartnersPage';
import LiveChatPage from './pages/LiveChatPage';
import NetworkingPage from './pages/NetworkingPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import NewsletterPage from './pages/NewsletterPage';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="eventos" element={<EventsList />} />
          <Route path="eventos/novo" element={<EventForm />} />
          <Route path="eventos/:id" element={<EventForm />} />
          <Route path="noticias" element={<NewsList />} />
          <Route path="noticias/nova" element={<NewsForm />} />
          <Route path="noticias/:id" element={<NewsForm />} />
          <Route path="inscritos" element={<RegistrationsList />} />
          <Route path="parceiros" element={<PartnersPage />} />
          <Route path="chat" element={<LiveChatPage />} />
          <Route path="networking" element={<NetworkingPage />} />
          <Route path="mensagens" element={<MessagesPage />} />
          <Route path="calendario" element={<CalendarPage />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="config" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
