"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { frames } from "@/lib/frames";
import { Shoutout } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Code,
  CircuitBoard,
  Send,
  WandSparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { stylizeMessage } from "@/ai/flows/stylize-message-flow";

const formSchema = z.object({
  sender: z.string().min(1, "Sender name is required."),
  recipient: z.string().min(1, "Recipient name is required."),
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(200, "Message must be 200 characters or less."),
  frame: z.string().min(1, "Please select a frame."),
});

type ShoutoutFormProps = {
  onAddShoutout: (shoutout: Omit<Shoutout, "id" | "createdAt">) => void;
};

const frameIcons: { [key: string]: React.ReactNode } = {
  code: <Code className="w-8 h-8 text-primary" />,
  heart: <Heart className="w-8 h-8 text-primary" />,
  circuit: <CircuitBoard className="w-8 h-8 text-accent" />,
};

export default function ShoutoutForm({ onAddShoutout }: ShoutoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sender: "Anonymous",
      recipient: "",
      message: "",
      frame: "heart",
    },
  });

  // Get current message for character count
  const currentMessage = form.watch("message");
  const charCount = currentMessage?.length || 0;
  const maxChars = 200;
  const isNearLimit = charCount > maxChars * 0.8; // 80% of limit

  useEffect(() => {
    // Check localStorage on component mount
    const submitted = localStorage.getItem("shoutoutFormSubmitted");
    if (submitted === "true") {
      setHasSubmitted(true);
    }
  }, []);

  const handleStylize = async (style: "poetic" | "witty") => {
    const currentMessage = form.getValues("message");
    if (!currentMessage) {
      toast({
        title: "Enter a message first!",
        description:
          "You need to write a message before the AI can stylize it.",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(style);
    try {
      const result = await stylizeMessage({ message: currentMessage, style });
      if (result?.stylizedMessage) {
        // Check if stylized message exceeds 200 characters
        if (result.stylizedMessage.length > maxChars) {
          toast({
            title: "Message Too Long",
            description: `The AI-generated message exceeds 200 characters. Please edit it to fit the limit.`,
            variant: "destructive",
          });
          form.setValue(
            "message",
            result.stylizedMessage.substring(0, maxChars),
            {
              shouldValidate: true,
            },
          );
        } else {
          form.setValue("message", result.stylizedMessage, {
            shouldValidate: true,
          });
          toast({
            title: "Message Stylized!",
            description: `Your message has been made more ${style}.`,
          });
        }
      } else {
        throw new Error("No message returned");
      }
    } catch (error) {
      console.error("Failed to stylize message:", error);
      toast({
        title: "AI Error",
        description: "The AI failed to stylize your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      onAddShoutout({
        sender: values.sender,
        recipient: values.recipient,
        message: values.message,
        image: null, // No image upload anymore
        frame: values.frame,
      });

      // Save to localStorage to prevent multiple submissions
      localStorage.setItem("shoutoutFormSubmitted", "true");
      setHasSubmitted(true);

      toast({
        title: "Shoutout Sent!",
        description: "Your message is now live on the feed.",
      });

      form.reset();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {hasSubmitted ? "Shoutout Already Sent" : "Create a Shoutout"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasSubmitted ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground mb-4">
              Thanks for your shoutout! You can only send one message per
              session.
            </p>
            <p className="text-sm text-muted-foreground">
              Check the feed below to see your message displayed.
            </p>
          </div>
        ) : (
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
                      <FormLabel>Your Message (Max 200 characters)</FormLabel>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Type your Valentine's message here (200 characters max)"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleStylize("poetic")}
                          disabled={!!aiLoading || !currentMessage}
                          className="text-xs"
                        >
                          {aiLoading === "poetic" ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <WandSparkles className="h-3 w-3 mr-1" />
                          )}
                          {aiLoading === "poetic"
                            ? "Stylizing..."
                            : "Make Poetic"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleStylize("witty")}
                          disabled={!!aiLoading || !currentMessage}
                          className="text-xs"
                        >
                          {aiLoading === "witty" ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <WandSparkles className="h-3 w-3 mr-1" />
                          )}
                          {aiLoading === "witty"
                            ? "Stylizing..."
                            : "Make Witty"}
                        </Button>
                      </div>
                      <div
                        className={cn(
                          "text-xs font-medium",
                          isNearLimit
                            ? "text-amber-600"
                            : "text-muted-foreground",
                          charCount > maxChars && "text-red-600",
                        )}
                      >
                        {charCount}/{maxChars}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                              <RadioGroupItem
                                value={frame.id}
                                className="sr-only"
                              />
                            </FormControl>
                            <FormLabel
                              className={cn(
                                "frame-radio",
                                frame.className,
                                "flex flex-col items-center justify-center p-4 rounded-lg border-2 border-transparent hover:border-primary cursor-pointer transition-all",
                                field.value === frame.id &&
                                  "border-primary bg-primary/5",
                              )}
                            >
                              {frameIcons[frame.id]}
                              <span className="mt-2 text-sm font-medium">
                                {frame.name}
                              </span>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-xs text-muted-foreground py-2 border-t border-border">
                <p>Note: Messages are limited to 200 characters maximum.</p>
                <p className="mt-1">
                  Images and scanning features are temporarily disabled.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Shoutout"}
                {isSubmitting ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="ml-2 h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
