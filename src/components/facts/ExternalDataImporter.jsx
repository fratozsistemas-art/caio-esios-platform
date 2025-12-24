import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Upload, Database, TrendingUp, Newspaper, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ExternalDataImporter({ onImportComplete }) {
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [stockSymbol, setStockSymbol] = useState('');
  const [newsQuery, setNewsQuery] = useState('');
  const [importResults, setImportResults] = useState(null);

  const handleCSVImport = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setLoading(true);
    try {
      // Upload file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file: csvFile });

      // Extract data from CSV
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            facts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic_id: { type: "string" },
                  topic_label: { type: "string" },
                  dimension: { type: "string" },
                  fact_type: { type: "string" },
                  summary: { type: "string" },
                  detail: { type: "string" },
                  status: { type: "string" },
                  confidence: { type: "number" },
                  source_type: { type: "string" },
                  source_ref: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extractResult.status === 'success' && extractResult.output?.facts) {
        // Bulk create facts
        const created = await base44.entities.StrategicFact.bulkCreate(
          extractResult.output.facts.map(f => ({
            ...f,
            tags: ['imported', 'csv']
          }))
        );

        setImportResults({
          type: 'csv',
          count: created.length,
          success: true
        });

        toast.success(`Imported ${created.length} facts from CSV`);
        onImportComplete?.();
      } else {
        throw new Error('Failed to extract data from CSV');
      }
    } catch (error) {
      toast.error(error.message);
      setImportResults({ type: 'csv', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialDataImport = async () => {
    if (!stockSymbol) {
      toast.error('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    try {
      const stockData = await base44.functions.invoke('fetchStockData', { symbol: stockSymbol });
      
      if (!stockData.data) {
        throw new Error('No financial data available');
      }

      const facts = [];
      const data = stockData.data;

      // Create facts from financial data
      if (data.quote) {
        facts.push({
          topic_id: `stock_${stockSymbol.toLowerCase()}`,
          topic_label: `${stockSymbol} Financial Metrics`,
          dimension: 'financial_metrics',
          fact_type: 'metric',
          summary: `Current price: $${data.quote.c}, Change: ${data.quote.dp}%`,
          detail: `Stock ${stockSymbol} is trading at $${data.quote.c} with ${data.quote.dp}% change. High: $${data.quote.h}, Low: $${data.quote.l}, Previous close: $${data.quote.pc}`,
          status: 'confirmed_external',
          confidence: 0.95,
          source_type: 'aggregated_statistics',
          source_ref: 'Finnhub API',
          tags: ['finance', 'stock', stockSymbol.toLowerCase()]
        });
      }

      if (data.profile) {
        facts.push({
          topic_id: `stock_${stockSymbol.toLowerCase()}`,
          topic_label: `${data.profile.name}`,
          dimension: 'company_info',
          fact_type: 'institutional_structure',
          summary: `${data.profile.name} - ${data.profile.finnhubIndustry}`,
          detail: `Market Cap: $${(data.profile.marketCapitalization / 1000).toFixed(2)}B, Industry: ${data.profile.finnhubIndustry}`,
          status: 'confirmed_external',
          confidence: 0.98,
          source_type: 'official_government_doc',
          source_ref: data.profile.weburl,
          tags: ['company', 'profile', stockSymbol.toLowerCase()]
        });
      }

      const created = await base44.entities.StrategicFact.bulkCreate(facts);
      
      setImportResults({
        type: 'financial',
        count: created.length,
        success: true,
        symbol: stockSymbol
      });

      toast.success(`Imported ${created.length} financial facts for ${stockSymbol}`);
      onImportComplete?.();
    } catch (error) {
      toast.error(error.message);
      setImportResults({ type: 'financial', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleNewsImport = async () => {
    if (!newsQuery) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const newsData = await base44.functions.invoke('fetchMarketNews', { 
        query: newsQuery,
        category: 'general'
      });

      if (!newsData.data?.articles || newsData.data.articles.length === 0) {
        throw new Error('No news articles found');
      }

      const facts = newsData.data.articles.slice(0, 10).map((article, idx) => ({
        topic_id: `news_${newsQuery.toLowerCase().replace(/\s+/g, '_')}`,
        topic_label: `${newsQuery} - News Analysis`,
        dimension: 'news_events',
        fact_type: 'event_outcome',
        summary: article.title,
        detail: article.description || article.title,
        status: 'confirmed_external',
        confidence: 0.85,
        source_type: 'reputable_media',
        source_ref: article.url,
        start_date: article.publishedAt?.split('T')[0],
        tags: ['news', 'media', ...newsQuery.toLowerCase().split(' ')]
      }));

      const created = await base44.entities.StrategicFact.bulkCreate(facts);
      
      setImportResults({
        type: 'news',
        count: created.length,
        success: true,
        query: newsQuery
      });

      toast.success(`Imported ${created.length} news-based facts`);
      onImportComplete?.();
    } catch (error) {
      toast.error(error.message);
      setImportResults({ type: 'news', success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5" />
          Import External Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="csv">
              <Upload className="w-4 h-4 mr-2" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="financial">
              <TrendingUp className="w-4 h-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="news">
              <Newspaper className="w-4 h-4 mr-2" />
              News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div>
              <Label htmlFor="csv-file" className="text-slate-300">Upload CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
              <p className="text-xs text-slate-400 mt-2">
                CSV should contain columns: topic_id, topic_label, dimension, fact_type, summary, detail, status, confidence, source_type, source_ref
              </p>
            </div>
            <Button 
              onClick={handleCSVImport} 
              disabled={loading || !csvFile}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Import CSV
            </Button>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div>
              <Label htmlFor="stock-symbol" className="text-slate-300">Stock Symbol</Label>
              <Input
                id="stock-symbol"
                type="text"
                placeholder="e.g., AAPL, GOOGL, MSFT"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>
            <Button 
              onClick={handleFinancialDataImport} 
              disabled={loading || !stockSymbol}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              Import Financial Data
            </Button>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <div>
              <Label htmlFor="news-query" className="text-slate-300">Search Query</Label>
              <Input
                id="news-query"
                type="text"
                placeholder="e.g., AI regulation, trade policy, climate change"
                value={newsQuery}
                onChange={(e) => setNewsQuery(e.target.value)}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>
            <Button 
              onClick={handleNewsImport} 
              disabled={loading || !newsQuery}
              className="w-full"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Newspaper className="w-4 h-4 mr-2" />}
              Import News Data
            </Button>
          </TabsContent>
        </Tabs>

        {importResults && (
          <div className={`mt-4 p-4 rounded-lg border ${
            importResults.success 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {importResults.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <div>
                <p className={importResults.success ? 'text-green-400' : 'text-red-400'}>
                  {importResults.success 
                    ? `Successfully imported ${importResults.count} facts`
                    : `Import failed: ${importResults.error}`
                  }
                </p>
                {importResults.symbol && (
                  <p className="text-xs text-slate-400 mt-1">Symbol: {importResults.symbol}</p>
                )}
                {importResults.query && (
                  <p className="text-xs text-slate-400 mt-1">Query: {importResults.query}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}