'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Lightbulb, TrendingUp, TrendingDown, Hourglass, Trash2, CheckCircle2, XCircle, Award } from 'lucide-react';
import Image from 'next/image';
import { analyzeChart } from '@/ai/flows/analyze-chart-flow';
import { AnalyzeChartOutput, TimeFrame } from '@/types/signal';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const LOCAL_STORAGE_KEY = 'analysisHistory';
const SETTINGS_KEY = 'signalStreamSettings';

function WinRateTracker({ history }: { history: AnalyzeChartOutput[] }) {
    const { wins, completedTrades } = useMemo(() => {
        const completed = history.filter(item => typeof item.isWin === 'boolean');
        const wins = completed.filter(item => item.isWin).length;
        return { wins, completedTrades: completed.length };
    }, [history]);

    const winRate = completedTrades > 0 ? (wins / completedTrades) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award />
                    Win Rate
                </CardTitle>
                <CardDescription>Based on your manually marked results.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-4xl font-bold">{winRate.toFixed(1)}%</div>
                    <div className="text-right">
                        <p className="font-bold text-green-500">{wins} Wins</p>
                        <p className="text-muted-foreground">{completedTrades - wins} Losses</p>
                    </div>
                </div>
                 <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${winRate}%` }}></div>
                </div>
            </CardContent>
        </Card>
    );
}

function AnalysisResultCard({ result, onDelete, onMarkResult }: { result: AnalyzeChartOutput; onDelete: (id: string) => void; onMarkResult: (id: string, isWin: boolean) => void; }) {
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
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
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
                 <Separator />
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
            </CardContent>
        </Card>
    )
}

export default function AnalyzePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalyzeChartOutput[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('5m');
  const { toast } = useToast();

  const loadSettings = useCallback(() => {
    try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.timeFrame) {
                setTimeFrame(parsed.timeFrame);
            }
        }
    } catch (error) {
        console.error("Failed to load settings:", error);
    }
  }, []);

  useEffect(() => {
    // Load saved analysis history
    try {
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedHistory) {
            setAnalysisHistory(JSON.parse(storedHistory));
        }
    } catch (error) {
        console.error("Failed to parse analysis history from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // Load settings
    loadSettings();

    // Listen for settings changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === SETTINGS_KEY) {
            loadSettings();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSettings]);

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
        const result = await analyzeChart({ chartImageUri: base64data, timeFrame });
        
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
        <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Chart Analyzer</h1>
            <p className="text-muted-foreground">
                Upload a chart for the <span className='font-semibold text-foreground'>{timeFrame}</span> time frame. AI will provide a technical analysis signal.
            </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Chart</CardTitle>
                        <CardDescription>Select a screenshot of your trading chart.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="chart-upload" className="font-medium">
                                Chart Image
                            </label>
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
                <WinRateTracker history={analysisHistory} />
                 <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>How it Works</AlertTitle>
                    <AlertDescription>
                        This tool uses a multimodal AI to analyze your chart for the selected time frame. This is not financial advice. You can change the time frame in the main settings.
                    </AlertDescription>
                </Alert>
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Analysis History</h2>
                <div className='relative flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-4 -mr-4'>
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
                            <AnalysisResultCard key={result.id} result={result} onDelete={handleDeleteAnalysis} onMarkResult={handleMarkResult} />
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
