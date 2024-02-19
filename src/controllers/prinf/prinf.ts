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

const createPrinf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      adminUserId,
      departmentId,
      prinf,
      location,
      noteUser,
      status,
      noteAdmin,
      reciever,
    } = req.body;
    console.log(typeof(adminUserId))
    const newPrinf = await prisma.printerRepairRegistrationForm.create({
      data: {
        adminUserId,
        departmentId,
        prinf,
        location,
        noteUser,
        noteAdmin,
        reciever,
        status: status ?? "unprocessed",
      },
    });
    res.status(201).json({
      message: "prinf created",
      data: newPrinf,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

const updatePrinf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.user as any;
    const {
      adminUserId,
      prinf,
      location,
      noteUser,
      status,
      noteAdmin,
      reciever,
    } = req.body;

    const findPrinf = await prisma.printerRepairRegistrationForm.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (user.role !== ROLE.SUPER_ADMIN && findPrinf?.adminUserId !== user.id) {  
      return res.status(403).json({
        message: "You are not allowed to update this prinf",
      });
    }

    const newPrinf = await prisma.printerRepairRegistrationForm.update({
      where: {
        id: Number(id),
      },
      data: {
        adminUserId,
        prinf,
        location,
        noteUser,
        status,
        noteAdmin,
        reciever,
      },
    });

    if (newPrinf.status === PRINF_STATUS.PROCESSED) {
      await prisma.printerRepairRegistrationForm.update({
        where: {
          id: Number(id),
        },
        data: {
          processingDate: moment().toDate(),
        },
      });
    }

    res.status(200).json({
      message: "Prinf updated",
      data: newPrinf,
    });
  } catch (error) {
    next(error);
  }
};

const updatePrinfConfirmed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.user as any;
    const {
      isConfirmed
    } = req.body;

    const findPrinf = await prisma.printerRepairRegistrationForm.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (user.role !== ROLE.SUPER_ADMIN && findPrinf?.adminUserId !== user.id) {  
      return res.status(403).json({
        message: "You are not allowed to update this prinf",
      });
    }

    const newPrinf = await prisma.printerRepairRegistrationForm.update({
      where: {
        id: Number(id),
      },
      data: {
        isConfirmed
      },
    });


    res.status(200).json({
      message: "Prinf updated",
      data: newPrinf,
    });
  } catch (error) {
    next(error);
  }
};

