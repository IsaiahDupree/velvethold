import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage and moderate user accounts",
};

export default async function AdminUsers() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  // Mock data - in production, fetch from API
  const users = [
    {
      id: "1",
      email: "user@example.com",
      name: "John Doe",
      role: "requester",
      status: "active",
      verified: true,
      createdAt: new Date(Date.now() - 2592000000),
      lastActive: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      email: "flagged@example.com",
      name: "Suspicious User",
      role: "both",
      status: "flagged",
      verified: true,
      createdAt: new Date(Date.now() - 604800000),
      lastActive: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
      email: "suspended@example.com",
      name: "Banned User",
      role: "invitee",
      status: "suspended",
      verified: false,
      createdAt: new Date(Date.now() - 1209600000),
      lastActive: new Date(Date.now() - 864000000),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
          <p className="mt-2 text-gray-400">
            View and manage user accounts and status
          </p>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search by email or name..."
            className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 outline-none"
          />
          <div className="flex gap-2 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              All
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
              Active
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
              Flagged
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
              Suspended
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded">
              Unverified
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium">{u.email}</td>
                  <td className="px-6 py-4 text-sm">{u.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-gray-700 rounded text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        u.status === "active"
                          ? "bg-green-900 text-green-200"
                          : u.status === "flagged"
                          ? "bg-yellow-900 text-yellow-200"
                          : "bg-red-900 text-red-200"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {u.verified ? (
                      <span className="text-green-400">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-400">⚠ Unverified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {u.lastActive.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-400 hover:underline mr-4">
                      View
                    </button>
                    {u.status === "active" && (
                      <button className="text-yellow-400 hover:underline">
                        Flag
                      </button>
                    )}
                    {u.status === "flagged" && (
                      <button className="text-red-400 hover:underline">
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Stats */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value="1,234" />
          <StatCard title="Active Today" value="456" />
          <StatCard title="Flagged Accounts" value="8" />
          <StatCard title="Suspended Accounts" value="3" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
