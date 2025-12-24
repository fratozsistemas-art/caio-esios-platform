import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Calendar, Database, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COMMON_SERIES = [
  { code: '432', name: 'Taxa Selic', description: 'Taxa de juros básica da economia' },
  { code: '1', name: 'Dólar (venda)', description: 'Cotação do dólar americano' },
  { code: '12', name: 'IPCA', description: 'Índice de Preços ao Consumidor Amplo' },
  { code: '433', name: 'IGP-M', description: 'Índice Geral de Preços - Mercado' },
  { code: '4389', name: 'PIB', description: 'Produto Interno Bruto' }
];

export default function BCBDataPanel() {
  const [seriesCode, setSeriesCode] = useState('432');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('fetchBCBData', {
        seriesCode,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      if (response.data.success) {
        const formattedData = response.data.data.map(item => ({
          date: item.data,
          value: parseFloat(item.valor)
        }));
        setData(formattedData);
      } else {
        setError(response.data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectSeries = (code) => {
    setSeriesCode(code);
    setData(null);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-green-400" />
          Banco Central do Brasil (BCB)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Series Selection */}
        <div>
          <Label className="text-slate-400 text-xs mb-2 block">Séries Populares</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SERIES.map(series => (
              <Badge
                key={series.code}
                className={`cursor-pointer ${
                  seriesCode === series.code
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => selectSeries(series.code)}
              >
                {series.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Manual Series Input */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-slate-400 text-xs mb-1 block">Código da Série</Label>
            <Input
              type="text"
              value={seriesCode}
              onChange={(e) => setSeriesCode(e.target.value)}
              placeholder="ex: 432"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-400 text-xs mb-1 block">Data Inicial</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-400 text-xs mb-1 block">Data Final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        <Button
          onClick={fetchData}
          disabled={loading || !seriesCode}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Buscar Dados
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{data.length} registros</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {data[0].date} - {data[data.length - 1].date}
                </span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(value) => {
                      const [day, month] = value.split('/');
                      return `${day}/${month}`;
                    }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-xs text-slate-400">Último Valor</p>
                <p className="text-lg font-bold text-white">
                  {data[data.length - 1].value.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Média</p>
                <p className="text-lg font-bold text-white">
                  {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Variação</p>
                <p className={`text-lg font-bold ${
                  data[data.length - 1].value > data[0].value
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {((data[data.length - 1].value - data[0].value) / data[0].value * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-slate-300">
            <strong>Códigos úteis:</strong> 432 (Selic), 1 (Dólar), 12 (IPCA), 433 (IGP-M), 4389 (PIB)
          </p>
          <a
            href="https://www3.bcb.gov.br/sgspub/localizarseries/localizarSeries.do?method=prepararTelaLocalizarSeries"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 block"
          >
            Buscar mais códigos no site do BCB →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}