const deletePrinf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;
    const newPrinf = await prisma.printerRepairRegistrationForm.delete({
      where: {
        id: parseInt(id as string),
      },
    });
    res.status(200).json({
      message: "Prinf deleted",
      data: newPrinf,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPrinf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = req.user as any;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const take = limit;
    const skip = (page - 1) * limit;

    let prinfs: PrinterRepairRegistrationForm[];
    let totalPrinf: number;
    if (user.role !== ROLE.SUPER_ADMIN) {
      prinfs = await prisma.printerRepairRegistrationForm.findMany({
        take,
        skip,
        where: {
          departmentId: user.departmentId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      totalPrinf = await prisma.printerRepairRegistrationForm.count({
        where: {
          departmentId: user.departmentId,
        },
      });
      const prinfsPromise = await Promise.all(
        prinfs.map(async (prinf) => {
          const department = await prisma.department.findUnique({
            where: {
              id: prinf.departmentId,
            },
          });
          const adminUser = await prisma.adminUser.findUnique({
            where: {
              id: prinf.adminUserId,
            },
          });
          const processingDate = moment(prinf?.processingDate);
          const createdAt = moment(prinf?.createdAt);
          const waittingTime = processingDate.diff(createdAt, "days");
          return {
            ...prinf,
            departmentName: department?.name,
            adminUserName: adminUser?.fullName,
            waittingTime,
          };
        })
      );

      return res.status(200).json({
        message: "Problem fetched successfully",
        data: {
          prinfs: prinfsPromise,
          meta: {
            page,
            limit,
            total: totalPrinf,
          },
        },
      });
    }

    prinfs = await prisma.printerRepairRegistrationForm.findMany({
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });
    totalPrinf = await prisma.problem.count();
    const prinfsPromise = await Promise.all(
      prinfs.map(async (prinf) => {
        const department = await prisma.department.findUnique({
          where: {
            id: prinf.departmentId,
          },
        });
        const adminUser = await prisma.adminUser.findUnique({
          where: {
            id: prinf.adminUserId,
          },
        });
        const processingDate = moment(prinf?.processingDate);
        const createdAt = moment(prinf?.createdAt);
        const waittingTime = processingDate.diff(createdAt, "days");
        return {
          ...prinf,
          departmentName: department?.name,
          adminUserName: adminUser?.fullName,
          waittingTime,
        };
      })
    );

    res.status(200).json({
      message: "prinf fetched successfully",
      data: {
        prinfs: prinfsPromise,
        meta: {
          page,
          limit,
          total: totalPrinf,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPrinfById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const prinf = await prisma.printerRepairRegistrationForm.findUnique({
      where: {
        id: Number(id),
      },
    });

    const processingDate = moment(prinf?.processingDate);
    const createdAt = moment(prinf?.createdAt);
    const waittingTime = processingDate.diff(createdAt, "days");

    res.status(200).json({
      message: "prinf fetched successfully",
      data: {
        ...prinf,
        waittingTime,
      },
    });
  } catch (error) {
    console.log("🚀 ~ file: prinfController.ts:222 ~ error:", error);
    next(error);
  }
};

// const problemReport = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { startDate, endDate, departmentId, industry, page, limit } =
//       req.query;
//     const take = Number(limit) || 10;
//     const skip = ((Number(page) || 1) - 1) * take;
//     const problems = await prisma.problem.findMany({
//       where: {
//         ...(startDate && endDate
//           ? {
//               createdAt: {
//                 gte: moment(startDate as string).toDate(),
//                 lte: moment(endDate as string).toDate(),
//               },
//             }
//           : {}),
//         ...(departmentId
//           ? {
//               departmentId: Number(departmentId),
//             }
//           : {}),
//         ...(industry
//           ? {
//               industry: industry as string,
//             }
//           : {}),
//       },
//       take,
//       skip,
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const total = await prisma.problem.count({
//       where: {
//         ...(startDate && endDate
//           ? {
//               createdAt: {
//                 gte: moment(startDate as string).toDate(),
//                 lte: moment(endDate as string).toDate(),
//               },
//             }
//           : {}),
//         ...(departmentId
//           ? {
//               departmentId: Number(departmentId),
//             }
//           : {}),
//         ...(industry
//           ? {
//               industry: industry as string,
//             }
//           : {}),
//       },
//     });

//     const problemsPromise = await Promise.all(
//       problems.map(async (problem) => {
//         const department = await prisma.department.findUnique({
//           where: {
//             id: problem.departmentId,
//           },
//         });
//         const adminUser = await prisma.adminUser.findUnique({
//           where: {
//             id: problem.adminUserId,
//           },
//         });
//         const processingDate = moment(problem?.processingDate);
//         const createdAt = moment(problem?.createdAt);
//         const waittingTime = processingDate.diff(createdAt, "days");

//         return {
//           ...problem,
//           departmentName: department?.name,
//           adminUserName: adminUser?.fullName,
//           waittingTime,
//         };
//       })
//     );

//     res.status(200).json({
//       message: "Problem fetched successfully",
//       data: {
//         data: problemsPromise,
//         meta: {
//           page,
//           limit,
//           total,
//         },
//       },
//     });
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.log("🚀 ~ file: problemController.ts:268 ~ error:", error);
//     next(error);
//   }
// };

// const problemStatistical = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const convertStartDate = moment(startDate as string).toDate();
//     const convertEndDate = moment(endDate as string).toDate();

//     if (!startDate || !endDate) {
//       throw new BadRequest({
//         message: "Start date and end date are required",
//       });
//     }

//     if (
//       startDate &&
//       endDate &&
//       moment(dateToISOString(convertStartDate)).isAfter(
//         moment(dateToISOString(convertEndDate))
//       )
//     ) {
//       throw new BadRequest({
//         message: "Start date must be before end date",
//       });
//     }
//     const dateRanges = convertDurationTodateRanges(
//       convertStartDate,
//       convertEndDate
//     );

//     const problemStats = await prisma.problem.findMany({
//       where: {
//         createdAt: {
//           gte: convertStartDate,
//           lte: convertEndDate,
//         },
//       },
//     });

//     const reports = await Promise.all(
//       dateRanges.map(async (dateRange) => {
//         const problems = problemStats.filter(
//           (problem) =>
//             moment(problem.createdAt).isSameOrAfter(moment(dateRange)) &&
//             moment(problem.createdAt).isSameOrBefore(
//               moment(dateRange).endOf("days")
//             )
//         );
//         const total = problems.length;
//         return {
//           startDate: dateRange,
//           endDate: dateRange,
//           totalProblem: total,
//         };
//       })
//     );
//     res.status(200).json({
//       message: "Problem fetched successfully",
//       data: reports,
//     });
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.log("🚀 ~ file: problemController.ts:268 ~ error:", error);
//     next(error);
//   }
// };

export { createPrinf, updatePrinf, deletePrinf, getAllPrinf, getPrinfById, updatePrinfConfirmed };
