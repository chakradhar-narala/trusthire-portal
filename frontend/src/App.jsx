import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import Subscribe from './pages/Subscribe';
import CreateJob from './pages/CreateJob';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import ProcessApplication from './pages/ProcessApplication';
import Applicants from './pages/Applicants';
import Profile from './pages/Profile';

import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/subscribe" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />
              <Route path="/create-job" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
              <Route path="/apply/:jobId" element={<ProtectedRoute><ProcessApplication /></ProtectedRoute>} />
              <Route path="/jobs/:id/applicants" element={<ProtectedRoute><Applicants /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
