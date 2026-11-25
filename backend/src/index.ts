import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import transcriptionRoutes from "./routes/transcription.routes";
import { setupTranscriptionWebSocket } from "./ws/transcription.ws";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : []),
    ],
  })
);
app.use(express.json());

// Health check route
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "voxora-backend" });
});

// Transcription CRUD routes
app.use("/api/transcriptions", transcriptionRoutes);

const server = http.createServer(app);

// WebSocket server mounted at /ws
const wss = new WebSocketServer({ server, path: "/ws" });
setupTranscriptionWebSocket(wss);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});