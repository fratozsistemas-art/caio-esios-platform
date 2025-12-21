import { jsPDF } from 'jspdf';

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (title, sections, filename) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text(title, 20, yPos);
  yPos += 15;

  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 15;

  // Sections
  sections.forEach(section => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.text(section.title, 20, yPos);
    yPos += 10;

    // Section content
    doc.setFontSize(10);
    if (Array.isArray(section.content)) {
      section.content.forEach(item => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const text = typeof item === 'object' ? JSON.stringify(item) : String(item);
        const lines = doc.splitTextToSize(text, 170);
        doc.text(lines, 25, yPos);
        yPos += lines.length * 5;
      });
    } else {
      const lines = doc.splitTextToSize(section.content, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5;
    }
    yPos += 5;
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};