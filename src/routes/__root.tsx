import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { Header } from '../components/Header';
import { UpdatePrompt } from '../components/UpdatePrompt';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-6 pb-12 lg:px-6 lg:pt-8">
        <Outlet />
      </main>
      <UpdatePrompt />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
