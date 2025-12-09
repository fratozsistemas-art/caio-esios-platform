import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, FileText, Upload, Search, FolderOpen, Tag,
  Calendar, Download, ExternalLink, Briefcase, Code, Lightbulb,
  Image as ImageIcon, Users, Archive, Plus, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const VERSION_CATEGORIES = [
  { id: 'business_model', label: 'Business Model & IR', icon: Briefcase, color: 'purple' },
  { id: 'website_versions', label: 'Website Versions', icon: Code, color: 'cyan' },
  { id: 'app_architecture', label: 'App Architecture', icon: FolderOpen, color: 'blue' },
  { id: 'conceptual_docs', label: 'Conceptual Documents & Whitepapers', icon: FileText, color: 'green' },
  { id: 'assets', label: 'Assets', icon: ImageIcon, color: 'yellow' },
  { id: 'use_cases', label: 'Use Cases', icon: Lightbulb, color: 'orange' }
];

export default function VersionWiki() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all wiki documents
  const { data: wikiDocs = [], isLoading } = useQuery({
    queryKey: ['wikiDocs'],
    queryFn: () => base44.entities.WikiDocument?.list('-version_number', 100) || Promise.resolve([]),
  });

  // Get unique versions
  const versions = [...new Set(wikiDocs.map(doc => doc.version))].sort((a, b) => {
    const aNum = parseFloat(a.replace('v', ''));
    const bNum = parseFloat(b.replace('v', ''));
    return bNum - aNum;
  });

  // Filter documents
  const filteredDocs = wikiDocs.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVersion = selectedVersion === "all" || doc.version === selectedVersion;
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesVersion && matchesCategory;
  });

  // Group by version and category
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.version]) acc[doc.version] = {};
    if (!acc[doc.version][doc.category]) acc[doc.version][doc.category] = [];
    acc[doc.version][doc.category].push(doc);
    return acc;
  }, {});

  const handleFileUpload = async (event, version, category) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        await base44.entities.WikiDocument.create({
          title: file.name,
          version: version,
          category: category,
          file_url: file_url,
          file_type: file.type,
          description: `Uploaded on ${new Date().toLocaleDateString()}`
        });
      }
      
      queryClient.invalidateQueries(['wikiDocs']);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          Version Wiki & Documentation
        </h1>
        <p className="text-slate-400">
          Incremental documentation across all versions, whitepapers, and assets
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="bg-[#1A1D29] border-[#00D4FF]/20">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="pl-10 bg-[#0A2540] border-[#00D4FF]/30 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-slate-500 mb-2">Version</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedVersion === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVersion("all")}
                  className={selectedVersion === "all" ? "bg-cyan-600" : "border-white/10 text-slate-400"}
                >
                  All
                </Button>
                {versions.map(version => (
                  <Button
                    key={version}
                    variant={selectedVersion === version ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVersion(version)}
                    className={selectedVersion === version ? "bg-cyan-600" : "border-white/10 text-slate-400"}
                  >
                    {version}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-slate-500 mb-2">Category</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-purple-600" : "border-white/10 text-slate-400"}
                >
                  All
                </Button>
                {VERSION_CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? "bg-purple-600" : "border-white/10 text-slate-400"}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid by Version */}
      <div className="space-y-8">
        {Object.keys(groupedDocs).length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <Archive className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Documents Found</h3>
              <p className="text-slate-400 mb-6">Upload documents to get started</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedDocs).map(([version, categorizedDocs]) => (
            <div key={version}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-lg px-4 py-2">
                  {version}
                </Badge>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VERSION_CATEGORIES.map(category => {
                  const docs = categorizedDocs[category.id] || [];
                  const Icon = category.icon;
                  
                  return (
                    <Card key={category.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <Icon className={`w-4 h-4 text-${category.color}-400`} />
                          {category.label}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {docs.length} document{docs.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {docs.length > 0 ? (
                          docs.slice(0, 3).map((doc) => (
                            <div key={doc.id} className="p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white truncate font-medium">{doc.title}</p>
                                  {doc.description && (
                                    <p className="text-xs text-slate-500 truncate">{doc.description}</p>
                                  )}
                                </div>
                                {doc.file_url && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(doc.file_url, '_blank')}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-xs text-slate-500 mb-3">No documents yet</p>
                            <label htmlFor={`upload-${version}-${category.id}`}>
                              <input
                                id={`upload-${version}-${category.id}`}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, version, category.id)}
                                disabled={uploadingFiles}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-slate-400 hover:bg-white/5 text-xs"
                                disabled={uploadingFiles}
                                onClick={(e) => {
                                  e.preventDefault();
                                  document.getElementById(`upload-${version}-${category.id}`).click();
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Upload
                              </Button>
                            </label>
                          </div>
                        )}
                        {docs.length > 3 && (
                          <p className="text-xs text-cyan-400 text-center pt-2">
                            +{docs.length - 3} more
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload New Version */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Add New Version Documentation
          </CardTitle>
          <CardDescription>
            Upload multiple files for a specific version and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Use the upload buttons in each category card to add documents to existing versions, or create a new version below.
          </p>
          <Button className="bg-cyan-600 hover:bg-cyan-700" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create New Version (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}