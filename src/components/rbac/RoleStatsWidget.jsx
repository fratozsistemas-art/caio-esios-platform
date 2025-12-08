import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Lock, Key } from "lucide-react";

export default function RoleStatsWidget() {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['userRoles'],
    queryFn: () => base44.entities.UserRole.list()
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => base44.entities.Permission.list()
  });

  const { data: entityAccess = [] } = useQuery({
    queryKey: ['entityAccess'],
    queryFn: () => base44.entities.EntityAccess.list()
  });

  const stats = [
    {
      icon: Shield,
      label: "Total Users",
      value: users.length,
      color: "#C7A763"
    },
    {
      icon: Users,
      label: "Active Role Assignments",
      value: userRoles.filter(r => r.is_active).length,
      color: "#0A1E3A"
    },
    {
      icon: Lock,
      label: "Permission Rules",
      value: permissions.length,
      color: "#112A4D"
    },
    {
      icon: Key,
      label: "Entity Access Grants",
      value: entityAccess.filter(a => a.is_active).length,
      color: "#C7A763"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}