import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, company_id, top_k = 5 } = await req.json();
    
    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get all document embeddings (filter by company if provided)
    const filter = company_id ? { company_id } : {};
    const embeddings = await base44.entities.DocumentEmbedding.filter(filter);

    if (embeddings.length === 0) {
      return Response.json({ 
        results: [],
        message: 'No documents found. Upload documents first.'
      });
    }

    // Use LLM to analyze query against document chunks
    const prompt = `Given this user query: "${query}"

Analyze these document chunks and identify the ${top_k} most relevant ones:

${embeddings.slice(0, 20).map((emb, idx) => `
[${idx}] File: ${emb.file_name} | Chunk ${emb.chunk_index}
Content: ${emb.content_chunk.slice(0, 300)}...
`).join('\n')}

Return the indices of the most relevant chunks and explain why they're relevant.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          relevant_chunks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                relevance_score: { type: "number" },
                reason: { type: "string" }
              }
            }
          },
          summary: { type: "string" }
        }
      }
    });

    // Get the actual chunks
    const results = analysis.relevant_chunks.slice(0, top_k).map(item => {
      const embedding = embeddings[item.index];
      return {
        document_id: embedding.document_id,
        file_name: embedding.file_name,
        file_url: embedding.file_url,
        content: embedding.content_chunk,
        chunk_index: embedding.chunk_index,
        relevance_score: item.relevance_score,
        relevance_reason: item.reason,
        metadata: embedding.metadata
      };
    });

    // Generate answer using retrieved context
    const answerPrompt = `Based on these relevant document excerpts:

${results.map(r => `From ${r.file_name}:\n${r.content}`).join('\n\n')}

Answer this question: ${query}

Provide a comprehensive answer citing the sources.`;

    const answer = await base44.integrations.Core.InvokeLLM({
      prompt: answerPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          citations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({ 
      success: true,
      query,
      answer: answer.answer,
      citations: answer.citations,
      relevant_documents: results,
      summary: analysis.summary
    });

  } catch (error) {
    console.error('Error in RAG search:', error);
    return Response.json({ 
      error: error.message || 'Failed to search documents' 
    }, { status: 500 });
  }
});