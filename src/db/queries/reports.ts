import { db } from "@/db";
import { reports, users, profiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { CreateReportInput, UpdateReportInput, ListReportsInput } from "@/lib/validations/report";

export async function createReport(input: CreateReportInput & { reporterId: string }) {
  const { reporterId, reportedUserId, reportType, description, context, contextId } = input;

  // Prevent self-reporting
  if (reporterId === reportedUserId) {
    throw new Error("You cannot report yourself");
  }

  // Check if a similar active report already exists
  const existingReport = await db.query.reports.findFirst({
    where: and(
      eq(reports.reporterId, reporterId),
      eq(reports.reportedUserId, reportedUserId),
      eq(reports.status, "pending")
    ),
  });

  if (existingReport) {
    throw new Error("You already have a pending report for this user");
  }

  const [report] = await db
    .insert(reports)
    .values({
      reporterId,
      reportedUserId,
      reportType,
      description,
      context,
      contextId,
      status: "pending",
    })
    .returning();

  return report;
}

export async function getReportById(reportId: string) {
  const report = await db.query.reports.findFirst({
    where: eq(reports.id, reportId),
    with: {
      reporter: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      reportedUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
        with: {
          profile: {
            columns: {
              displayName: true,
              city: true,
            },
          },
        },
      },
      reviewer: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return report;
}

export async function listReports(input: ListReportsInput) {
  const { status, reportedUserId, limit, offset } = input;

  const conditions = [];
  if (status) {
    conditions.push(eq(reports.status, status));
  }
  if (reportedUserId) {
    conditions.push(eq(reports.reportedUserId, reportedUserId));
  }

  const reportsList = await db.query.reports.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      reporter: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      reportedUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
        with: {
          profile: {
            columns: {
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: [desc(reports.createdAt)],
    limit,
    offset,
  });

  return reportsList;
}

export async function listUserReports(userId: string) {
  const userReports = await db.query.reports.findMany({
    where: eq(reports.reporterId, userId),
    with: {
      reportedUser: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          profile: {
            columns: {
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: [desc(reports.createdAt)],
  });

  return userReports;
}

export async function updateReportStatus(
  reportId: string,
  input: UpdateReportInput & { reviewedBy?: string }
) {
  const { status, reviewNotes, actionTaken, reviewedBy } = input;

  const [updatedReport] = await db
    .update(reports)
    .set({
      status,
      reviewNotes,
      actionTaken,
      reviewedBy,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, reportId))
    .returning();

  return updatedReport;
}

export async function userOwnsReport(reportId: string, userId: string) {
  const report = await db.query.reports.findFirst({
    where: and(eq(reports.id, reportId), eq(reports.reporterId, userId)),
  });

  return !!report;
}
