/* eslint-disable no-console */
import { PrinterRepairRegistrationForm, Problem } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { PROBLEM_STATUS } from "../../constants/problem";
import { ROLE } from "../../constants/role";
import { prisma } from "../../db";
import { BadRequest } from "../../middlewares/request-handlers";
import { convertDurationTodateRanges, dateToISOString } from "../../utils/Date";
import { PRINF_STATUS } from "../../constants/prinf";


// Thêm lịch họp
export const addMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      adminUserId,
      departmentId,
      title,
      host,
      room,
      participants,
      startTime,
      endTime,
    } = req.body;

    // Kiểm tra xem có cuộc họp nào diễn ra từ 7:00 đến 8:00 ngày 21/02/2024 tại phòng họp A không
    const conflictingMeetings = await prisma.meeting.findMany({
      where: {
        room: room,
        AND: [
          { startTime: { lte: startTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    if (conflictingMeetings.length > 0) {
      return res.status(400).json({ message: "Conflicting meeting schedule" });
    }

    // Nếu không có cuộc họp nào xung đột, tạo cuộc họp mới
    const newMeet = await prisma.meeting.create({
      data: {
        adminUserId,
        departmentId,
        title,
        host,
        room,
        participants,
        startTime,
        endTime,
      },
    });
    res.status(201).json({
      message: "Meet created",
      data: newMeet,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};


// // Sửa lịch họp theo id
// export const updateMeetingById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { adminUserId, departmentId, title, startTime, endTime, host, room, participants} = req.body;

//     const meeting = await prisma.meeting.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     if (!meeting) {
//       res.status(404).json({ message: "Meeting not found" });
//       return;
//     }

//     // Kiểm tra quyền truy cập
//     if (meeting.adminUserId !== adminUserId) {
//       res.status(403).json({ message: "Permission denied" });
//       return;
//     }

//     // Kiểm tra xem có lịch họp nào khác trong khoảng thời gian và địa điểm này không
//     const existingMeeting = await prisma.meeting.findFirst({
//       where: {
//         AND: [
//           {
//             id: { not: parseInt(id) }
//           },
//           {
//             OR: [
//               {
//                 AND: [
//                   { startTime: { lte: startTime } },
//                   { endTime: { gte: startTime } },
//                   { room: room }
//                 ]
//               },
//               {
//                 AND: [
//                   { startTime: { lte: endTime } },
//                   { endTime: { gte: endTime } },
//                   { room: room }
//                 ]
//               },
//               {
//                 AND: [
//                   { startTime: { gte: startTime } },
//                   { endTime: { lte: endTime } },
//                   { room: room }
//                 ]
//               }
//             ]
//           }
//         ]
//       }
//     });

//     if (existingMeeting) {
//       res.status(400).json({ message: "A meeting already exists in this time and room" });
//       return;
//     }

//     const updatedMeeting = await prisma.meeting.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: {
//         adminUserId,
//         departmentId,
//         title,
//         startTime,
//         endTime,
//         host,
//         room,
//       },
//     });

//     res.status(200).json(updatedMeeting);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Xóa lịch họp theo id
// export const deleteMeetingById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { adminUserId } = req.body;

//     const meeting = await prisma.meeting.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     if (!meeting) {
//       res.status(404).json({ message: "Meeting not found" });
//       return;
//     }

//     // Kiểm tra quyền truy cập
//     if (meeting.adminUserId !== adminUserId) {
//       res.status(403).json({ message: "Permission denied" });
//       return;
//     }

//     await prisma.meeting.delete({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     res.status(200).json({ message: "Meeting deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Xem tất cả lịch họp
// export const getAllMeetings = async (req: Request, res: Response) => {
//   try {
//     const meetings = await prisma.meeting.findMany();
//     res.status(200).json(meetings);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Xem lịch họp theo id
// export const getMeetingById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const meeting = await prisma.meeting.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     if (!meeting) {
//       res.status(404).json({ message: "Meeting not found" });
//       return;
//     }

//     res.status(200).json(meeting);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
