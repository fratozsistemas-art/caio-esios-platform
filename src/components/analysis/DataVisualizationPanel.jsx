import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { 
  TrendingUp, BarChart3, Sparkles, Loader2, 
  LineChart as LineIcon, Grid3X3, CircleDot, PieChartIcon,
  Table, FileSpreadsheet
} from "lucide-react";

const CHART_COLORS = ["#00D4FF", "#FFB800", "#A855F7", "#22C55E", "#F97316", "#EC4899"];

export default function DataVisualizationPanel({ data, onRunAIAnalysis, isAnalyzing }) {
  const [selectedFile, setSelectedFile] = useState(0);
  const [chartType, setChartType] = useState("line");
  const [xAxis, setXAxis] = useState("");
  const [yAxes, setYAxes] = useState([]);
  const [activeView, setActiveView] = useState("chart");

  const currentFile = data?.files?.[selectedFile];

  const numericColumns = useMemo(() => {
    if (!currentFile?.headers || !currentFile?.rows) return [];
    
    return currentFile.headers.filter((header, idx) => {
      const sampleValues = currentFile.rows.slice(0, 10).map(row => row[idx]);
      return sampleValues.some(val => !isNaN(parseFloat(val)));
    });
  }, [currentFile]);

  const chartData = useMemo(() => {
    if (!currentFile?.rows || !xAxis) return [];

    const xIndex = currentFile.headers.indexOf(xAxis);
    const yIndices = yAxes.map(y => currentFile.headers.indexOf(y));

    return currentFile.rows.slice(0, 100).map((row, idx) => {
      const point = { name: row[xIndex] || `Row ${idx + 1}` };
      yAxes.forEach((y, i) => {
        point[y] = parseFloat(row[yIndices[i]]) || 0;
      });
      return point;
    });
  }, [currentFile, xAxis, yAxes]);

  const heatmapData = useMemo(() => {
    if (!currentFile?.rows || numericColumns.length < 2) return [];
    
    // Generate correlation matrix
    const correlations = [];
    numericColumns.forEach((col1, i) => {
      numericColumns.forEach((col2, j) => {
        if (i <= j) {
          const idx1 = currentFile.headers.indexOf(col1);
          const idx2 = currentFile.headers.indexOf(col2);
          const values1 = currentFile.rows.map(r => parseFloat(r[idx1]) || 0);
          const values2 = currentFile.rows.map(r => parseFloat(r[idx2]) || 0);
          
          // Simple correlation calculation
          const n = values1.length;
          const sum1 = values1.reduce((a, b) => a + b, 0);
          const sum2 = values2.reduce((a, b) => a + b, 0);
          const sum1Sq = values1.reduce((a, b) => a + b * b, 0);
          const sum2Sq = values2.reduce((a, b) => a + b * b, 0);
          const pSum = values1.reduce((a, b, i) => a + b * values2[i], 0);
          
          const num = pSum - (sum1 * sum2 / n);
          const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
          const corr = den === 0 ? 0 : num / den;
          
          correlations.push({ x: col1, y: col2, value: corr });
          if (i !== j) {
            correlations.push({ x: col2, y: col1, value: corr });
          }
        }
      });
    });
    
    return correlations;
  }, [currentFile, numericColumns]);

  const toggleYAxis = (column) => {
    if (yAxes.includes(column)) {
      setYAxes(yAxes.filter(y => y !== column));
    } else {
      setYAxes([...yAxes, column].slice(0, 4)); // Max 4 y-axes
    }
  };

  const renderChart = () => {
    if (chartData.length === 0 || yAxes.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Selecione os eixos para visualizar</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              {yAxes.map((y, i) => (
                <Bar key={y} dataKey={y} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              {yAxes.map((y, i) => (
                <Area 
                  key={y} 
                  type="monotone" 
                  dataKey={y} 
                  fill={CHART_COLORS[i % CHART_COLORS.length]} 
                  fillOpacity={0.3}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "scatter":
        if (yAxes.length < 2) {
          return (
            <div className="h-80 flex items-center justify-center text-slate-400">
              <p>Selecione pelo menos 2 variáveis para dispersão</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey={yAxes[0]} 
                name={yAxes[0]} 
                stroke="#94A3B8" 
                tick={{ fill: '#94A3B8' }}
              />
              <YAxis 
                dataKey={yAxes[1]} 
                name={yAxes[1]} 
                stroke="#94A3B8" 
                tick={{ fill: '#94A3B8' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Scatter data={chartData} fill="#00D4FF" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default: // line
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              {yAxes.map((y, i) => (
                <Line 
                  key={y} 
                  type="monotone" 
                  dataKey={y} 
                  stroke={CHART_COLORS[i % CHART_COLORS.length]} 
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[i % CHART_COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderHeatmap = () => {
    if (heatmapData.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center text-slate-400">
          <p>Dados insuficientes para mapa de calor</p>
        </div>
      );
    }

    const uniqueLabels = [...new Set(heatmapData.map(d => d.x))];
    const cellSize = Math.min(50, 400 / uniqueLabels.length);

    return (
      <div className="overflow-auto">
        <div className="inline-block">
          {/* Header row */}
          <div className="flex">
            <div style={{ width: 100 }} />
            {uniqueLabels.map(label => (
              <div 
                key={label} 
                style={{ width: cellSize, height: 80 }}
                className="text-xs text-slate-400 flex items-end justify-center pb-2 -rotate-45 origin-bottom-left"
              >
                {label.slice(0, 10)}
              </div>
            ))}
          </div>
          {/* Data rows */}
          {uniqueLabels.map(rowLabel => (
            <div key={rowLabel} className="flex">
              <div style={{ width: 100 }} className="text-xs text-slate-400 flex items-center pr-2 truncate">
                {rowLabel}
              </div>
              {uniqueLabels.map(colLabel => {
                const cell = heatmapData.find(d => d.x === rowLabel && d.y === colLabel);
                const value = cell?.value || 0;
                const intensity = Math.abs(value);
                const color = value >= 0 
                  ? `rgba(0, 212, 255, ${intensity})` 
                  : `rgba(239, 68, 68, ${intensity})`;
                
                return (
                  <div
                    key={`${rowLabel}-${colLabel}`}
                    style={{ 
                      width: cellSize, 
                      height: cellSize,
                      backgroundColor: color
                    }}
                    className="border border-slate-800 flex items-center justify-center text-xs text-white cursor-pointer hover:opacity-80"
                    title={`${rowLabel} × ${colLabel}: ${value.toFixed(2)}`}
                  >
                    {value.toFixed(1)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    if (!currentFile?.rows) return null;

    return (
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 sticky top-0">
            <tr>
              {currentFile.headers.map((header, idx) => (
                <th key={idx} className="px-4 py-2 text-left text-slate-300 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentFile.rows.slice(0, 50).map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-800 hover:bg-slate-800/50">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-2 text-slate-400">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {currentFile.rows.length > 50 && (
          <p className="text-center text-slate-500 py-2 text-sm">
            Mostrando 50 de {currentFile.rows.length} linhas
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* File Selector & AI Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedFile.toString()} onValueChange={(v) => setSelectedFile(parseInt(v))}>
            <SelectTrigger className="w-64 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Selecionar arquivo" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {data?.files?.map((file, idx) => (
                <SelectItem key={idx} value={idx.toString()} className="text-white">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-400" />
                    {file.fileName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {currentFile && (
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">
              {currentFile.rows?.length || 0} linhas • {currentFile.headers?.length || 0} colunas
            </Badge>
          )}
        </div>

        <Button
          onClick={onRunAIAnalysis}
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Análise de IA
            </>
          )}
        </Button>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="chart" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <LineIcon className="w-4 h-4 mr-2" />
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Mapa de Calor
          </TabsTrigger>
          <TabsTrigger value="table" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
            <Table className="w-4 h-4 mr-2" />
            Tabela
          </TabsTrigger>
        </TabsList>

        {/* Chart View */}
        <TabsContent value="chart">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
                  Visualização de Dados
                </CardTitle>
                
                {/* Chart Type Selector */}
                <div className="flex gap-2">
                  {[
                    { type: "line", icon: LineIcon, label: "Linha" },
                    { type: "bar", icon: BarChart3, label: "Barra" },
                    { type: "area", icon: TrendingUp, label: "Área" },
                    { type: "scatter", icon: CircleDot, label: "Dispersão" }
                  ].map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant={chartType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType(type)}
                      className={chartType === type 
                        ? "bg-[#00D4FF] text-[#0A1628]" 
                        : "border-white/20 text-slate-300 hover:bg-white/10"
                      }
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Axis Selection */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Eixo X (Categoria)</label>
                  <Select value={xAxis} onValueChange={setXAxis}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecionar coluna" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {currentFile?.headers?.map((header) => (
                        <SelectItem key={header} value={header} className="text-white">
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Eixo Y (Valores) - até 4</label>
                  <div className="flex flex-wrap gap-2">
                    {numericColumns.map((col) => (
                      <Badge
                        key={col}
                        className={`cursor-pointer transition-all ${
                          yAxes.includes(col)
                            ? "bg-[#00D4FF] text-[#0A1628]"
                            : "bg-white/10 text-slate-300 hover:bg-white/20"
                        }`}
                        onClick={() => toggleYAxis(col)}
                      >
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart */}
              {renderChart()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heatmap View */}
        <TabsContent value="heatmap">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-purple-400" />
                Matriz de Correlação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderHeatmap()}
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(239, 68, 68, 0.8)" }} />
                  Correlação Negativa
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-700" />
                  Sem Correlação
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(0, 212, 255, 0.8)" }} />
                  Correlação Positiva
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-green-400" />
                Dados Brutos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderDataTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}