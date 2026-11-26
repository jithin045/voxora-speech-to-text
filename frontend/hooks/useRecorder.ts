"use client";

import { useEffect, useRef, useState } from "react";
import { float32ToInt16Base64 } from "../lib/audio";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";

export function useRecorder(onError: (msg: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [elapsed, setElapsed] = useState(0);
  const [liveText, setLiveText] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  const stopRecording = () => {
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
      wsRef.current.close();
    }

    processorRef.current = null;
    audioCtxRef.current = null;
    streamRef.current = null;
    wsRef.current = null;
    setIsRecording(false);
    setStatus("Ready");
  };

  useEffect(() => () => stopRecording(), []);

  const startRecording = async () => {
    onError("");
    setStatus("Connecting...");
    setElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => ws.send(JSON.stringify({ type: "start" }));

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "ready") {
          setStatus("Listening");
          setIsRecording(true);
          startTimeRef.current = Date.now();

          const audioCtx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const base64Pcm = float32ToInt16Base64(e.inputBuffer.getChannelData(0));
            ws.send(JSON.stringify({ type: "audio", data: base64Pcm }));
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        } else if (msg.type === "transcript" && msg.text) {
          setLiveText((prev) => (prev ? `${prev} ${msg.text}`.replace(/\s+/g, " ") : msg.text));
        } else if (msg.type === "error") {
          onError(msg.message || "Transcription error");
          stopRecording();
        }
      };

      ws.onerror = () => {
        onError("WebSocket connection failed. Backend may be waking up.");
        stopRecording();
      };

      ws.onclose = () => {
        setIsRecording(false);
        setStatus("Ready");
      };
    } catch {
      onError("Microphone access denied or unavailable.");
      setStatus("Ready");
    }
  };

  const getDuration = () =>
    startTimeRef.current ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)) : undefined;

  const reset = () => {
    setLiveText("");
    setElapsed(0);
    startTimeRef.current = null;
  };

  return { isRecording, status, elapsed, liveText, setLiveText, startRecording, stopRecording, getDuration, reset };
}