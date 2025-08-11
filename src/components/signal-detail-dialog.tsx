
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

import { Badge } from '@/components/ui/badge';
import type { Signal, AppSettings } from '@/types/signal';
import { currencySymbols } from '@/types/signal';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from './ui/button';

interface SignalDetailDialogProps {
  signal: Signal | null;
  settings: AppSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SignalDetails({ signal, settings }: { signal: Signal, settings: AppSettings }) {
    if (!signal) return null;

    const stopLossDistance = Math.abs(signal.entry - signal.stopLoss);
    const takeProfitDistance = Math.abs(signal.entry - signal.takeProfit);
    const riskRewardRatio = stopLossDistance > 0 ? takeProfitDistance / stopLossDistance : 0;
    
    const riskAmount = settings.accountSize * (settings.riskPerTrade / 100);
    const positionSize = stopLossDistance > 0 ? riskAmount / stopLossDistance : 0;
    const potentialLoss = positionSize * stopLossDistance;
    const potentialProfit = positionSize * takeProfitDistance;
    const currencySymbol = currencySymbols[settings.currency] || '$';


    return (
        <div className="flex flex-col gap-4 p-4 sm:p-0">
             <div>
                <h3 className="font-semibold text-foreground mb-2">Trade Execution</h3>
                <div className="grid grid-cols-2 items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Entry Price</span>
                    <span className="font-mono text-right text-foreground">{signal.entry.toFixed(4)}</span>
                    
                    <span className="text-muted-foreground">Take Profit</span>
                    <span className="font-mono text-right text-green-500">{signal.takeProfit.toFixed(4)}</span>

                    <span className="text-muted-foreground">Stop Loss</span>
                    <span className="font-mono text-right text-red-500">{signal.stopLoss.toFixed(4)}</span>
                </div>
            </div>

            <Separator />

             <div>
                <h3 className="font-semibold text-foreground mb-2">Risk Profile</h3>
                <div className="grid grid-cols-2 items-center gap-4 text-sm">
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


            <Separator />

            <div>
                <h3 className="font-semibold text-foreground mb-2">Rationale</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {signal.rationale}
                </p>
            </div>
        </div>
    )
}

function SignalHeader({ signal }: { signal: Signal }) {
    if (!signal) return null;
    const isBuy = signal.type === 'BUY';
    return (
        <>
            <div className="flex justify-between items-start">
                <div>
                <DialogTitle className="text-2xl font-bold">{signal.pair} Signal</DialogTitle>
                <DialogDescription>
                    {signal.category}
                </DialogDescription>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        'text-base',
                        isBuy ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                    )}
                    >
                    {signal.type}
                </Badge>
            </div>
            <DialogDescription>
                Posted {new Date(signal.timestamp).toLocaleString()}
            </DialogDescription>
        </>
    )
}


export function SignalDetailDialog({ signal, settings, open, onOpenChange }: SignalDetailDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (!signal) return null;

  if (isDesktop) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <SignalHeader signal={signal} />
            </DialogHeader>
            <Separator />
            <SignalDetails signal={signal} settings={settings} />
        </DialogContent>
        </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
            <DrawerHeader className="text-left">
                 <SignalHeader signal={signal} />
            </DrawerHeader>
            <Separator />
            <div className="p-4">
                <SignalDetails signal={signal} settings={settings} />
            </div>
            <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
  )
}
