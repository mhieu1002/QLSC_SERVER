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
import { Admin } from '@prisma/client';

// Thêm lịch họp
const addMeeting = async (req: Request, res: Response, next: NextFunction) => {
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
      pdfFile, // Thêm trường này vào phần xử lý yêu cầu
    } = req.body;

    // Kiểm tra xem thời gian bắt đầu và kết thúc là hợp lệ
    if (startTime >= endTime) {
      return res.status(400).json({ message: "Invalid meeting time" });
    }

    // Kiểm tra xem có cuộc họp nào xung đột không
    const conflictingMeetings = await prisma.meeting.findMany({
      where: {
        room: room,
        startTime: {
          lte: endTime,
        },
        endTime: {
          gte: startTime,
        },
      },
    });

    if (conflictingMeetings.length > 0) {
      return res.status(400).json({ message: "Conflicting meeting schedule" });
    }

    // Tạo cuộc họp mới
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
        pdfFile, // Thêm trường này vào dữ liệu tạo mới
      },
    });
    res.status(201).json({
      message: "Meet created",
      data: newMeet,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Sửa lịch họp theo id
const updateMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const {
      adminUserId,
      departmentId,
      title,
      host,
      room,
      participants,
      startTime,
      endTime,
      pdfFile, // Thêm trường này vào phần xử lý yêu cầu
    } = req.body;

    // Kiểm tra xem cuộc họp tồn tại
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    // Xác thực người dùng và kiểm tra quyền truy cập user.role !== ROLE.SUPER_ADMIN && existingMeeting?.adminUserId !== user.id
    if (user.role !== ROLE.SUPER_ADMIN && meeting?.adminUserId !== user.id) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Kiểm tra xem có cuộc họp nào khác trong phòng họp và trong khoảng thời gian cập nhật không
    const conflictingMeetings = await prisma.meeting.findMany({
      where: {
        id: {
          not: parseInt(id), // Loại bỏ cuộc họp hiện tại khỏi việc kiểm tra xung đột với chính nó
        },
        room: room,
        startTime: {
          lte: endTime,
        },
        endTime: {
          gte: startTime,
        },
      },
    });

    if (conflictingMeetings.length > 0) {
      return res.status(400).json({ message: "Conflicting meeting schedule" });
    }

    // Cập nhật thông tin của cuộc họp
    const updatedMeeting = await prisma.meeting.update({
      where: {
        id: parseInt(id),
      },
      data: {
        adminUserId,
        departmentId,
        title,
        host,
        room,
        participants,
        startTime,
        endTime,
        pdfFile, // Thêm trường này vào dữ liệu cập nhật
      },
    });

    res.status(200).json({
      message: "Meeting updated successfully",
      data: updatedMeeting,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Xóa lịch họp theo id
const deleteMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    // Kiểm tra xem cuộc họp tồn tại
    const existingMeeting = await prisma.meeting.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    // Kiểm tra quyền truy cập
    if (!existingMeeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (user.role !== ROLE.SUPER_ADMIN && existingMeeting?.adminUserId !== user.id) {
      return res.status(404).json({ message: "Unauthorized" });
    }

    // Xóa cuộc họp từ cơ sở dữ liệu
    await prisma.meeting.delete({
      where: {
        id: existingMeeting.id,
      },
    });

    res.status(200).json({
      message: "Meeting deleted successfully",
      status: 200
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Xem tất cả lịch họp
const getAllMeetings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Lấy tất cả các cuộc họp từ cơ sở dữ liệu
    const allMeetings = await prisma.meeting.findMany({
      include: {
        adminUser: true, // Đảm bảo rằng bạn đã thiết lập mối quan hệ giữa meeting và adminUser trong file Prisma
      },
    });

    res.status(200).json({
      message: "All meetings retrieved",
      data: allMeetings,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Xem lịch họp theo id
const getMeetingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Tìm cuộc họp theo ID trong cơ sở dữ liệu
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json({
      message: "Meeting retrieved successfully",
      data: meeting,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export {
  getMeetingById,
  getAllMeetings,
  updateMeetingById,
  addMeeting,
  deleteMeetingById,
};
