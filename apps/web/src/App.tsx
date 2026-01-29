import { AuthProvider } from '@/features/auth';
import { SidebarProvider } from '@/hooks';
import { router } from '@/routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <RouterProvider router={router} />
        </SidebarProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={5000}
          offset="80px"
          toastOptions={{
            style: {
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
