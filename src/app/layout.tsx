
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/header';
import { SidebarProvider, Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SettingsProvider } from '@/hooks/use-settings';
import { SupportButton } from '@/components/support-button';
import { MainNav } from '@/components/main-nav';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';
import { RiskManagementBanner } from '@/components/risk-management-banner';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'FlexFlow',
  description: 'AI-powered chart analysis and signal generation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
              <SidebarProvider>
                  <div className="flex flex-col min-h-screen bg-background text-sm">
                      <Header />
                      <RiskManagementBanner />
                      <Sidebar>
                          <SidebarContent>
                             <MainNav />
                          </SidebarContent>
                      </Sidebar>
                      <main className="flex-1 flex flex-col">
                          {children}
                      </main>
                      <SupportButton />
                      <ScrollToTopButton />
                  </div>
              </SidebarProvider>
          </SettingsProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
