import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import RBACGuard from "../components/rbac/RBACGuard";
import { rbacCRUD } from "../components/rbac/RBACWrapper";
import { Building2, Plus, Edit, Trash2, Search, Shield } from "lucide-react";
import { toast } from "sonner";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      return await rbacCRUD.read('CompanyProfile', {});
    }
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id) => {
      return await rbacCRUD.delete('CompanyProfile', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      toast.success('Company deleted');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cnpj?.includes(searchQuery)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Companies</h1>
          <p className="text-slate-400">Manage company profiles with RBAC protection</p>
        </div>
        <RBACGuard entity="CompanyProfile" action="create" showAlert={false}>
          <Button className="bg-[#C7A763] hover:bg-[#A8864D]">
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </RBACGuard>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Company Directory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RBACGuard entity="CompanyProfile" action="read">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No companies found</div>
              ) : (
                filteredCompanies.map((company) => (
                  <Card key={company.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C7A763] to-[#E3C37B] flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{company.name}</p>
                            <div className="flex gap-2 mt-1">
                              {company.cnpj && (
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                  {company.cnpj}
                                </Badge>
                              )}
                              {company.industry && (
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                  {company.industry}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <RBACGuard entity="CompanyProfile" action="update" showAlert={false}>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </RBACGuard>
                          <RBACGuard entity="CompanyProfile" action="delete" showAlert={false}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCompanyMutation.mutate(company.id)}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </RBACGuard>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </RBACGuard>
        </CardContent>
      </Card>
    </div>
  );
}