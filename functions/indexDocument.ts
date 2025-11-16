import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, company_id, file_name } = await req.json();
    
    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Extract text from file
    const extractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all text content from this document and split it into logical chunks (max 500 words each). 
      Return structured chunks with page numbers if applicable.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          chunks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                content: { type: "string" },
                page_number: { type: "number" },
                section: { type: "string" }
              }
            }
          },
          document_type: { type: "string" },
          total_pages: { type: "number" }
        }
      }
    });

    const documentId = crypto.randomUUID();
    let chunksCreated = 0;

    // Create embeddings for each chunk
    for (let i = 0; i < extractionResult.chunks.length; i++) {
      const chunk = extractionResult.chunks[i];
      
      await base44.entities.DocumentEmbedding.create({
        document_id: documentId,
        company_id: company_id || null,
        file_name: file_name || 'Untitled Document',
        file_url: file_url,
        content_chunk: chunk.content,
        chunk_index: i,
        metadata: {
          page_number: chunk.page_number,
          section: chunk.section,
          document_type: extractionResult.document_type
        }
      });
      
      chunksCreated++;
    }

    return Response.json({ 
      success: true,
      document_id: documentId,
      chunks_created: chunksCreated,
      document_type: extractionResult.document_type,
      message: 'Document indexed successfully for RAG search'
    });

  } catch (error) {
    console.error('Error indexing document:', error);
    return Response.json({ 
      error: error.message || 'Failed to index document' 
    }, { status: 500 });
  }
});