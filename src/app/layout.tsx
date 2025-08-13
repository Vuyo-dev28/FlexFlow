
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/header';
import { SidebarProvider, Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SettingsProvider } from '@/hooks/use-settings';
import { SupportButton } from '@/components/support-button';
import { MainNav } from '@/components/main-nav';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SettingsProvider>
            <SidebarProvider>
                <div className="flex flex-col min-h-screen bg-background text-sm">
                    <Header />
                    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 flex items-center justify-center text-center gap-2 py-2 px-4 text-xs">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertDescription>
                            Please remember to use proper risk management.
                        </AlertDescription>
                    </Alert>
                    <Sidebar>
                        <SidebarContent>
                           <MainNav />
                        </SidebarContent>
                    </Sidebar>
                    <main className="flex-1 flex flex-col">
                        {children}
                    </main>
                    <SupportButton />
                </div>
            </SidebarProvider>
        </SettingsProvider>
        <Toaster />
      </body>
    </html>
  );
}
