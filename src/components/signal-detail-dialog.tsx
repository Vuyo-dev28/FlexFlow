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
import type { Signal } from '@/types/signal';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from './ui/button';

interface SignalDetailDialogProps {
  signal: Signal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SignalDetails({ signal }: { signal: Signal }) {
    if (!signal) return null;
    const isBuy = signal.type === 'BUY';
    return (
        <div className="flex flex-col gap-4 p-4 sm:p-0">
            <div className="grid gap-4">
                <div className="grid grid-cols-3 items-center gap-4 text-sm">
                <span className="text-muted-foreground col-span-1">Entry Price</span>
                <span className="font-mono text-lg text-foreground col-span-2">{signal.entry.toFixed(4)}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 text-sm">
                <span className="text-muted-foreground col-span-1">Take Profit</span>
                <span className="font-mono text-lg text-green-500 col-span-2">{signal.takeProfit.toFixed(4)}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 text-sm">
                <span className="text-muted-foreground col-span-1">Stop Loss</span>
                <span className="font-mono text-lg text-red-500 col-span-2">{signal.stopLoss.toFixed(4)}</span>
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


export function SignalDetailDialog({ signal, open, onOpenChange }: SignalDetailDialogProps) {
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
            <SignalDetails signal={signal} />
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
                <SignalDetails signal={signal} />
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
