import { Router } from "express";
import { addMeeting, updateMeetingById, deleteMeetingById, getAllMeetings, getMeetingById } from "../controllers/meeting";
import { adminMiddleware } from "../middlewares/auth/adminMiddleware";
import { problemMiddleware } from "../middlewares/auth/problemMiddleware";

export const meeting = Router();

meeting.post("/create", [problemMiddleware], addMeeting);
meeting.put("/update/:id", [problemMiddleware], updateMeetingById);
meeting.delete("/delete", [adminMiddleware], deleteMeetingById);
meeting.get("/", [problemMiddleware], getAllMeetings);
meeting.get("/:id", [problemMiddleware], getMeetingById);


