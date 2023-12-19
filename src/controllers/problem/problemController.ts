/* eslint-disable no-console */
import { Problem } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { PROBLEM_STATUS } from "../../constants/problem";
import { ROLE } from "../../constants/role";
import { prisma } from "../../db";
import { BadRequest } from "../../middlewares/request-handlers";
import { convertDurationTodateRanges, dateToISOString } from "../../utils/Date";

const createProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      adminUserId,
      title,
      industry,
      contact,
      status,
      note,
      departmentId,
      reciever,
    } = req.body;

    const problem = await prisma.problem.create({
      data: {
        adminUserId,
        departmentId,
        title,
        industry,
        contact,
        status: status ?? "unprocessed",
        note,
        reciever,
      },
    });
    res.status(201).json({
      message: "Problem created",
      data: problem,
    });
  } catch (error) {
    next(error);
  }
};

const updateProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.user as any;
    const { adminUserId, title, industry, contact, status, note, reciever } =
      req.body;

    const problem = await prisma.problem.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (user.role !== ROLE.SUPER_ADMIN && problem?.departmentId !== user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this problem",
      });
    }

    const newProblem = await prisma.problem.update({
      where: {
        id: Number(id),
      },
      data: {
        adminUserId,
        title,
        industry,
        contact,
        status,
        note,
        reciever,
      },
    });

    if (newProblem.status === PROBLEM_STATUS.PROCESSED) {
      await prisma.problem.update({
        where: {
          id: Number(id),
        },
        data: {
          processingDate: moment().toDate(),
        },
      });
    }

    res.status(200).json({
      message: "Problem updated",
      data: newProblem,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.query;
    const idArray = Array.isArray(ids) ? ids.map(Number) : [Number(ids)];
    const problem = await prisma.problem.deleteMany({
      where: {
        id: {
          in: idArray,
        },
      },
    });
    res.status(200).json({
      message: "Problem deleted",
      data: problem,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProblem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.user as any;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const take = limit;
    const skip = (page - 1) * limit;

    let problems: Problem[];
    let totalProblem: number;
    if (user.role !== ROLE.SUPER_ADMIN) {
      problems = await prisma.problem.findMany({
        take,
        skip,
        where: {
          departmentId: user.departmentId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      totalProblem = await prisma.problem.count({
        where: {
          departmentId: user.departmentId,
        },
      });
      const problemsPromise = await Promise.all(
        problems.map(async (problem) => {
          const department = await prisma.department.findUnique({
            where: {
              id: problem.departmentId,
            },
          });
          const adminUser = await prisma.adminUser.findUnique({
            where: {
              id: problem.adminUserId,
            },
          });
          const processingDate = moment(problem?.processingDate);
          const createdAt = moment(problem?.createdAt);
          const waittingTime = processingDate.diff(createdAt, "days");
          return {
            ...problem,
            departmentName: department?.name,
            adminUserName: adminUser?.fullName,
            waittingTime,
          };
        })
      );

      return res.status(200).json({
        message: "Problem fetched successfully",
        data: {
          problems: problemsPromise,
          meta: {
            page,
            limit,
            total: totalProblem,
          },
        },
      });
    }

    problems = await prisma.problem.findMany({
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });
    totalProblem = await prisma.problem.count();
    const problemsPromise = await Promise.all(
      problems.map(async (problem) => {
        const department = await prisma.department.findUnique({
          where: {
            id: problem.departmentId,
          },
        });
        const adminUser = await prisma.adminUser.findUnique({
          where: {
            id: problem.adminUserId,
          },
        });
        const processingDate = moment(problem?.processingDate);
        const createdAt = moment(problem?.createdAt);
        const waittingTime = processingDate.diff(createdAt, "days");
        return {
          ...problem,
          departmentName: department?.name,
          adminUserName: adminUser?.fullName,
          waittingTime,
        };
      })
    );

    res.status(200).json({
      message: "Problem fetched successfully",
      data: {
        problems: problemsPromise,
        meta: {
          page,
          limit,
          total: totalProblem,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProblemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const problem = await prisma.problem.findUnique({
      where: {
        id: Number(id),
      },
    });

    const processingDate = moment(problem?.processingDate);
    const createdAt = moment(problem?.createdAt);
    const waittingTime = processingDate.diff(createdAt, "days");

    res.status(200).json({
      message: "Problem fetched successfully",
      data: {
        ...problem,
        waittingTime,
      },
    });
  } catch (error) {
    console.log("🚀 ~ file: problemController.ts:222 ~ error:", error);
    next(error);
  }
};

const problemReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, departmentId, industry, page, limit } =
      req.query;
    const take = Number(limit) || 10;
    const skip = ((Number(page) || 1) - 1) * take;
    const problems = await prisma.problem.findMany({
      where: {
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: moment(startDate as string).toDate(),
                lte: moment(endDate as string).toDate(),
              },
            }
          : {}),
        ...(departmentId
          ? {
              departmentId: Number(departmentId),
            }
          : {}),
        ...(industry
          ? {
              industry: industry as string,
            }
          : {}),
      },
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.problem.count({
      where: {
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: moment(startDate as string).toDate(),
                lte: moment(endDate as string).toDate(),
              },
            }
          : {}),
        ...(departmentId
          ? {
              departmentId: Number(departmentId),
            }
          : {}),
        ...(industry
          ? {
              industry: industry as string,
            }
          : {}),
      },
    });

    const problemsPromise = await Promise.all(
      problems.map(async (problem) => {
        const department = await prisma.department.findUnique({
          where: {
            id: problem.departmentId,
          },
        });
        const adminUser = await prisma.adminUser.findUnique({
          where: {
            id: problem.adminUserId,
          },
        });
        const processingDate = moment(problem?.processingDate);
        const createdAt = moment(problem?.createdAt);
        const waittingTime = processingDate.diff(createdAt, "days");

        return {
          ...problem,
          departmentName: department?.name,
          adminUserName: adminUser?.fullName,
          waittingTime,
        };
      })
    );

    res.status(200).json({
      message: "Problem fetched successfully",
      data: {
        data: problemsPromise,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("🚀 ~ file: problemController.ts:268 ~ error:", error);
    next(error);
  }
};

const problemStatistical = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    const convertStartDate = moment(startDate as string).toDate();
    const convertEndDate = moment(endDate as string).toDate();

    if (!startDate || !endDate) {
      throw new BadRequest({
        message: "Start date and end date are required",
      });
    }

    if (
      startDate &&
      endDate &&
      moment(dateToISOString(convertStartDate)).isAfter(
        moment(dateToISOString(convertEndDate))
      )
    ) {
      throw new BadRequest({
        message: "Start date must be before end date",
      });
    }
    const dateRanges = convertDurationTodateRanges(
      convertStartDate,
      convertEndDate
    );

    const problemStats = await prisma.problem.findMany({
      where: {
        createdAt: {
          gte: convertStartDate,
          lte: convertEndDate,
        },
      },
    });

    const reports = await Promise.all(
      dateRanges.map(async (dateRange) => {
        const problems = problemStats.filter(
          (problem) =>
            moment(problem.createdAt).isSameOrAfter(moment(dateRange)) &&
            moment(problem.createdAt).isSameOrBefore(
              moment(dateRange).endOf("days")
            )
        );
        const total = problems.length;
        return {
          startDate: dateRange,
          endDate: dateRange,
          totalProblem: total,
        };
      })
    );
    res.status(200).json({
      message: "Problem fetched successfully",
      data: reports,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("🚀 ~ file: problemController.ts:268 ~ error:", error);
    next(error);
  }
};

export {
  createProblem,
  deleteProblems,
  getAllProblem,
  getProblemById,
  problemReport,
  problemStatistical,
  updateProblem,
};
