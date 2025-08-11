
import { BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function AnalysisLoader() {
  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center">
        <CardHeader>
            <CardTitle>Analyzing Chart...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute h-full w-full animate-pulse rounded-full bg-primary/20"></div>
                <div className="absolute h-16 w-16 animate-pulse rounded-full bg-primary/30 [animation-delay:0.2s]"></div>
                <BarChart className="relative h-12 w-12 text-primary" />
            </div>
            <p className="text-muted-foreground">The System is identifying patterns and signals. Please wait a moment.</p>
        </CardContent>
    </Card>
  );
}

    