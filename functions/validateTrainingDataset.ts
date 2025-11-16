import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url, agent_type } = await req.json();

        // Fetch the file
        const fileResponse = await fetch(file_url);
        const fileText = await fileResponse.text();

        let records = [];
        let format = 'json';

        // Parse based on extension
        if (file_url.endsWith('.jsonl')) {
            format = 'jsonl';
            records = fileText.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
        } else if (file_url.endsWith('.csv')) {
            format = 'csv';
            const lines = fileText.split('\n');
            const headers = lines[0].split(',');
            records = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',');
                const obj = {};
                headers.forEach((header, idx) => {
                    obj[header.trim()] = values[idx]?.trim();
                });
                return obj;
            });
        } else {
            records = JSON.parse(fileText);
            if (!Array.isArray(records)) {
                records = [records];
            }
        }

        // Validation rules
        const validation_results = {
            total_records: records.length,
            valid_records: 0,
            invalid_records: 0,
            errors: []
        };

        const requiredFields = ['input', 'output'];
        
        records.forEach((record, idx) => {
            const missingFields = requiredFields.filter(field => !record[field]);
            if (missingFields.length > 0) {
                validation_results.invalid_records++;
                validation_results.errors.push({
                    record_index: idx,
                    error: `Missing fields: ${missingFields.join(', ')}`
                });
            } else {
                validation_results.valid_records++;
            }
        });

        // Check if enough valid records
        if (validation_results.valid_records < 10) {
            validation_results.errors.push({
                error: 'Dataset needs at least 10 valid training examples'
            });
        }

        return Response.json({
            success: validation_results.valid_records >= 10,
            records_count: validation_results.valid_records,
            validation_results
        });

    } catch (error) {
        console.error('Dataset validation error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});