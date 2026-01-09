"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminUsersManager({
  currentRole,
}: {
  currentRole: string;
}) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // New admin form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [creating, setCreating] = useState(false);

  const isOwner = currentRole === "owner";

  // 🔄 Load admins
  async function loadAdmins() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const text = await res.text();
const json = text ? JSON.parse(text) : {};

    setAdmins(json.users || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  // ➕ Add admin by email
 async function addAdmin() {
  if (!email) return;

  setCreating(true);

  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    alert(json.error || "Failed to add admin");
    setCreating(false);
    return;
  }

  if (json.tempPassword) {
    alert(
      `Admin created successfully.\n\nEmail: ${email}\nTemporary password: ${json.tempPassword}`
    );
  } else {
    alert("Admin added (existing user).");
  }

  setEmail("");
  setRole("admin");
  setCreating(false);
  loadAdmins();
}


  // ❌ Remove admin (soft delete)
  async function removeAdmin(id: string) {
    if (!confirm("Remove this admin?")) return;

    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      alert("Failed to remove admin");
      return;
    }

    loadAdmins();
  }

  // 🚫 Non-owner guard
  if (!isOwner) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
        Only the <strong>Owner</strong> can manage admins.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Admin Management
      </h2>

      {/* ➕ Add Admin */}
      <div className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
        <h3 className="font-medium">Add Admin</h3>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="email"
            placeholder="Admin email"
            className="border rounded px-3 py-2 w-full md:w-80"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="content_admin">Content Admin</option>
            <option value="analytics_admin">Analytics Admin</option>
          </select>

          <button
            onClick={addAdmin}
            disabled={creating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add Admin"}
          </button>
        </div>
      </div>

      {/* 📋 Admin List */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="font-medium mb-3">Current Admins</h3>

        {loading ? (
          <p className="text-gray-500">Loading admins...</p>
        ) : admins.length === 0 ? (
          <p className="text-gray-500">No admins found.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b">
                  <td className="p-2">
                    {admin.email || "(unknown)"}
                  </td>
                  <td className="p-2">{admin.role}</td>
                  <td className="p-2">
                    {admin.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="p-2 text-right">
                    {admin.role !== "owner" && (
                      <button
                        onClick={() => removeAdmin(admin.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
