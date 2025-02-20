import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { BattleScene } from './components/BattleScene';
import HolobotsInfo from './pages/HolobotsInfo';
import HolosFarm from './pages/HolosFarm';
import Quests from './pages/Quests';
import Training from './pages/Training';
import MintPage from './pages/Mint';
import LoginPage from './pages/Login';
import { Leaderboard } from './pages/Leaderboard';
import { NavigationMenu } from './components/NavigationMenu';
import { ThemeProvider } from './providers/theme-provider';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { XpProvider } from '@/contexts/XpContext';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <XpProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <BattleScene />
                  </ProtectedRoute>
                } />
                <Route path="/holobots-info" element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <HolobotsInfo />
                  </ProtectedRoute>
                } />
                <Route path="/holos-farm" element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <HolosFarm />
                  </ProtectedRoute>
                } />
                <Route path="/quests" element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <Quests />
                  </ProtectedRoute>
                } />
                <Route path="/training" element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <Training />
                  </ProtectedRoute>
                } />
                <Route path="/mint" element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <MintPage />
                  </ProtectedRoute>
                } />
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <Leaderboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </XpProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;