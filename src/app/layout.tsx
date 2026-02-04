import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'CCS Valentine Shoutout',
  description: 'An interactive shoutout booth for CCS Valentines.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-display bg-background text-foreground selection:bg-primary selection:text-white antialiased">
          <ThemeProvider
            defaultTheme="dark"
            storageKey="shoutout-theme"
          >
            {children}
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
