import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { BotMessageSquare, Home } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SignalStream',
  description: 'Real-time trading signal delivery for multiple financial pairs.',
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
         <SidebarProvider>
            <div className="flex flex-col min-h-screen bg-background text-sm">
                <Header />
                 <Sidebar>
                    <SidebarContent>
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <Link href="/" passHref>
                                    <SidebarMenuButton>
                                        <Home />
                                        <span>Home</span>
                                    </SidebarMenuButton>
                                </Link>
                             </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/analyze" passHref>
                                    <SidebarMenuButton>
                                        <BotMessageSquare />
                                        <span>Chart Analyzer</span>
                                    </SidebarMenuButton>
                                </Link>
                             </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
            </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
