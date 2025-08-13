
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits."}),
  apikey: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface OnboardingFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFormSubmit: () => void;
}

export function OnboardingForm({ open, onOpenChange, onFormSubmit }: OnboardingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const web3formsKey = "337e5248-fca6-4707-8cfc-371ef2f65710";

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      phone: '',
      apikey: web3formsKey,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            toast({
              title: 'Welcome!',
              description: 'You have been successfully signed up.',
            });
            onFormSubmit();
            onOpenChange(false);
        } else {
             toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: result.message || 'Something went wrong. Please try again.',
            });
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Submission Error',
            description: 'An error occurred while submitting the form.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to SignalStream</DialogTitle>
          <DialogDescription>
            Please enter your details to get started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Submitting...' : 'Get Started'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
