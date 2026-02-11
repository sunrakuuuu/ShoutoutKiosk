"use client";
import { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { stylizeMessage } from "@/ai/flows/stylize-message-flow";
import { moderateMessage } from "@/lib/moderator";

const formSchema = z.object({
  sender: z
    .string()
    .min(1, "Sender name is required.")
    .max(30, "Name is too long.")
    .refine((name) => !name.includes("admin") && !name.includes("mod"), {
      message: "Name contains restricted terms",
    }),
  recipient: z
    .string()
    .min(1, "Recipient name is required.")
    .max(30, "Name is too long.")
    .refine((name) => !name.includes("admin") && !name.includes("mod"), {
      message: "Name contains restricted terms",
    }),
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(200, "Message must be 200 characters or less.")
    .refine(
      (msg) => {
        const moderation = moderateMessage(msg);
        return moderation.isAllowed;
      },
      {
        message: "Message contains inappropriate content",
      },
    ),
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

// Better fingerprinting that works across incognito
const generateFingerprint = async (): Promise<string> => {
  const components = [];

  // Screen properties
  components.push(
    `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
  );

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency || "unknown");

  // Device memory (GB)
  components.push((navigator as any).deviceMemory || "unknown");

  // Touch support
  components.push("ontouchstart" in window ? "touch" : "no-touch");

  // Color scheme preference
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  components.push(darkMode ? "dark" : "light");

  // WebGL renderer (this is really good for fingerprinting)
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        components.push(renderer);
      }
    }
  } catch (e) {
    // Ignore errors
  }

  // Simple hash function
  let hash = 0;
  const str = components.join("|");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash.toString();
};

// Store in localStorage instead of sessionStorage (persists across incognito windows)
const hasSubmittedInSession = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  const fingerprint = await generateFingerprint();
  const storageKey = `shoutout_submitted_${fingerprint}`;
  const submitted = localStorage.getItem(storageKey);
  const timestamp = localStorage.getItem(`${storageKey}_timestamp`);

  // Expire after 24 hours
  if (timestamp) {
    const hoursSince = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
    if (hoursSince > 24) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_timestamp`);
      return false;
    }
  }

  return submitted === "true";
};

const markSubmittedInSession = async () => {
  if (typeof window === "undefined") return;

  const fingerprint = await generateFingerprint();
  const storageKey = `shoutout_submitted_${fingerprint}`;
  localStorage.setItem(storageKey, "true");
  localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
};

export default function ShoutoutForm({ onAddShoutout }: ShoutoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [messageWarning, setMessageWarning] = useState<string | null>(null);
  const [moderationCheck, setModerationCheck] = useState<{
    isAllowed: boolean;
    reason?: string;
    warning?: boolean;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const messageDebounceRef = useRef<NodeJS.Timeout>();
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
  const currentSender = form.watch("sender");
  const currentRecipient = form.watch("recipient");
  const charCount = currentMessage?.length || 0;
  const maxChars = 200;
  const isNearLimit = charCount > maxChars * 0.8;

  // Check if user has already submitted
  useEffect(() => {
    const checkSubmission = async () => {
      setIsChecking(true);
      const submitted = await hasSubmittedInSession();
      setHasSubmitted(submitted);
      setIsChecking(false);
    };

    checkSubmission();
  }, []);

  // Real-time message moderation
  useEffect(() => {
    if (messageDebounceRef.current) {
      clearTimeout(messageDebounceRef.current);
    }

    if (currentMessage) {
      messageDebounceRef.current = setTimeout(() => {
        const result = moderateMessage(currentMessage);
        setModerationCheck(result);

        if (result.warning) {
          setMessageWarning(
            "Your message contains words that may be hurtful. Please consider rewriting it.",
          );
        } else {
          setMessageWarning(null);
        }
      }, 500);
    }

    return () => {
      if (messageDebounceRef.current) {
        clearTimeout(messageDebounceRef.current);
      }
    };
  }, [currentMessage]);

  // Check sender/recipient names
  useEffect(() => {
    const checkNames = () => {
      if (
        currentSender &&
        (currentSender.includes("admin") || currentSender.includes("mod"))
      ) {
        form.setError("sender", {
          type: "manual",
          message: "Name contains restricted terms",
        });
      }
      if (
        currentRecipient &&
        (currentRecipient.includes("admin") || currentRecipient.includes("mod"))
      ) {
        form.setError("recipient", {
          type: "manual",
          message: "Name contains restricted terms",
        });
      }
    };

    checkNames();
  }, [currentSender, currentRecipient, form]);

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
        if (result.stylizedMessage.length > maxChars) {
          toast({
            title: "Message Too Long",
            description: `The AI-generated message exceeds 200 characters. Please edit it to fit the limit.`,
            variant: "destructive",
          });
          form.setValue(
            "message",
            result.stylizedMessage.substring(0, maxChars),
            { shouldValidate: true },
          );
        } else {
          const moderationResult = moderateMessage(result.stylizedMessage);
          if (!moderationResult.isAllowed) {
            toast({
              title: "AI Content Flagged",
              description:
                "The AI generated content that doesn't meet our guidelines. Please try a different style or edit the message.",
              variant: "destructive",
            });
          } else {
            form.setValue("message", result.stylizedMessage, {
              shouldValidate: true,
            });
            toast({
              title: "Message Stylized!",
              description: `Your message has been made more ${style}.`,
            });
          }
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
    // Double-check if already submitted
    if (await hasSubmittedInSession()) {
      toast({
        title: "Already Submitted",
        description: "You can only send one shoutout per 24 hours.",
        variant: "destructive",
      });
      setHasSubmitted(true);
      return;
    }

    // Final moderation check
    const finalCheck = moderateMessage(values.message);
    if (!finalCheck.isAllowed) {
      toast({
        title: "Content Moderation",
        description:
          finalCheck.reason ||
          "Your message doesn't meet our community guidelines.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      onAddShoutout({
        sender: values.sender,
        recipient: values.recipient,
        message: values.message,
        image: null,
        frame: values.frame,
      });

      // Mark as submitted with fingerprint
      await markSubmittedInSession();
      setHasSubmitted(true);

      toast({
        title: "Shoutout Sent!",
        description:
          "Your positive message is now live on the feed. Spread love! 💕",
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

  if (isChecking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Spread Positivity! 💕
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">
          {hasSubmitted
            ? "✨ You've Already Shared Love! ✨"
            : "Spread Positivity! 💕"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasSubmitted ? (
          <div className="text-center py-8 space-y-6">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Heart className="w-12 h-12 text-primary fill-primary" />
              </div>
            </div>
            <div>
              <p className="text-lg text-foreground mb-2 font-semibold">
                Thanks for spreading positivity!
              </p>
              <p className="text-muted-foreground">
                You've already sent your shoutout for today. Check the feed
                below to see your uplifting message displayed.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-sm text-amber-800">
                <span className="font-medium">💡 Note:</span> You can send one
                message every 24 hours. This helps keep the shoutout feed
                balanced and positive for everyone.
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
                <span>
                  This is a positive space. Please share uplifting messages
                  only.
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name / Alias</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Happy Coder"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value.includes("admin") ||
                              value.includes("mod")
                            ) {
                              field.onChange(value.replace(/admin|mod/gi, ""));
                            } else {
                              field.onChange(value);
                            }
                          }}
                        />
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
                      <FormLabel>Send Love To</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My Awesome Teammate"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value.includes("admin") ||
                              value.includes("mod")
                            ) {
                              field.onChange(value.replace(/admin|mod/gi, ""));
                            } else {
                              field.onChange(value);
                            }
                          }}
                        />
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
                      <FormLabel>
                        Your Uplifting Message (Max 200 characters)
                      </FormLabel>
                      {moderationCheck?.warning && (
                        <div className="flex items-center gap-1 text-amber-600 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Content Warning</span>
                        </div>
                      )}
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Share something positive, encouraging, or appreciative..."
                        className={cn(
                          "min-h-[120px]",
                          moderationCheck?.warning && "border-amber-300",
                          !moderationCheck?.isAllowed && "border-red-300",
                        )}
                        {...field}
                      />
                    </FormControl>

                    {messageWarning && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{messageWarning}</span>
                        </div>
                      </div>
                    )}

                    {!moderationCheck?.isAllowed && moderationCheck?.reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{moderationCheck.reason}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3">
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
                <p className="font-medium text-primary mb-1">
                  Community Guidelines:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Keep messages positive and uplifting</li>
                  <li>No bullying, harassment, or hate speech</li>
                  <li>Respect everyone's identity and feelings</li>
                  <li>Spread love and encouragement ❤️</li>
                  <li className="font-medium text-primary">
                    One message per 24 hours (device-based)
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !moderationCheck?.isAllowed}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Shoutout
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
