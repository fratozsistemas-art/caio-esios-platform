import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function ABTestExport({ test, stats, events }) {
  const exportToCSV = () => {
    const headers = ['Variant', 'Impressions', 'Conversions', 'Conv. Rate (%)', 'Engagement', 'Eng. Rate (%)'];
    const rows = test.variants.map(variant => {
      const variantStats = stats[variant.id] || {};
      return [
        variant.name,
        variantStats.impressions || 0,
        variantStats.conversions || 0,
        variantStats.conversionRate || 0,
        variantStats.interactions || 0,
        variantStats.engagementRate || 0
      ];
    });

    const csvContent = [
      `# A/B Test Results - ${test.name}`,
      `# Test Type: ${test.test_type}`,
      `# Status: ${test.status}`,
      `# Created: ${new Date(test.created_date).toLocaleString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-${test.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    toast.success('CSV exported successfully');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`A/B Test Results: ${test.name}`, 20, 20);
    
    // Test Info
    doc.setFontSize(12);
    doc.text(`Type: ${test.test_type}`, 20, 35);
    doc.text(`Status: ${test.status}`, 20, 45);
    doc.text(`Created: ${new Date(test.created_date).toLocaleString()}`, 20, 55);
    
    if (test.description) {
      doc.setFontSize(10);
      doc.text(`Description: ${test.description}`, 20, 65);
    }

    // Results table
    doc.setFontSize(14);
    doc.text('Variant Performance', 20, 80);
    
    doc.setFontSize(10);
    let y = 90;
    
    // Headers
    doc.text('Variant', 20, y);
    doc.text('Impressions', 70, y);
    doc.text('Conversions', 110, y);
    doc.text('Conv. Rate', 150, y);
    
    y += 10;
    doc.line(20, y - 5, 190, y - 5);
    
    // Data rows
    test.variants.forEach(variant => {
      const variantStats = stats[variant.id] || {};
      doc.text(variant.name, 20, y);
      doc.text(String(variantStats.impressions || 0), 70, y);
      doc.text(String(variantStats.conversions || 0), 110, y);
      doc.text(`${variantStats.conversionRate || 0}%`, 150, y);
      y += 10;
    });

    // Summary
    y += 10;
    doc.setFontSize(12);
    doc.text('Summary', 20, y);
    y += 10;
    doc.setFontSize(10);
    
    const totalImpressions = Object.values(stats).reduce((sum, s) => sum + (s.impressions || 0), 0);
    const totalConversions = Object.values(stats).reduce((sum, s) => sum + (s.conversions || 0), 0);
    
    doc.text(`Total Impressions: ${totalImpressions}`, 20, y);
    y += 7;
    doc.text(`Total Conversions: ${totalConversions}`, 20, y);
    y += 7;
    doc.text(`Overall Conversion Rate: ${totalImpressions > 0 ? (totalConversions / totalImpressions * 100).toFixed(2) : 0}%`, 20, y);

    // Determine winner
    const sortedVariants = Object.entries(stats).sort(
      ([, a], [, b]) => parseFloat(b.conversionRate || 0) - parseFloat(a.conversionRate || 0)
    );
    
    if (sortedVariants.length > 0 && totalImpressions > 50) {
      const winner = sortedVariants[0];
      const winnerVariant = test.variants.find(v => v.id === winner[0]);
      
      y += 10;
      doc.setFontSize(12);
      doc.text(`Leading Variant: ${winnerVariant?.name}`, 20, y);
    }

    doc.save(`ab-test-${test.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    toast.success('PDF exported successfully');
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <FileText className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
}