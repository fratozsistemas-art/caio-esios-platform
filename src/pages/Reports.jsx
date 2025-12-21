import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  BarChart3,
  FileSpreadsheet,
  Trash2,
  Eye,
  Edit
} from "lucide-react";
import { motion } from "framer-motion";
import ReportBuilder from "../components/reports/ReportBuilder";
import ReportTemplates from "../components/reports/ReportTemplates";
import ScheduledReports from "../components/reports/ScheduledReports";
import ReportPreview from "../components/reports/ReportPreview";

export default function Reports() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const allReports = await base44.entities.Report.list('-created_date');
      return allReports;
    }
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ['report_schedules'],
    queryFn: () => base44.entities.ReportSchedule.list()
  });

  const generateMutation = useMutation({
    mutationFn: async (reportConfig) => {
      const { data } = await base44.functions.invoke('generateReport', reportConfig);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Report.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });

  const handleCreateReport = (config) => {
    generateMutation.mutate(config);
    setShowBuilder(false);
  };

  const handleDownload = async (report) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank');
    }
  };

  const stats = [
    {
      icon: FileText,
      label: "Total Reports",
      value: reports.length,
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Calendar,
      label: "Scheduled",
      value: schedules.filter(s => s.is_active).length,
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      label: "This Month",
      value: reports.filter(r => 
        new Date(r.created_date).getMonth() === new Date().getMonth()
      ).length,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-400" />
            Strategic Reports
          </h1>
          <p className="text-slate-400">
            Generate, schedule, and manage strategic intelligence reports
          </p>
        </div>
        <Button
          onClick={() => setShowBuilder(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            My Reports
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Filter className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled
          </TabsTrigger>
        </TabsList>

        {/* My Reports Tab */}
        <TabsContent value="reports">
          {isLoading ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-slate-500 animate-pulse mx-auto mb-4" />
                <p className="text-slate-400">Loading reports...</p>
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No reports generated yet</p>
                <Button
                  onClick={() => setShowBuilder(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {getFormatIcon(report.format)}
                              <span className="ml-1">{report.format.toUpperCase()}</span>
                            </Badge>
                            {report.template && (
                              <Badge variant="outline" className="border-white/20 text-slate-400">
                                {report.template}
                              </Badge>
                            )}
                          </div>
                          {report.description && (
                            <p className="text-sm text-slate-400 mb-3">{report.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(report.created_date).toLocaleDateString()}
                            </span>
                            {report.data_sources && (
                              <span>{report.data_sources.length} data sources</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowPreview(true);
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(report)}
                            className="text-blue-400 hover:text-blue-300"
                            disabled={!report.file_url}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(report.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <ReportTemplates onSelectTemplate={(template) => {
            setShowBuilder(true);
            setSelectedReport({ template });
          }} />
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled">
          <ScheduledReports schedules={schedules} />
        </TabsContent>
      </Tabs>

      {/* Report Builder Modal */}
      {showBuilder && (
        <ReportBuilder
          onClose={() => {
            setShowBuilder(false);
            setSelectedReport(null);
          }}
          onGenerate={handleCreateReport}
          initialData={selectedReport}
        />
      )}

      {/* Report Preview Modal */}
      {showPreview && selectedReport && (
        <ReportPreview
          report={selectedReport}
          onClose={() => {
            setShowPreview(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}