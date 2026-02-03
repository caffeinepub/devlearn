import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useSystemInitialization } from './hooks/useSystemInitialization';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import UserDashboard from './pages/UserDashboard';
import CertificatesPage from './pages/CertificatesPage';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export type AppState =
  | { view: 'home' }
  | { view: 'course'; courseId: string }
  | { view: 'lesson'; courseId: string; lessonId: string }
  | { view: 'dashboard' }
  | { view: 'certificates' }
  | { view: 'admin' }
  | { view: 'payment-success'; courseId: string; sessionId: string }
  | { view: 'payment-failure'; courseId: string };

export type View = AppState['view'];

// Parse query params from hash
function parseHashQuery(hash: string): Record<string, string> {
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) return {};
  
  const queryString = hash.slice(queryIndex + 1);
  const params: Record<string, string> = {};
  
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });
  
  return params;
}

// URL-based state management for Chrome compatibility
function getStateFromURL(): AppState {
  const hash = window.location.hash.slice(1);
  if (!hash) return { view: 'home' };

  const queryIndex = hash.indexOf('?');
  const pathPart = queryIndex === -1 ? hash : hash.slice(0, queryIndex);
  const [view, ...params] = pathPart.split('/');
  
  switch (view) {
    case 'course':
      return params[0] ? { view: 'course', courseId: params[0] } : { view: 'home' };
    case 'lesson':
      return params[0] && params[1] 
        ? { view: 'lesson', courseId: params[0], lessonId: params[1] } 
        : { view: 'home' };
    case 'dashboard':
      return { view: 'dashboard' };
    case 'certificates':
      return { view: 'certificates' };
    case 'admin':
      return { view: 'admin' };
    case 'payment-success': {
      const query = parseHashQuery(hash);
      if (query.courseId && query.session_id) {
        return { view: 'payment-success', courseId: query.courseId, sessionId: query.session_id };
      }
      return { view: 'home' };
    }
    case 'payment-failure': {
      const query = parseHashQuery(hash);
      if (query.courseId) {
        return { view: 'payment-failure', courseId: query.courseId };
      }
      return { view: 'home' };
    }
    default:
      return { view: 'home' };
  }
}

function setURLFromState(state: AppState) {
  let hash = '';
  switch (state.view) {
    case 'home':
      hash = '';
      break;
    case 'course':
      hash = `course/${state.courseId}`;
      break;
    case 'lesson':
      hash = `lesson/${state.courseId}/${state.lessonId}`;
      break;
    case 'dashboard':
      hash = 'dashboard';
      break;
    case 'certificates':
      hash = 'certificates';
      break;
    case 'admin':
      hash = 'admin';
      break;
    case 'payment-success':
      hash = `payment-success?courseId=${state.courseId}&session_id=${state.sessionId}`;
      break;
    case 'payment-failure':
      hash = `payment-failure?courseId=${state.courseId}`;
      break;
  }
  window.location.hash = hash;
}

function AppContent() {
  const [appState, setAppState] = useState<AppState>(getStateFromURL);
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, refetch: refetchProfile } = useGetCallerUserProfile();
  
  // Single source of truth for initialization
  const { isInitializing, systemReady, systemHealth, courses, initError, retry } = useSystemInitialization();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Sync state with URL hash for Chrome compatibility
  useEffect(() => {
    const handleHashChange = () => {
      const newState = getStateFromURL();
      setAppState(newState);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Only show profile setup after system is ready
  const showProfileSetup = isAuthenticated && 
    systemReady &&
    !profileLoading && 
    isFetched && 
    userProfile === null;

  const navigate = (state: AppState) => {
    setAppState(state);
    setURLFromState(state);
  };

  // Refetch profile after system becomes ready
  useEffect(() => {
    if (isAuthenticated && systemReady && !profileLoading) {
      console.log('[App] System ready, refetching profile...');
      refetchProfile();
    }
  }, [isAuthenticated, systemReady, profileLoading, refetchProfile]);

  // Show initialization screen only when authenticated and initializing
  if (isAuthenticated && isInitializing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header navigate={navigate} currentView={appState.view} />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
          <div className="text-center space-y-6 p-8 max-w-md">
            {initError ? (
              <>
                <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
                <h2 className="text-2xl font-bold">Initialization Error</h2>
                <p className="text-muted-foreground">
                  Failed to initialize the platform. Please try again.
                </p>
                <Alert variant="destructive" className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription className="text-sm">
                    {initError.message || 'Unknown error occurred'}
                  </AlertDescription>
                </Alert>
                <Button onClick={retry} size="lg" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Initialization
                </Button>
              </>
            ) : (
              <>
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Setting Up Your Platform</h2>
                  <p className="text-muted-foreground">
                    Preparing your learning environment...
                  </p>
                </div>
                {systemHealth && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Loading courses</span>
                      <div className="flex items-center gap-2">
                        {systemHealth.coursesLoaded && courses && courses.length >= 4 ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{courses.length}/4</span>
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="font-medium">{courses?.length || systemHealth.courseCount.toString()}/4</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Admin setup</span>
                      {systemHealth.adminAssigned ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">System initialization</span>
                      {systemHealth.initializationComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={retry} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header navigate={navigate} currentView={appState.view} />
      <main className="flex-1">
        <ErrorBoundary>
          {appState.view === 'home' && <HomePage navigate={navigate} />}
          {appState.view === 'course' && <CoursePage courseId={appState.courseId} navigate={navigate} />}
          {appState.view === 'lesson' && (
            <LessonPage courseId={appState.courseId} lessonId={appState.lessonId} navigate={navigate} />
          )}
          {appState.view === 'dashboard' && <UserDashboard navigate={navigate} />}
          {appState.view === 'certificates' && <CertificatesPage navigate={navigate} />}
          {appState.view === 'admin' && <AdminDashboard navigate={navigate} />}
          {appState.view === 'payment-success' && (
            <PaymentSuccessPage courseId={appState.courseId} sessionId={appState.sessionId} navigate={navigate} />
          )}
          {appState.view === 'payment-failure' && (
            <PaymentFailurePage courseId={appState.courseId} navigate={navigate} />
          )}
        </ErrorBoundary>
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <AppContent />
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}
