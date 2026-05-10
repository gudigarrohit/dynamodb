"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Bot, X } from "lucide-react";
import toast from "react-hot-toast";

const vapi = new Vapi(
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
);

export default function VoiceAgent({
  fetchTodos
}) {
  const [isCalling, setIsCalling] =
    useState(false);

  useEffect(() => {
    const handleMessage = async (
      message
    ) => {
      console.log(
        "Vapi Message:",
        message
      );

      if (
        message.type ===
        "tool-results"
      ) {
        const result =
          message.toolResults?.[0]
            ?.result ||
          "Task updated successfully";

        toast.success(result);

        await fetchTodos();
      }
    };

    vapi.on(
      "message",
      handleMessage
    );

    return () => {
      vapi.off(
        "message",
        handleMessage
      );
    };
  }, [fetchTodos]);

  const startCall = async () => {
    try {
      setIsCalling(true);

      toast.success(
        "Janvey is listening..."
      );

      await vapi.start(
        process.env
          .NEXT_PUBLIC_VAPI_ASSISTANT_ID
      );
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to start Janvey"
      );

      setIsCalling(false);
    }
  };

  const stopCall = async () => {
    vapi.stop();

    setIsCalling(false);

    await fetchTodos();

    toast(
      "Janvey stopped listening"
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isCalling ? (
        <button
          onClick={startCall}
          className="relative w-16 h-16 rounded-full 
          bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700
          shadow-lg shadow-purple-500/40 
          hover:scale-110 transition-all duration-300
          flex items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping opacity-30"></div>

          <Bot
            size={28}
            className="text-white relative z-10"
          />

          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></span>
        </button>
      ) : (
        <button
          onClick={stopCall}
          className="relative w-16 h-16 rounded-full 
          bg-gradient-to-br from-red-500 to-red-700
          shadow-lg shadow-red-500/40 
          hover:scale-110 transition-all duration-300
          flex items-center justify-center animate-pulse"
        >
          <X
            size={28}
            className="text-white"
          />
        </button>
      )}
    </div>
  );
}