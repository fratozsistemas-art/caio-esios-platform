import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url } = await req.json();

        if (!file_url) {
            return Response.json({ error: 'file_url is required' }, { status: 400 });
        }

        // Schema esperado para dados CVM
        const cvmSchema = {
            type: "object",
            properties: {
                cnpj: { type: "string" },
                razao_social: { type: "string" },
                nome_fantasia: { type: "string" },
                setor: { type: "string" },
                capital_social: { type: "number" },
                data_registro: { type: "string" },
                situacao: { type: "string" },
                uf: { type: "string" },
                municipio: { type: "string" }
            },
            required: ["cnpj", "razao_social"]
        };

        // Extrair dados do arquivo
        const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url: file_url,
            json_schema: cvmSchema
        });

        if (extractionResult.status === "error") {
            return Response.json({ 
                success: false,
                error: "File extraction failed: " + extractionResult.details 
            }, { status: 400 });
        }

        const dataToProcess = Array.isArray(extractionResult.output) 
            ? extractionResult.output 
            : [extractionResult.output];

        const results = {
            total: dataToProcess.length,
            success: 0,
            failed: 0,
            updated: 0,
            created: 0,
            errors: []
        };

        // Processar cada empresa
        for (let i = 0; i < dataToProcess.length; i++) {
            const item = dataToProcess[i];
            
            try {
                // Validações
                if (!item.cnpj || item.cnpj.length < 14) {
                    throw new Error(`Invalid CNPJ: ${item.cnpj}`);
                }

                // Normalizar CNPJ (remover caracteres especiais)
                const cnpjClean = item.cnpj.replace(/[^\d]/g, '');

                // Verificar se empresa já existe
                const existingCompanies = await base44.entities.Company.filter({ 
                    name: item.razao_social 
                });

                const companyData = {
                    name: item.razao_social,
                    industry: item.setor || 'Unknown',
                    description: item.nome_fantasia || item.razao_social,
                    metadata: {
                        cnpj: cnpjClean,
                        capital_social: item.capital_social,
                        data_registro_cvm: item.data_registro,
                        situacao_cvm: item.situacao,
                        uf: item.uf,
                        municipio: item.municipio,
                        source: 'CVM',
                        imported_at: new Date().toISOString()
                    }
                };

                if (existingCompanies.length > 0) {
                    // Atualizar empresa existente
                    await base44.entities.Company.update(existingCompanies[0].id, companyData);
                    results.updated++;
                } else {
                    // Criar nova empresa
                    await base44.entities.Company.create(companyData);
                    results.created++;
                }

                results.success++;

            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: i + 1,
                    data: item,
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            results: results,
            message: `Processed ${results.total} records: ${results.created} created, ${results.updated} updated, ${results.failed} failed`
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return Response.json({ 
            success: false,
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});