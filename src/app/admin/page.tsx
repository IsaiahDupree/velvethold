import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin Dashboard | VelvetHold",
  description: "VelvetHold admin moderation and user management dashboard",
};

export default async function AdminDashboard() {
  const user = await getCurrentUser();

  // Check if user is admin (implement proper admin role check)
  if (!user) {
    redirect("/auth/signin");
  }

  // TODO: Implement actual admin role check
  // For now, redirect non-admins
  // const isAdmin = user.role === "admin"; // Once admin role is added
  // if (!isAdmin) {
  //   redirect("/");
  // }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Moderation and user management for VelvetHold
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Reports"
            value="12"
            href="/admin/reports"
            color="bg-red-600"
          />
          <StatCard
            title="Flagged Users"
            value="8"
            href="/admin/users?filter=flagged"
            color="bg-yellow-600"
          />
          <StatCard
            title="Active Users"
            value="1,234"
            href="/admin/users"
            color="bg-blue-600"
          />
          <StatCard
            title="Disputes"
            value="5"
            href="/admin/disputes"
            color="bg-purple-600"
          />
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NavCard
            title="Reports & Moderation"
            description="Review reported users, content, and safety concerns"
            icon="🚨"
            href="/admin/reports"
          />
          <NavCard
            title="User Management"
            description="View, manage, and suspend user accounts"
            icon="👥"
            href="/admin/users"
          />
          <NavCard
            title="Disputes & Appeals"
            description="Handle deposit disputes and account appeals"
            icon="⚖️"
            href="/admin/disputes"
          />
          <NavCard
            title="Content Moderation"
            description="Review flagged photos, messages, and profiles"
            icon="📸"
            href="/admin/content"
          />
          <NavCard
            title="Analytics"
            description="Platform metrics, user engagement, and revenue"
            icon="📊"
            href="/admin/analytics"
          />
          <NavCard
            title="Settings"
            description="Admin configuration and moderation policies"
            icon="⚙️"
            href="/admin/settings"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Moderation Activity</h2>
          <div className="space-y-4">
            <ActivityItem
              action="User Suspended"
              user="user@example.com"
              reason="Multiple harassment reports"
              time="2 hours ago"
              severity="high"
            />
            <ActivityItem
              action="Report Resolved"
              user="reporter@example.com"
              reason="Investigated - no violation found"
              time="4 hours ago"
              severity="medium"
            />
            <ActivityItem
              action="Content Removed"
              user="user@example.com"
              reason="Inappropriate profile photo"
              time="6 hours ago"
              severity="medium"
            />
            <ActivityItem
              action="Dispute Settled"
              user="Both parties"
              reason="Mutual agreement on refund"
              time="1 day ago"
              severity="low"
            />
          </div>
        </div>

        {/* Important Links */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Documentation</h2>
          <ul className="space-y-2 text-blue-400">
            <li>
              <a href="#" className="hover:underline">
                Moderation Policy & Guidelines
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Report Investigation Procedures
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                User Suspension & Appeal Process
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Dispute Resolution Framework
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
  color,
}: {
  title: string;
  value: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className={`${color} rounded-lg p-6 text-white hover:opacity-90 transition`}
    >
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </a>
  );
}

function NavCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </a>
  );
}

function ActivityItem({
  action,
  user,
  reason,
  time,
  severity,
}: {
  action: string;
  user: string;
  reason: string;
  time: string;
  severity: "high" | "medium" | "low";
}) {
  const severityColor = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  }[severity];

  return (
    <div className="border-l-4 border-gray-600 pl-4 py-2">
      <div className="flex justify-between items-start">
        <div>
          <p className={`font-bold ${severityColor}`}>{action}</p>
          <p className="text-sm text-gray-400">{user}</p>
          <p className="text-sm text-gray-500">{reason}</p>
        </div>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
}
