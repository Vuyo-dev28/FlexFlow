
import React from 'react';
import { MessageSquare } from 'lucide-react';

export function SupportButton() {
  return (
    <a
      href="https://wa.link/0jg90a"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
      aria-label="Contact support on WhatsApp"
    >
      <MessageSquare className="h-8 w-8" />
    </a>
  );
}
