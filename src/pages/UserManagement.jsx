import React from "react";
import { Shield, Users } from "lucide-react";
import RoleManagement from "../components/collaboration/RoleManagement";

export default function UserManagement() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-10 h-10 text-blue-400" />
          User Management
        </h1>
        <p className="text-slate-400">
          Manage user roles and permissions
        </p>
      </div>

      <RoleManagement />
    </div>
  );
}