import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";

export function setupTranscriptionWebSocket(wss: WebSocketServer) {
  wss.on("connection", (clientWs: WebSocket) => {
    console.log("Client connected to /ws");

    let liveSession: Awaited<ReturnType<GoogleGenAI["live"]["connect"]>> | null = null;

    const sendToClient = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    const startGeminiSession = async () => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your_api_key_here") {
        sendToClient({ type: "error", message: "GEMINI_API_KEY is not configured on the server." });
        return;
      }

      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { apiVersion: "v1beta" },
        });
        const model = process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";

        liveSession = await ai.live.connect({
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            systemInstruction:
              "You are a passive transcription engine. Only listen to the user's audio.",
          },
          callbacks: {
            onopen: () => {
              console.log("Gemini Live session opened with model:", model);
              sendToClient({ type: "ready", message: "Live transcription started" });
            },
            onmessage: (message) => {
              const transcriptChunk = message.serverContent?.inputTranscription?.text;
              if (transcriptChunk) {
                sendToClient({
                  type: "transcript",
                  text: transcriptChunk,
                  isFinal: Boolean(message.serverContent?.turnComplete),
                });
              }
            },
            onerror: (err: any) => {
              console.error("Gemini Live error:", err?.message || err);
              const detail = err?.message || err?.error?.message || "Check backend terminal";
              sendToClient({ type: "error", message: `Transcription stream error: ${detail}` });
            },
            onclose: (event) => {
              console.log("Gemini Live session closed:", event?.code, event?.reason);
              sendToClient({
                type: "status",
                message: event?.reason ? `Closed: ${event.reason}` : "Live session closed",
              });
            },
          },
        });
      } catch (err) {
        console.error("Failed to connect to Gemini Live:", err);
        const detail = err instanceof Error ? err.message : "Unknown error";
        sendToClient({ type: "error", message: `Could not start Gemini Live session: ${detail}` });
      }
    };

    clientWs.on("message", async (rawMessage) => {
      try {
        const msg = JSON.parse(rawMessage.toString());

        if (msg.type === "start") {
          await startGeminiSession();
        } else if (msg.type === "audio" && msg.data && liveSession) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.data,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        } else if (msg.type === "stop") {
          if (liveSession) {
            liveSession.close();
            liveSession = null;
          }
          sendToClient({ type: "stopped" });
        }
      } catch (err) {
        console.error("WS message handling error:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("Client disconnected from /ws");
      if (liveSession) {
        liveSession.close();
        liveSession = null;
      }
    });
  });
}