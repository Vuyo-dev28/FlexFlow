
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import type { Signal, FinancialPair, AppSettings } from '@/types/signal';
import { Watchlist } from '@/components/watchlist';
import { ALL_PAIRS } from '@/lib/mock-data';
import { generateSignal } from '@/ai/flows/generate-signal-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowRightLeft, BotMessageSquare, Settings, Target, HelpCircle, Settings2, BarChart, Tv, Download, Upload, ExternalLink } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SETTINGS_KEY = 'signalStreamSettings';

const defaultSettings: AppSettings = {
    tradingStyle: 'Day Trading',
    accountSize: 10000,
    riskPerTrade: 1,
    currency: 'USD',
    pushNotifications: true,
    emailNotifications: false,
    categories: ['Crypto', 'Stock Indices', 'Forex', 'Metals', 'Volatility Indices'],
};

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
                        Follow these steps to get the most out of the AI-powered tools.
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
                                <p>Choose the trading style that matches your strategy (e.g., 'Scalping', 'Day Trading'). The AI will tailor its analysis based on your selection.</p>
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
                                <p>Click 'Analyze Chart' to let the AI provide a detailed trading signal.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <ExternalLink className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">6. Execute Trade</h4>
                                <p>Finally, use the AI-generated signal to execute the trade in your MT4/MT5 account.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function HowItWorksGuide() {
    return (
        <div className="h-full p-4 md:p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">How It Works</CardTitle>
                    <CardDescription>Follow these steps to get your first AI-generated signal.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-4 text-sm text-muted-foreground">
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
                                <p>Choose the trading style that matches your strategy (e.g., 'Scalping', 'Day Trading'). The AI will tailor its analysis based on your selection.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <Tv className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">3. Take a Screenshot</h4>
                                <p>Capture a screenshot of your chart from TradingView or a similar platform.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <Upload className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">4. Upload to Analyzer</h4>
                                <p>Upload the screenshot using the "Chart Image" button.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                             <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <BotMessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">5. Analyze Chart</h4>
                                <p>Click 'Analyze Chart' to let the AI provide a detailed trading signal.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <ExternalLink className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">6. Execute Trade</h4>
                                <p>Finally, use the AI-generated signal to execute the trade in your MT4/MT5 account.</p>
                            </div>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

export default function HomePage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedPair, setSelectedPair] = useState<FinancialPair | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const { settings, setSettings, hasSettings, setHasSettings } = useSettings();

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setHasSettings(true);
    } else {
      setHasSettings(false);
    }
  }, [setHasSettings]);

  const handleSelectPair = useCallback(async (pair: FinancialPair | null) => {
    setSelectedPair(pair);
    setIsWatchlistOpen(false); // Close sheet on selection
    if (pair) {
      setIsLoading(true);
      try {
        const pairInfo = ALL_PAIRS.find(p => p.pair === pair);
        if (!pairInfo) {
            throw new Error(`Invalid pair selected: ${pair}`);
        }
        
        const newSignal = await generateSignal({ pair, tradingStyle: settings.tradingStyle });
        const signalWithMetadata: Signal = {
          ...newSignal,
          id: `ai-${pair}-${new Date().getTime()}`,
          pair: pair,
          category: pairInfo.category,
          timestamp: new Date(),
        };
        // Replace existing signal for the pair or add the new one
        setSignals(prevSignals => [
          signalWithMetadata,
          ...prevSignals.filter(s => s.pair !== pair)
        ]);
      } catch (error) {
        console.error("Error generating signal:", error);
        // Optionally, show a toast notification to the user
      } finally {
        setIsLoading(false);
      }
    }
  }, [settings.tradingStyle]);

  const filteredSignals = useMemo(() => {
    if (selectedPair) {
        return signals.filter(signal => signal.pair === selectedPair);
    }
    return signals;
  }, [signals, selectedPair]);
  
  const watchlistPairs = useMemo(() => {
    return ALL_PAIRS.map(p => p.pair);
  }, []);

  return (
    <>
        <div className="flex-1 flex flex-col">
          <div className='flex items-center justify-between px-4 py-2 border-b'>
            <div className='flex items-center gap-2'>
              <h2 className="text-lg font-semibold">Signals</h2>
            </div>
            <div className="flex items-center gap-2">
                <HowToUseDialog />
                <Sheet open={isWatchlistOpen} onOpenChange={setIsWatchlistOpen}>
                    <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <ArrowRightLeft />
                        <span className="sr-only">Open Watchlist</span>
                    </Button>
                    </SheetTrigger>
                    <SheetContent>
                    <Watchlist 
                        pairs={watchlistPairs}
                        selectedPair={selectedPair}
                        onSelectPair={handleSelectPair}
                    />
                    </SheetContent>
                </Sheet>
            </div>
          </div>
           
            <div className="flex-1 p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading && selectedPair && (
                    Array.from({ length: 1 }).map((_, index) => (
                        <div key={index} className="flex flex-col space-y-3">
                            <Skeleton className="h-[125px] w-full rounded-xl" />
                        </div>
                    ))
                )}
                {filteredSignals.map(signal => (
                <SignalCard
                    key={signal.id}
                    signal={signal}
                    settings={settings}
                    onSelect={() => setSelectedSignal(signal)}
                />
                ))}
            </div>
             {!isLoading && filteredSignals.length === 0 && (
                <HowItWorksGuide />
            )}
            </div>
        </div>

      <SignalDetailDialog
        signal={selectedSignal}
        settings={settings}
        open={!!selectedSignal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedSignal(null);
          }
        }}
      />
    </>
  );
}

    