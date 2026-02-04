'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { frames } from '@/lib/frames';
import { Shoutout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Camera, Heart, Code, CircuitBoard, Send, X, WandSparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stylizeMessage } from '@/ai/flows/stylize-message-flow';
import { createWorker } from 'tesseract.js';

const formSchema = z.object({
  sender: z.string().min(1, 'Sender name is required.'),
  recipient: z.string().min(1, 'Recipient name is required.'),
  message: z.string().min(1, 'Message cannot be empty.').max(500, 'Message is too long.'),
  frame: z.string().min(1, 'Please select a frame.'),
});

type ShoutoutFormProps = {
  onAddShoutout: (shoutout: Omit<Shoutout, 'id' | 'createdAt'>) => void;
};

const frameIcons: { [key: string]: React.ReactNode } = {
  code: <Code className="w-8 h-8 text-primary" />,
  heart: <Heart className="w-8 h-8 text-primary" />,
  circuit: <CircuitBoard className="w-8 h-8 text-accent" />,
};

export default function ShoutoutForm({ onAddShoutout }: ShoutoutFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sender: 'Anonymous',
      recipient: '',
      message: '',
      frame: 'heart',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for shoutout image
        toast({
          title: 'Image too large',
          description: 'Please upload an image smaller than 1MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    const fileInput = document.getElementById('shoutout-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleStylize = async (style: 'poetic' | 'witty') => {
    const currentMessage = form.getValues('message');
    if (!currentMessage) {
      toast({
        title: 'Enter a message first!',
        description: 'You need to write a message before the AI can stylize it.',
        variant: 'destructive',
      });
      return;
    }

    setAiLoading(style);
    try {
      const result = await stylizeMessage({ message: currentMessage, style });
      if (result?.stylizedMessage) {
        form.setValue('message', result.stylizedMessage, { shouldValidate: true });
        toast({
          title: 'Message Stylized!',
          description: `Your message has been made more ${style}.`,
        });
      } else {
        throw new Error('No message returned');
      }
    } catch (error) {
      console.error('Failed to stylize message:', error);
      toast({
        title: 'AI Error',
        description: 'The AI failed to stylize your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAiLoading(null);
    }
  };

  const handleOcrScan = () => {
    ocrInputRef.current?.click();
  };

  const handleOcrImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for Tesseract
      toast({
        title: 'Image too large for scanning',
        description: 'Please use an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setOcrLoading(true);
    setOcrStatus('Initializing scanner...');

    const worker = await createWorker({
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setOcrStatus(`Scanning: ${Math.round(m.progress * 100)}%`);
        } else if (m.status === 'loading tesseract core') {
            setOcrStatus('Loading engine...');
        } else if (m.status === 'loading language model') {
            setOcrStatus('Loading language...');
        }
      },
    });

    try {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      if (text) {
        const currentMessage = form.getValues('message');
        const separator = currentMessage && !currentMessage.endsWith('\n') ? '\n' : '';
        const newMessage = currentMessage
          ? `${currentMessage}${separator}${text}`
          : text;
        
        form.setValue('message', newMessage, { shouldValidate: true });

        toast({
          title: 'Text Scanned Successfully!',
          description: `Text from your note has been added.`,
        });
      } else {
        toast({
          title: 'No Text Found',
          description: 'Could not find any readable text in the image.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: 'Scan Error',
        description: 'Failed to scan image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setOcrLoading(false);
      setOcrStatus('');
      if (e.target) e.target.value = '';
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      onAddShoutout({
        sender: values.sender,
        recipient: values.recipient,
        message: values.message,
        image: imageBase64,
        frame: values.frame,
      });

      toast({
        title: 'Shoutout Sent!',
        description: 'Your message is now live on the feed.',
      });

      form.reset();
      clearImage();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create a Shoutout</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name / Alias</FormLabel>
                    <FormControl>
                      <Input placeholder="Anonymous" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="My fellow Coder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Your Message</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOcrScan}
                      disabled={ocrLoading}
                      className="text-xs"
                    >
                      {ocrLoading ? ocrStatus : 'Scan from Note'}
                      <Camera className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Type your Valentine's message here, or scan it from a note!"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStylize('poetic')}
                      disabled={!!aiLoading || ocrLoading}
                      className="text-xs"
                    >
                      {aiLoading === 'poetic' ? 'Stylizing...' : 'Make it Poetic'}
                      <WandSparkles className="ml-2 h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStylize('witty')}
                      disabled={!!aiLoading || ocrLoading}
                      className="text-xs"
                    >
                      {aiLoading === 'witty' ? 'Stylizing...' : 'Make it Witty'}
                      <WandSparkles className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormControl>
              <Input
                ref={ocrInputRef}
                id="ocr-image-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleOcrImageChange}
                className="hidden"
              />
            </FormControl>

            <FormItem>
              <FormLabel>Upload Image (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="shoutout-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:text-primary"
                />
              </FormControl>
              {imagePreview && (
                <div className="relative mt-4 w-full h-48 rounded-md overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Image preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="frame"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose a Frame</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {frames.map((frame) => (
                        <FormItem key={frame.id}>
                          <FormControl>
                            <RadioGroupItem value={frame.id} className="sr-only" />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              'frame-radio',
                              frame.className,
                              'flex flex-col items-center justify-center p-4 rounded-lg border-2 border-transparent hover:border-primary cursor-pointer transition-all',
                              field.value === frame.id && 'border-primary bg-primary/5'
                            )}
                          >
                            {frameIcons[frame.id]}
                            <span className="mt-2 text-sm font-medium">{frame.name}</span>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || ocrLoading}
            >
              {isSubmitting ? 'Sending...' : 'Send Shoutout'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
