
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Separator } from './ui/separator';
import type { SignalCategory, TradingStyle, Currency } from '@/types/signal';
import { tradingStyles, availableCurrencies } from '@/types/signal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { useSettings } from '@/hooks/use-settings';

interface SignalSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SETTINGS_KEY = 'signalStreamSettings';

const FormSchema = z.object({
  pushNotifications: z.boolean().default(false).optional(),
  emailNotifications: z.boolean().default(false).optional(),
  tradingStyle: z.enum(tradingStyles),
  accountSize: z.coerce.number().positive({ message: "Account size must be a positive number."}),
  riskPerTrade: z.number().min(0.1).max(10),
  currency: z.enum(availableCurrencies),
});

type FormValues = z.infer<typeof FormSchema>;

export function SignalSettingsSheet({ open, onOpenChange }: SignalSettingsSheetProps) {
  const { toast } = useToast();
  const { settings, setSettings, setHasSettings } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    if (open) {
      form.reset(settings);
    }
  }, [open, form, settings]);

  function onSubmit(data: FormValues) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
        setSettings(data);
        setHasSettings(true); // Mark that settings have been saved
        toast({
          title: 'Settings Saved',
          description: 'Your preferences have been updated.',
        });
        onOpenChange(false);
         // Manually trigger a storage event to notify other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', { key: SETTINGS_KEY, newValue: JSON.stringify(data) }));
    } catch(error) {
         toast({
            variant: 'destructive',
            title: 'Failed to Save Settings',
            description: 'Could not save settings to local storage.',
        });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="text-2xl">Settings</SheetTitle>
              <SheetDescription>
                Customize your signals and notifications.
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4"/>
            <div className="flex-1 space-y-8 overflow-y-auto pr-6">
                <FormField
                  control={form.control}
                  name="tradingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Trading Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trading style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tradingStyles.map((ts) => (
                             <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Adjust the System's strategy based on your preferred trading style.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                    <h3 className="text-base font-medium">Risk Management</h3>
                     <FormField
                        control={form.control}
                        name="accountSize"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Account Size</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 10000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Account Currency</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a currency" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {availableCurrencies.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="riskPerTrade"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Risk Per Trade ({field.value}%)</FormLabel>
                            <FormControl>
                               <Slider
                                  min={0.1}
                                  max={10}
                                  step={0.1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                             <FormDescription>
                                The percentage of your account to risk per trade.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                
                <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">Notification Channels</FormLabel>
                        <FormDescription>
                        Choose how you want to be notified.
                        </FormDescription>
                    </div>
                    <div className="space-y-4">
                        <FormField
                        control={form.control}
                        name="pushNotifications"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                Push Notifications
                                </FormLabel>
                                <FormDescription>
                                Receive alerts directly on your device.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="emailNotifications"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                Email Notifications
                                </FormLabel>
                                <FormDescription>
                                Get signal alerts sent to your email.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-readonly
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                    </div>
                </FormItem>
            </div>
            <SheetFooter className="mt-6">
                <SheetClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </SheetClose>
                <Button type="submit">Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
