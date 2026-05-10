"use client";

import { useState } from "react";
import Vapi from "@vapi-ai/web";
import { Bot, X } from "lucide-react";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

export default function VoiceAgent() {
  const [isCalling, setIsCalling] = useState(false);

  const startCall = async () => {
    try {
      setIsCalling(true);
      await vapi.start(
        process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
      );
    } catch (error) {
      console.log(error);
      setIsCalling(false);
    }
  };

  const stopCall = () => {
    vapi.stop();
    setIsCalling(false);
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
          {/* Glow Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping opacity-30"></div>

          {/* AI Face */}
          <Bot
            size={28}
            className="text-white relative z-10"
          />

          {/* Online Dot */}
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
          {/* Close icon */}
          <X
            size={28}
            className="text-white relative z-10"
          />
        </button>
      )}

    </div>
  );
}