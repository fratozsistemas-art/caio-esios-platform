import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RBACGuard from "../components/rbac/RBACGuard";
import { usePermissions } from "../components/rbac/usePermissions";
import { rbacCRUD } from "../components/rbac/RBACWrapper";
import { Shield, Lock, Eye, Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function RBACDemo() {
  const companyReadPerm = usePermissions('CompanyProfile', 'read');
  const companyCreatePerm = usePermissions('CompanyProfile', 'create');
  const companyUpdatePerm = usePermissions('CompanyProfile', 'update');
  const companyDeletePerm = usePermissions('CompanyProfile', 'delete');

  const testRBACOperation = async (operation) => {
    try {
      if (operation === 'read') {
        const data = await rbacCRUD.read('CompanyProfile', {});
        toast.success(`Read ${data.length} companies`);
      } else if (operation === 'create') {
        await rbacCRUD.create('CompanyProfile', {
          name: 'Test Company',
          trading_name: 'Test Co'
        });
        toast.success('Company created');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">RBAC Demo</h1>
        <p className="text-slate-400">Test role-based access control system</p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Your Role: {companyReadPerm.role || 'Loading...'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PermissionCard
              icon={Eye}
              label="Read"
              allowed={companyReadPerm.allowed}
              loading={companyReadPerm.loading}
            />
            <PermissionCard
              icon={Plus}
              label="Create"
              allowed={companyCreatePerm.allowed}
              loading={companyCreatePerm.loading}
            />
            <PermissionCard
              icon={Edit}
              label="Update"
              allowed={companyUpdatePerm.allowed}
              loading={companyUpdatePerm.loading}
            />
            <PermissionCard
              icon={Trash2}
              label="Delete"
              allowed={companyDeletePerm.allowed}
              loading={companyDeletePerm.loading}
            />
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <p className="text-sm text-slate-300 mb-2">Test Operations:</p>
            
            <RBACGuard entity="CompanyProfile" action="read" showAlert={false}>
              <Button onClick={() => testRBACOperation('read')} className="w-full bg-blue-600 hover:bg-blue-700">
                <Eye className="w-4 h-4 mr-2" />
                Test Read Companies
              </Button>
            </RBACGuard>

            <RBACGuard entity="CompanyProfile" action="create" showAlert={false}>
              <Button onClick={() => testRBACOperation('create')} className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Test Create Company
              </Button>
            </RBACGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PermissionCard({ icon: Icon, label, allowed, loading }) {
  return (
    <div className={`p-4 rounded-lg border ${
      loading ? 'bg-slate-500/10 border-slate-500/30' :
      allowed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
    }`}>
      <Icon className={`w-6 h-6 mb-2 ${
        loading ? 'text-slate-400' :
        allowed ? 'text-green-400' : 'text-red-400'
      }`} />
      <p className="text-sm text-white font-medium">{label}</p>
      <p className={`text-xs ${
        loading ? 'text-slate-400' :
        allowed ? 'text-green-400' : 'text-red-400'
      }`}>
        {loading ? 'Checking...' : allowed ? 'Allowed' : 'Denied'}
      </p>
    </div>
  );
}