import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportPreview({ report, onClose }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0B0F1A] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{report.title}</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {report.format?.toUpperCase()}
                </Badge>
                {report.template && (
                  <Badge variant="outline" className="border-white/20 text-slate-400">
                    {report.template}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {report.file_url && (
                <Button
                  onClick={() => window.open(report.file_url, '_blank')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {report.format === 'pdf' && report.file_url ? (
              <iframe
                src={report.file_url}
                className="w-full h-[600px] rounded-lg"
                title="Report Preview"
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Preview not available for this format</p>
                {report.file_url && (
                  <Button
                    onClick={() => window.open(report.file_url, '_blank')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}