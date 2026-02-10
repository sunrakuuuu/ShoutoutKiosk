// src/hooks/useShoutouts.ts
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Shoutout } from "@/lib/types";
import { useToast } from "./use-toast";
import { supabase } from "@/lib/supabase";

export function useShoutouts() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const lastFetchRef = useRef<number>(0);

  // Fetch shoutouts from Supabase
  const fetchShoutouts = useCallback(async () => {
    // Debounce: only fetch if 2+ seconds have passed since last fetch
    const now = Date.now();
    if (now - lastFetchRef.current < 2000) {
      console.log("⏸️  Debounced fetch (too soon)");
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      console.log("🔄 Fetching shoutouts from Supabase...");

      const { data, error } = await supabase
        .from("shoutouts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase fetch error:", error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} shoutouts`);

      // Transform Supabase data to match your Shoutout type
      const transformedData: Shoutout[] = (data || []).map((item) => ({
        id: item.id,
        senderName: item.sender_name || "Anonymous",
        recipientName: item.recipient_name || "Someone",
        message: item.message || "",
        createdAt: new Date(item.created_at).getTime(),
        frame: item.frame || undefined,
      }));

      setShoutouts(transformedData);
      setInitialized(true);
    } catch (error: any) {
      console.error("❌ Error fetching shoutouts:", error);
      toast({
        title: "Connection Error",
        description: "Could not load shoutouts. Please refresh.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // In your useShoutouts.ts addShoutout function:
  const addShoutout = useCallback(
    async (newShoutoutData: Omit<Shoutout, "id" | "createdAt">) => {
      try {
        console.log("📤 Received data:", newShoutoutData);

        // Use the property names from your form
        const senderName = newShoutoutData.sender || newShoutoutData.senderName;
        const recipientName =
          newShoutoutData.recipient || newShoutoutData.recipientName;
        const message = newShoutoutData.message;

        console.log("📤 Processing:", { senderName, recipientName, message });

        // Validate
        if (!senderName?.trim()) {
          throw new Error("Sender name is required");
        }
        if (!recipientName?.trim()) {
          throw new Error("Recipient name is required");
        }
        if (!message?.trim()) {
          throw new Error("Message is required");
        }

        // Prepare data for Supabase
        const shoutoutToInsert = {
          sender_name: senderName.trim(),
          recipient_name: recipientName.trim(),
          message: message.trim(),
          frame: newShoutoutData.frame || null,
          image: newShoutoutData.image || null, // Add this if you have image column
        };

        console.log("📤 Inserting into Supabase:", shoutoutToInsert);

        const { data, error } = await supabase
          .from("shoutouts")
          .insert([shoutoutToInsert])
          .select()
          .single();

        if (error) {
          console.error("❌ Supabase insert error:", error);
          throw error;
        }

        console.log("✅ Insert successful:", data);

        // Transform response to match your Shoutout type
        const newShoutout: Shoutout = {
          id: data.id,
          senderName: data.sender_name,
          recipientName: data.recipient_name,
          message: data.message,
          createdAt: new Date(data.created_at).getTime(),
          frame: data.frame || undefined,
          image: data.image || undefined,
        };

        // Update local state
        setShoutouts((prev) => [newShoutout, ...prev]);

        toast({
          title: "Success!",
          description: "Your shoutout has been posted! ❤️",
        });

        return newShoutout;
      } catch (error: any) {
        console.error("❌ Error adding shoutout:", error);

        let errorMessage = "Failed to post shoutout. Please try again.";
        if (error.code === "23502") {
          errorMessage =
            "Missing required information. Please fill all fields.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        throw error;
      }
    },
    [toast],
  );

  // Delete shoutout from Supabase
  const deleteShoutout = useCallback(
    async (shoutoutId: string) => {
      try {
        console.log("🗑️ Deleting shoutout:", shoutoutId);

        const { error } = await supabase
          .from("shoutouts")
          .delete()
          .eq("id", shoutoutId);

        if (error) {
          console.error("❌ Delete error:", error);
          throw error;
        }

        // Remove from local state
        setShoutouts((prev) => prev.filter((s) => s.id !== shoutoutId));

        toast({
          title: "Shoutout Deleted",
          description: "The shoutout has been removed.",
        });

        console.log("✅ Deleted successfully");
      } catch (error: any) {
        console.error("❌ Error deleting shoutout:", error);
        toast({
          title: "Error",
          description: "Failed to delete shoutout.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  // Initial load and real-time subscription
  useEffect(() => {
    fetchShoutouts();

    // Set up real-time subscription for new shoutouts
    const channel = supabase
      .channel("realtime-shoutouts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shoutouts",
        },
        () => {
          console.log("🔄 Real-time update: New shoutout detected");
          fetchShoutouts();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "shoutouts",
        },
        () => {
          console.log("🔄 Real-time update: Shoutout deleted");
          fetchShoutouts();
        },
      )
      .subscribe((status) => {
        console.log("📡 Real-time subscription status:", status);
      });

    return () => {
      console.log("🧹 Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [fetchShoutouts]);

  // Fallback: Auto-refresh every 10 seconds as a safety net
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Polling fallback: Refreshing shoutouts");
      fetchShoutouts();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchShoutouts]);

  return {
    shoutouts,
    addShoutout,
    deleteShoutout,
    initialized,
    loading,
    refreshShoutouts: fetchShoutouts,
  };
}
