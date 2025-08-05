'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Lightbulb, TrendingUp, TrendingDown, Hourglass } from 'lucide-react';
import Image from 'next/image';
import { analyzeChart } from '@/ai/flows/analyze-chart-flow';
import { AnalyzeChartOutput } from '@/types/signal';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyzePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeChartOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
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
      setAnalysisResult(null); // Reset previous result
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
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await analyzeChart({ chartImageUri: base64data });
        setAnalysisResult(result);
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
  
  const SignalIcon = analysisResult?.type === 'BUY' ? TrendingUp : analysisResult?.type === 'SELL' ? TrendingDown : Hourglass;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 gap-6">
        <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Chart Analyzer</h1>
            <p className="text-muted-foreground">
                Upload a trading chart image and let AI provide a technical analysis signal.
            </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 items-start">
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

            <div className="flex flex-col gap-4">
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>How it Works</AlertTitle>
                    <AlertDescription>
                        This tool uses a multimodal AI model to perform technical analysis on your chart image. It identifies patterns and indicators to generate a trading signal. This is not financial advice.
                    </AlertDescription>
                </Alert>

                {isLoading && (
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48 mt-1" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                    </Card>
                )}

                {analysisResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Analysis Result</span>
                                 <Badge
                                    variant="outline"
                                    className={cn(
                                    'text-base font-semibold py-1 px-3',
                                    analysisResult.type === 'BUY' && 'border-green-500/50 text-green-400 bg-green-500/10',
                                    analysisResult.type === 'SELL' && 'border-red-500/50 text-red-400 bg-red-500/10',
                                    analysisResult.type === 'HOLD' && 'border-amber-500/50 text-amber-400 bg-amber-500/10',
                                    )}
                                >
                                    <SignalIcon className="mr-1.5 h-4 w-4" />
                                    {analysisResult.type}
                                </Badge>
                            </CardTitle>
                            <CardDescription>AI-generated signal based on the uploaded chart.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                <h3 className="font-semibold">Rationale</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {analysisResult.rationale}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    </div>
  );
}
