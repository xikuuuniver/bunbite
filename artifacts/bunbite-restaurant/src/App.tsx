import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { MenuProvider } from '@/context/MenuContext';
import { CategoryProvider } from '@/context/CategoryContext';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import MarqueeTicker from '@/components/MarqueeTicker';
import WhyBunBite from '@/components/WhyBunBite';
import BestSellers from '@/components/BestSellers';
import DiscoverMenus from '@/components/DiscoverMenus';
import Testimonials from '@/components/Testimonials';
import ReserveTable from '@/components/ReserveTable';
import OpeningHours from '@/components/OpeningHours';
import Footer from '@/components/Footer';
import NotFound from '@/pages/not-found';
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import DevToolkit from '@/components/DevToolkit';

const queryClient = new QueryClient();

function Home() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <MarqueeTicker />
        <WhyBunBite />
        <BestSellers />
        <DiscoverMenus />
        <Testimonials />
        <ReserveTable />
        <OpeningHours />
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard/:section?" component={DashboardLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrdersProvider>
          <QueryClientProvider client={queryClient}>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
            <DevToolkit />
          </QueryClientProvider>
        </OrdersProvider>
      </MenuProvider>
    </AuthProvider>
  );
}

export default App;
