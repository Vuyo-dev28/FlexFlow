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
import { useMemo } from 'react';
import { Separator } from './ui/separator';
import type { SignalCategory } from '@/types/signal';

interface SignalSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableCategories: SignalCategory[] = ['Crypto', 'Stock Indices', 'Forex', 'Metals', 'Volatility Indices'];

const FormSchema = z.object({
  categories: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one category.',
  }),
  pushNotifications: z.boolean().default(false).optional(),
  emailNotifications: z.boolean().default(false).optional(),
});

export function SignalSettingsSheet({ open, onOpenChange }: SignalSettingsSheetProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      categories: availableCategories,
      pushNotifications: true,
      emailNotifications: false,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: 'Settings Saved',
      description: 'Your notification preferences have been updated.',
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="text-2xl">Settings</SheetTitle>
              <SheetDescription>
                Customize your signal notifications.
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4"/>
            <div className="flex-1 space-y-8 overflow-y-auto pr-6">
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
