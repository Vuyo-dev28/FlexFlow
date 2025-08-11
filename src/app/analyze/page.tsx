
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Lightbulb, TrendingUp, TrendingDown, Hourglass, Trash2, CheckCircle2, XCircle, Award, Info, Scale, DollarSign, HelpCircle, Settings2, Tv, Download, BarChart, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { analyzeChart } from '@/ai/flows/analyze-chart-flow';
import { AnalyzeChartOutput, TradingStyle, tradingStyles, AppSettings, Currency, currencySymbols } from '@/types/signal';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSettings } from '@/hooks/use-settings';

const LOCAL_STORAGE_KEY = 'analysisHistory';
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
                    <DialogTitle>How to Use the Chart Analyzer</DialogTitle>
                    <DialogDescription>
                        Follow these steps to get the most out of the AI analysis tool.
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
                                <p>Capture a screenshot of your chart from TradingView or a similar platform.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <Download className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">4. Upload to Analyzer</h4>
                                <p>Upload the screenshot using the "Chart Image" button.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                                <Upload className="h-5 w-5" />
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

function WinRateTracker({ history }: { history: AnalyzeChartOutput[] }) {
    const { wins, completedTrades } = useMemo(() => {
        const completed = history.filter(item => typeof item.isWin === 'boolean');
        const wins = completed.filter(item => item.isWin).length;
        return { wins, completedTrades: completed.length };
    }, [history]);

    const winRate = completedTrades > 0 ? (wins / completedTrades) * 100 : 0;

    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5"/>
                    Win Rate
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{winRate.toFixed(1)}%</div>
                    <div className="text-right text-sm">
                        <p className="font-semibold text-green-500">{wins} Wins</p>
                        <p className="text-muted-foreground">{completedTrades - wins} Losses</p>
                    </div>
                </div>
                 <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${winRate}%` }}></div>
                </div>
            </CardContent>
        </Card>
    );
}

function RiskManagementDetails({ result, settings }: { result: AnalyzeChartOutput, settings: AppSettings}) {
     if (result.type === 'HOLD' || !result.entry || !result.takeProfit || !result.stopLoss) {
        return null;
    }

    const stopLossDistance = Math.abs(result.entry - result.stopLoss);
    const takeProfitDistance = Math.abs(result.entry - result.takeProfit);
    const riskRewardRatio = stopLossDistance > 0 ? takeProfitDistance / stopLossDistance : 0;

    const riskAmount = settings.accountSize * (settings.riskPerTrade / 100);
    const positionSize = stopLossDistance > 0 ? riskAmount / stopLossDistance : 0;
    const potentialLoss = positionSize * stopLossDistance;
    const potentialProfit = positionSize * takeProfitDistance;
    const currencySymbol = currencySymbols[settings.currency] || '$';

    return (
        <div className="space-y-4">
             <Separator />
             <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Scale /> Risk Profile</h3>
                <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Risk/Reward Ratio</span>
                    <span className="font-mono text-right text-foreground">1 : {riskRewardRatio.toFixed(2)}</span>

                     <span className="text-muted-foreground">Position Size</span>
                    <span className="font-mono text-right text-foreground">{positionSize.toFixed(4)} units</span>

                    <span className="text-muted-foreground">Potential Profit</span>
                    <span className="font-mono text-right text-green-500">{currencySymbol}{potentialProfit.toFixed(2)}</span>

                    <span className="text-muted-foreground">Potential Loss</span>
                    <span className="font-mono text-right text-red-500">{currencySymbol}{potentialLoss.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

function AnalysisResultCard({ result, settings, onDelete, onMarkResult }: { result: AnalyzeChartOutput; settings: AppSettings; onDelete: (id: string) => void; onMarkResult: (id: string, isWin: boolean) => void; }) {
    const SignalIcon = result.type === 'BUY' ? TrendingUp : result.type === 'SELL' ? TrendingDown : Hourglass;

    return (
        <Card className={cn(
            "flex-shrink-0",
            result.isWin === true && "border-green-500/50",
            result.isWin === false && "border-red-500/50"
        )}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Analysis Result</span>
                    <Badge
                        variant="outline"
                        className={cn(
                        'text-base font-semibold py-1 px-3',
                        result.type === 'BUY' && 'border-green-500/50 text-green-400 bg-green-500/10',
                        result.type === 'SELL' && 'border-red-500/50 text-red-400 bg-red-500/10',
                        result.type === 'HOLD' && 'border-amber-500/50 text-amber-400 bg-amber-500/10',
                        )}
                    >
                        <SignalIcon className="mr-1.5 h-4 w-4" />
                        {result.type}
                    </Badge>
                </CardTitle>
                <CardDescription>AI-generated signal based on the uploaded chart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border rounded-md p-2">
                    <Image
                        src={result.chartImageUri}
                        alt="Analyzed chart"
                        width={800}
                        height={600}
                        className="w-full h-auto rounded-md"
                    />
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold">Rationale</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {result.rationale}
                    </p>
                </div>
                {result.type !== 'HOLD' && result.entry && result.takeProfit && result.stopLoss && (
                    <>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center">
                            <div className='text-red-400'>
                                <p className="text-muted-foreground text-xs">Stop Loss</p>
                                <p className="font-mono text-sm font-semibold">{result.stopLoss?.toFixed(4)}</p>
                            </div>
                            <div className='text-foreground'>
                                <p className="text-muted-foreground text-xs">Entry Price</p>
                                <p className="font-mono text-sm font-semibold">{result.entry?.toFixed(4)}</p>
                            </div>
                            <div className='text-green-400'>
                                <p className="text-muted-foreground text-xs">Take Profit</p>
                                <p className="font-mono text-sm font-semibold">{result.takeProfit?.toFixed(4)}</p>
                            </div>
                    </div>
                    </>
                )}
                <RiskManagementDetails result={result} settings={settings} />
            </CardContent>
             {result.type !== 'HOLD' && (
                <CardFooter className="flex-col items-stretch gap-2 pt-4">
                     <div className="flex gap-2">
                         <Button variant="outline" size="sm" className="w-full" onClick={() => onMarkResult(result.id, true)} disabled={result.isWin === true}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            Mark as Win
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onMarkResult(result.id, false)} disabled={result.isWin === false}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                            Mark as Loss
                        </Button>
                    </div>
                     <Button variant="destructive" size="sm" className="w-full" onClick={() => onDelete(result.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Analysis
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

export default function AnalyzePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalyzeChartOutput[]>([]);
  const { settings, setHasSettings } = useSettings();
  const [tradingStyle, setTradingStyle] = useState<TradingStyle>(settings.tradingStyle);
  const { toast } = useToast();

  useEffect(() => {
    setTradingStyle(settings.tradingStyle);
  }, [settings.tradingStyle]);

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
            setAnalysisHistory(JSON.parse(storedHistory));
        }
    } catch (error) {
        console.error("Failed to parse analysis history from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setHasSettings(true);
    } else {
      setHasSettings(false);
    }
  }, [setHasSettings]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload an image file (e.g., PNG, JPG).',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload a chart image to analyze.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await analyzeChart({ chartImageUri: base64data, tradingStyle });
        
        const updatedHistory = [result, ...analysisHistory];
        setAnalysisHistory(updatedHistory);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
        
        setImageFile(null);
        setImagePreview(null);
      };
    } catch (error) {
      console.error('Error analyzing chart:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Something went wrong while analyzing the chart. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnalysis = (id: string) => {
    const updatedHistory = analysisHistory.filter(item => item.id !== id);
    setAnalysisHistory(updatedHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
    toast({
        title: 'Analysis Deleted',
        description: 'The analysis has been removed from your history.',
    });
  };

  const handleMarkResult = (id: string, isWin: boolean) => {
    const updatedHistory = analysisHistory.map(item => 
        item.id === id ? { ...item, isWin } : item
    );
    setAnalysisHistory(updatedHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
    toast({
        title: 'Result Marked',
        description: `Analysis has been marked as a ${isWin ? 'win' : 'loss'}.`,
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-6">
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight">Chart Analyzer</h1>
                <p className="text-muted-foreground">
                    Upload a chart and select your trading style. The AI will provide a technical analysis signal.
                </p>
            </div>
            <HowToUseDialog />
        </div>

        <WinRateTracker history={analysisHistory} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Chart</CardTitle>
                        <CardDescription>Select a screenshot of your trading chart and specify your trading style.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="trading-style-select">Trading Style</Label>
                             <Select value={tradingStyle} onValueChange={(value) => setTradingStyle(value as TradingStyle)}>
                                <SelectTrigger id="trading-style-select">
                                    <SelectValue placeholder="Select a trading style" />
                                </SelectTrigger>
                                <SelectContent>
                                {tradingStyles.map((ts) => (
                                    <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chart-upload">Chart Image</Label>
                            <Input id="chart-upload" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        {imagePreview && (
                            <div className="border rounded-md p-2">
                            <Image
                                src={imagePreview}
                                alt="Chart preview"
                                width={800}
                                height={600}
                                className="w-full h-auto rounded-md"
                            />
                            </div>
                        )}
                        <Button onClick={handleAnalyzeClick} disabled={isLoading || !imageFile} className="w-full">
                            {isLoading ? 'Analyzing...' : <><Upload className="mr-2" /> Analyze Chart</>}
                        </Button>
                    </CardContent>
                </Card>
                
                 <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>How it Works</AlertTitle>
                    <AlertDescription>
                        This tool uses a multimodal AI to analyze your chart based on your selected trading style. This is not financial advice. Your default style can be changed in the main settings.
                    </AlertDescription>
                </Alert>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Trading Style Guidance</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><b>Scalping:</b> High frequency, small profits. Focuses on 1m-5m charts.</li>
                            <li><b>Day Trading:</b> Trades within a single day. Focuses on 15m-1h charts.</li>
                            <li><b>Swing Trading:</b> Trades held for days or weeks. Focuses on 4h-1D charts.</li>
                            <li><b>Position Trading:</b> Long-term trades held for weeks or months. Focuses on 1D-1W charts.</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Analysis History</h2>
                <div className='relative flex flex-col gap-4 max-h-[100vh] overflow-y-auto pr-4 -mr-4'>
                    {isLoading && (
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-40 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                        </Card>
                    )}
                    
                    {analysisHistory.length > 0 ? (
                        analysisHistory.map(result => (
                            <AnalysisResultCard key={result.id} result={result} settings={settings} onDelete={handleDeleteAnalysis} onMarkResult={handleMarkResult} />
                        ))
                    ) : (
                        !isLoading && (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    No analysis history yet. Upload a chart to get started.
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
