import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, entity_type = 'Analysis' } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Fetch CSV file
    const response = await fetch(file_url);
    const csvText = await response.text();

    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      records.push(record);
    }

    // Save as Analysis with CSV data
    const analysis = await base44.asServiceRole.entities.Analysis.create({
      title: `CSV Import - ${new Date().toLocaleDateString()}`,
      type: 'market',
      status: 'completed',
      data_file_url: file_url,
      results: {
        imported_records: records.length,
        headers: headers,
        sample_data: records.slice(0, 5)
      },
      completed_at: new Date().toISOString(),
      tags: ['csv_import', 'external_data']
    });

    return Response.json({
      success: true,
      analysis,
      records_imported: records.length,
      preview: records.slice(0, 10)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});