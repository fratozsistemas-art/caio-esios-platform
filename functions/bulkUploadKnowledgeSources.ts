import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_urls, category = 'general', tags = [] } = await req.json();

        if (!file_urls || !Array.isArray(file_urls) || file_urls.length === 0) {
            return Response.json({ error: 'file_urls array is required' }, { status: 400 });
        }

        const results = {
            total: file_urls.length,
            success: 0,
            failed: 0,
            sources: []
        };

        // Processar cada arquivo
        for (const file_url of file_urls) {
            try {
                // Extrair nome do arquivo da URL
                const fileName = file_url.split('/').pop().split('?')[0];
                const fileExtension = fileName.split('.').pop().toLowerCase();

                // Criar KnowledgeSource
                const source = await base44.entities.KnowledgeSource.create({
                    title: fileName.replace(/\.[^/.]+$/, ''), // Remove extensão
                    source_type: fileExtension === 'pdf' ? 'document' : 
                                fileExtension === 'url' ? 'web' : 'document',
                    url: file_url,
                    category: category,
                    tags: tags,
                    status: 'processing',
                    metadata: {
                        uploaded_by: user.email,
                        file_name: fileName,
                        file_extension: fileExtension
                    }
                });

                // Indexar documento (chamada assíncrona)
                try {
                    await base44.functions.invoke('indexDocument', {
                        source_id: source.id,
                        file_url: file_url
                    });

                    await base44.entities.KnowledgeSource.update(source.id, {
                        status: 'indexed'
                    });

                } catch (indexError) {
                    console.error(`Indexing error for ${fileName}:`, indexError);
                    await base44.entities.KnowledgeSource.update(source.id, {
                        status: 'failed',
                        metadata: {
                            ...source.metadata,
                            error: indexError.message
                        }
                    });
                }

                results.success++;
                results.sources.push({
                    id: source.id,
                    title: source.title,
                    status: 'processing'
                });

            } catch (error) {
                results.failed++;
                results.sources.push({
                    file_url: file_url,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            results: results,
            message: `Uploaded ${results.success} of ${results.total} files`
        });

    } catch (error) {
        console.error('Bulk upload knowledge sources error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});