import { prisma } from "../lib/prisma";

export interface CreateTranscriptionInput {
  title?: string;
  content: string;
  languages?: string[];
  durationSeconds?: number;
}

export interface UpdateTranscriptionInput {
  title?: string;
  content?: string;
}

export const transcriptionService = {
  async create(data: CreateTranscriptionInput) {
    return prisma.transcription.create({
      data: {
        title: data.title?.trim() || "Untitled Recording",
        content: data.content.trim(),
        languages: data.languages || ["hi", "en"],
        durationSeconds: data.durationSeconds ?? null,
      },
    });
  },

  async findAll(search?: string) {
    return prisma.transcription.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.transcription.findUnique({ where: { id } });
  },

  async update(id: string, data: UpdateTranscriptionInput) {
    return prisma.transcription.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.content !== undefined && { content: data.content.trim() }),
      },
    });
  },

  async remove(id: string) {
    return prisma.transcription.delete({ where: { id } });
  },
};