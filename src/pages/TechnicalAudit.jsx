import React from "react";
import { FileText } from "lucide-react";
import CAIOvsESIOSAudit from "../components/reports/CAIOvsESIOSAudit";

export default function TechnicalAudit() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Technical Audit Report</h1>
          <p className="text-slate-400">CAIO vs ESIOS Platform Comparison</p>
        </div>
      </div>

      <CAIOvsESIOSAudit />
    </div>
  );
}