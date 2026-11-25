import { Router } from "express";
import { transcriptionController } from "../controllers/transcription.controller";

const router = Router();

router.post("/", transcriptionController.create);
router.get("/", transcriptionController.getAll);
router.get("/:id", transcriptionController.getOne);
router.patch("/:id", transcriptionController.update);
router.delete("/:id", transcriptionController.remove);

export default router;