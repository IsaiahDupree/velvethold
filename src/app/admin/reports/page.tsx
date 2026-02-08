import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reports | Admin Dashboard",
  description: "Review and manage user reports and safety concerns",
};

export default async function AdminReports() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  // Mock data - in production, fetch from API
  const reports = [
    {
      id: "1",
      type: "harassment",
      reporter: "user@example.com",
      reported: "accused@example.com",
      reason: "Sent inappropriate messages",
      status: "pending",
      createdAt: new Date(),
      priority: "high",
    },
    {
      id: "2",
      type: "fake_profile",
      reporter: "another@example.com",
      reported: "suspect@example.com",
      reason: "Photos appear to be stolen",
      status: "under_review",
      createdAt: new Date(Date.now() - 86400000),
      priority: "high",
    },
    {
      id: "3",
      type: "offensive_content",
      reporter: "user3@example.com",
      reported: "offensive@example.com",
      reason: "Inappropriate profile bio",
      status: "pending",
      createdAt: new Date(Date.now() - 172800000),
      priority: "medium",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Reports</h1>
          <p className="mt-2 text-gray-400">
            Review reported users and safety concerns
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            All
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
            Pending
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
            Under Review
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
            Resolved
          </button>
        </div>

        {/* Reports Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Reported User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-red-900 rounded text-sm">
                      {report.type.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{report.reporter}</td>
                  <td className="px-6 py-4 text-sm font-medium">{report.reported}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        report.status === "pending"
                          ? "bg-yellow-900 text-yellow-200"
                          : report.status === "under_review"
                          ? "bg-blue-900 text-blue-200"
                          : "bg-green-900 text-green-200"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        report.priority === "high"
                          ? "bg-red-900 text-red-200"
                          : "bg-yellow-900 text-yellow-200"
                      }`}
                    >
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-400 hover:underline">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            Showing {reports.length} of {reports.length} reports
          </p>
          <div className="flex gap-2">
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
              Previous
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
