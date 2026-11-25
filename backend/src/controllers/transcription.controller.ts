import { Request, Response } from "express";
import { transcriptionService } from "../services/transcription.service";

export const transcriptionController = {
  async create(req: Request, res: Response) {
    try {
      const { title, content, languages, durationSeconds } = req.body;
      if (!content || typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "Transcription content is required." });
      }
      const record = await transcriptionService.create({
        title,
        content,
        languages,
        durationSeconds,
      });
      return res.status(201).json(record);
    } catch (err) {
      console.error("Create transcription error:", err);
      return res.status(500).json({ error: "Failed to save transcription." });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const records = await transcriptionService.findAll(search);
      return res.json(records);
    } catch (err) {
      console.error("Fetch transcriptions error:", err);
      return res.status(500).json({ error: "Failed to fetch transcriptions." });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const record = await transcriptionService.findById(id);
      if (!record) return res.status(404).json({ error: "Transcription not found." });
      return res.json(record);
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch transcription." });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const { title, content } = req.body;
      const updated = await transcriptionService.update(id, { title, content });
      return res.json(updated);
    } catch (err) {
      return res.status(404).json({ error: "Transcription not found or update failed." });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await transcriptionService.remove(id);
      return res.status(204).send();
    } catch (err) {
      return res.status(404).json({ error: "Transcription not found." });
    }
  },
};