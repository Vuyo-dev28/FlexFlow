
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import type { Signal, FinancialPair, AppSettings } from '@/types/signal';
import { ALL_PAIRS } from '@/lib/mock-data';
import { generateSignal } from '@/ai/flows/generate-signal-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BotMessageSquare, Settings, Target, HelpCircle, Settings2, BarChart, Tv, Download, Upload, ExternalLink, ArrowRight } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const SETTINGS_KEY = 'signalStreamSettings';

function HowToUseDialog() {
    return (
        <Dialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <HelpCircle className="h-5 w-5" />
                                <span className="sr-only">How to Use</span>
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>How to Use</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>How to Use SignalStream</DialogTitle>
                    <DialogDescription>
                        Follow these steps to get the most out of the System-powered tools.
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 py-4 text-sm text-muted-foreground">
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <Settings2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">1. Configure Your Settings</h4>
                                <p>First, go to the settings panel (top-right gear icon) to input your account size, risk tolerance, and preferred currency. This is essential for accurate risk management calculations.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <BarChart className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">2. Select Your Trading Style</h4>
                                <p>Choose the trading style that matches your strategy (e.g., 'Scalping', 'Day Trading'). The System will tailor its analysis based on your selection.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <Tv className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">3. Take a Screenshot</h4>
                                <p>For chart analysis, capture a screenshot from TradingView or a similar platform.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <Upload className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">4. Upload to Analyzer</h4>
                                <p>Go to the <span className="font-semibold text-primary/80">Chart Analyzer</span> to upload your screenshot for analysis, or use the <span className="font-semibold text-primary/80">Watchlist</span> here to generate a signal for a pair directly.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                             <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <BotMessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">5. Analyze Chart</h4>
                                <p>Click 'Analyze Chart' to let the System provide a detailed trading signal.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <ExternalLink className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">6. Execute Trade</h4>
                                <p>Finally, use the System-generated signal to execute the trade in your MT4/MT5 account.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function HowItWorksGuide() {
    const steps = [
        {
            icon: Settings2,
            title: "Configure Your Settings",
            description: "Go to the settings panel to input your account size, risk tolerance, and currency. This is essential for accurate risk management."
        },
        {
            icon: BarChart,
            title: "Select Your Trading Style",
            description: "Choose the trading style that matches your strategy (e.g., 'Scalping', 'Day Trading'). The System will tailor its analysis accordingly."
        },
        {
            icon: Tv,
            title: "Take a Screenshot",
            description: "Capture a screenshot of your chart from TradingView or a similar platform for analysis."
        },
        {
            icon: Upload,
            title: "Upload to Analyzer",
            description: "Upload the screenshot using the 'Chart Image' button on the Chart Analyzer page."
        },
        {
            icon: BotMessageSquare,
            title: "Analyze Chart",
            description: "Click 'Analyze Chart' to let the System provide a detailed, actionable trading signal."
        },
        {
            icon: ExternalLink,
            title: "Execute Trade",
            description: "Use the System-generated signal to execute the trade in your MT4/MT5 account."
        }
    ];

    return (
        <div className="h-full p-4 md:p-6 flex flex-col">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">How It Works</h1>
                <p className="text-muted-foreground mt-2">Get your first System-generated signal by following these steps.</p>
                <div className="mt-6 text-center">
                    <Link href="/analyze" passHref>
                        <Button size="lg">
                            START CHART ANALYZER
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {steps.map((step, index) => (
                    <Card key={index} className="bg-card/50 hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                             <div className="bg-primary/10 text-primary p-3 rounded-full">
                                <step.icon className="h-6 w-6" />
                            </div>
                            <CardTitle>{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{step.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      router.replace('/analyze');
    }
  }, [pathname, router]);

  // This content will be briefly visible before the redirect.
  // You can show a loader here if needed.
  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 justify-center items-center">
        <HowItWorksGuide />
    </div>
  );
}
