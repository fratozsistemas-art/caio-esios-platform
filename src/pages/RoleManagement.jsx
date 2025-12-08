import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Lock, Key } from "lucide-react";
import UserRoleManager from "../components/rbac/UserRoleManager";
import PermissionManager from "../components/rbac/PermissionManager";
import EntityAccessManager from "../components/rbac/EntityAccessManager";
import RoleStatsWidget from "../components/rbac/RoleStatsWidget";

export default function RoleManagement() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Role & Access Management</h1>
        <p className="text-slate-400">Manage user roles, permissions, and entity access controls</p>
      </div>

      <RoleStatsWidget />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            User Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Lock className="w-4 h-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="entity-access" className="gap-2">
            <Key className="w-4 h-4" />
            Entity Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserRoleManager />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionManager />
        </TabsContent>

        <TabsContent value="entity-access" className="mt-6">
          <EntityAccessManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}