import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, FileSpreadsheet, Newspaper } from "lucide-react";
import MarketDataPanel from "../components/dataingestion/MarketDataPanel";
import CSVImportPanel from "../components/dataingestion/CSVImportPanel";
import StockDataWidget from "../components/dataingestion/StockDataWidget";

export default function MarketDataHub() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-blue-400" />
          Market Data Hub
        </h1>
        <p className="text-slate-400">
          Import and analyze external market data from multiple sources
        </p>
      </div>

      <Tabs defaultValue="news" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="news">
            <Newspaper className="w-4 h-4 mr-2" />
            Market News
          </TabsTrigger>
          <TabsTrigger value="stocks">
            <TrendingUp className="w-4 h-4 mr-2" />
            Stock Data
          </TabsTrigger>
          <TabsTrigger value="import">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            CSV Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="mt-6">
          <MarketDataPanel />
        </TabsContent>

        <TabsContent value="stocks" className="mt-6">
          <StockDataWidget />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <CSVImportPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}