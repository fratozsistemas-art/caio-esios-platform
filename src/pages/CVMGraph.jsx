import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Network, Search, Building2, TrendingUp, Users, 
  Download, Loader2, Server, Eye, Filter, Maximize2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import CVMGraphVisualization from "@/components/graph/CVMGraphVisualization";

export default function CVMGraph() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [showVisualization, setShowVisualization] = useState(false);
  const [graphDepth, setGraphDepth] = useState(2);

  // Query companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['cvmCompanies'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('queryNeo4j', {
        query: `
          MATCH (c:Company)
          OPTIONAL MATCH (c)-[r]-()
          WITH c, count(r) as connections
          RETURN c, connections
          ORDER BY c.name
          LIMIT 200
        `
      });
      return data.records.map(r => ({
        ...r.c,
        properties: { ...r.c.properties, connections: r.connections }
      }));
    },
    initialData: [],
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('importCVMData');
      return data;
    },
    onSuccess: (data) => {
      toast.success(`✅ Imported ${data.nodeCount} nodes and ${data.relationshipCount} relationships`);
      queryClient.invalidateQueries({ queryKey: ['cvmCompanies'] });
    },
    onError: (error) => {
      toast.error(`❌ Import failed: ${error.message}`);
    }
  });

  // Get company details
  const { data: companyDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['companyDetails', selectedCompany?.properties?.id],
    queryFn: async () => {
      if (!selectedCompany?.properties?.id) return null;
      
      const { data } = await base44.functions.invoke('queryNeo4j', {
        query: `
          MATCH (c:Company {id: $companyId})
          OPTIONAL MATCH (c)-[r]-(related)
          RETURN c, collect({relationship: type(r), node: related}) as connections
        `,
        params: { companyId: selectedCompany.properties.id }
      });
      return data.records[0];
    },
    enabled: !!selectedCompany?.properties?.id
  });

  // Query graph data for visualization
  const { data: graphData, isLoading: graphLoading, refetch: refetchGraph } = useQuery({
    queryKey: ['cvmGraph', graphDepth, sectorFilter],
    queryFn: async () => {
      const sectorCondition = sectorFilter !== 'all' ? `WHERE c.sector = '${sectorFilter}'` : '';
      
      const { data } = await base44.functions.invoke('queryNeo4j', {
        query: `
          MATCH (c:Company)
          ${sectorCondition}
          WITH c LIMIT 100
          OPTIONAL MATCH path = (c)-[r*1..${graphDepth}]-(related:Company)
          WITH c, collect(distinct related) as relatedNodes, collect(distinct r) as relationships
          UNWIND relatedNodes as rn
          OPTIONAL MATCH (rn)-[rr]-(c)
          RETURN collect(distinct c) + collect(distinct rn) as nodes,
                 collect(distinct rr) as edges
        `
      });

      const nodes = data.records[0]?.nodes || [];
      const edges = data.records[0]?.edges || [];

      return {
        nodes: nodes.map(n => ({
          id: n.id,
          labels: n.labels,
          properties: n.properties
        })),
        edges: edges.filter(e => e).map(e => ({
          source: e.start,
          target: e.end,
          type: e.type,
          properties: e.properties
        }))
      };
    },
    enabled: showVisualization,
    initialData: { nodes: [], edges: [] }
  });

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = !searchQuery || 
      c.properties?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'all' || c.properties?.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const sectors = [...new Set(companies.map(c => c.properties?.sector).filter(Boolean))];

  const stats = {
    total: companies.length,
    sectors: sectors.length,
    avgConnections: Math.round(companies.reduce((sum, c) => sum + (c.properties?.connections || 0), 0) / (companies.length || 1))
  };

  const handleVisualize = () => {
    setShowVisualization(true);
    refetchGraph();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="w-10 h-10 text-blue-400" />
            CVM Knowledge Graph
          </h1>
          <p className="text-slate-400">
            Brazilian public companies from CVM data via Neo4j
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleVisualize}
            disabled={graphLoading || companies.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {graphLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Visualize Graph
              </>
            )}
          </Button>
          <Button
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import CVM Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Companies</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Sectors</p>
                <p className="text-3xl font-bold text-green-400">{stats.sectors}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Avg Connections</p>
                <p className="text-3xl font-bold text-purple-400">{stats.avgConnections}</p>
              </div>
              <Users className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.sort().map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={graphDepth.toString()} onValueChange={(v) => setGraphDepth(Number(v))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Graph Depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Level</SelectItem>
                <SelectItem value="2">2 Levels</SelectItem>
                <SelectItem value="3">3 Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Companies List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Companies</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No companies found</p>
                <Button
                  onClick={() => importMutation.mutate()}
                  variant="outline"
                  className="border-white/20 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import CVM Data
                </Button>
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <Card
                  key={company.id}
                  className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer ${
                    selectedCompany?.id === company.id ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {company.properties?.name || 'Unknown'}
                        </h3>
                        {company.properties?.sector && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs mt-1">
                            {company.properties.sector}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="border-white/20 text-slate-300">
                        {company.properties?.connections || 0} <Network className="w-3 h-3 ml-1" />
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {!selectedCompany ? (
              <div className="text-center py-16">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a company to view details</p>
              </div>
            ) : detailsLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Company Info */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {selectedCompany.properties?.name}
                  </h3>
                  
                  {Object.entries(selectedCompany.properties || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{value?.toString() || 'N/A'}</span>
                    </div>
                  ))}
                </div>

                {/* Connections */}
                {companyDetails?.connections && companyDetails.connections.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Connections</h4>
                    <div className="space-y-2">
                      {companyDetails.connections.map((conn, idx) => (
                        conn.node && (
                          <Card key={idx} className="bg-white/5 border-white/10">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white text-sm font-medium">
                                    {conn.node.properties?.name || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-slate-400">{conn.relationship}</p>
                                </div>
                                <Badge variant="outline" className="border-white/20 text-slate-300 text-xs">
                                  {conn.node.labels?.[0] || 'Node'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graph Visualization Modal */}
      {showVisualization && graphData && (
        <CVMGraphVisualization
          graphData={graphData}
          onNodeClick={(node) => {
            const company = companies.find(c => c.id === node.id);
            if (company) setSelectedCompany(company);
          }}
          onClose={() => setShowVisualization(false)}
        />
      )}
    </div>
  );
}