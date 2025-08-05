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
import type { SignalCategory, TradingStyle } from '@/types/signal';
import { tradingStyles } from '@/types/signal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SignalSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableCategories: SignalCategory[] = ['Crypto', 'Stock Indices', 'Forex', 'Metals', 'Volatility Indices'];

const SETTINGS_KEY = 'signalStreamSettings';

const FormSchema = z.object({
  categories: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one category.',
  }),
  pushNotifications: z.boolean().default(false).optional(),
  emailNotifications: z.boolean().default(false).optional(),
  tradingStyle: z.enum(tradingStyles),
});

type FormValues = z.infer<typeof FormSchema>;

export function SignalSettingsSheet({ open, onOpenChange }: SignalSettingsSheetProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      categories: availableCategories,
      pushNotifications: true,
      emailNotifications: false,
      tradingStyle: 'Day Trading',
    },
  });

  useEffect(() => {
    if (open) {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Ensure we only set values that exist in the form schema
          const validValues: Partial<FormValues> = {};
          if (parsedSettings.categories) validValues.categories = parsedSettings.categories;
          if (typeof parsedSettings.pushNotifications === 'boolean') validValues.pushNotifications = parsedSettings.pushNotifications;
          if (typeof parsedSettings.emailNotifications === 'boolean') validValues.emailNotifications = parsedSettings.emailNotifications;
          if (parsedSettings.tradingStyle) validValues.tradingStyle = parsedSettings.tradingStyle;
          
          form.reset(validValues);
        }
      } catch (error) {
        console.error("Failed to load settings from localStorage", error);
      }
    }
  }, [open, form]);

  function onSubmit(data: FormValues) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
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
      <SheetContent>
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
                        Adjust the AI's strategy based on your preferred trading style.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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

                <FormField
                  control={form.control}
                  name="categories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Signal Categories</FormLabel>
                        <FormDescription>
                          Select the categories for which you want to receive alerts.
                        </FormDescription>
                      </div>
                      {availableCategories.map(item => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="categories"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(
                                            field.value?.filter(
                                              value => value !== item
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
