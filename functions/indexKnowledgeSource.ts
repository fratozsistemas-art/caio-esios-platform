import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Index a knowledge source by extracting and analyzing its content
 */
Deno.serve(async (req) => {
  console.log('📚 [Index Knowledge] Function started');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { knowledge_source_id } = await req.json();

    if (!knowledge_source_id) {
      return Response.json({ 
        error: 'knowledge_source_id is required' 
      }, { status: 400 });
    }

    console.log('📋 Indexing knowledge source:', knowledge_source_id);

    // Get the knowledge source
    const source = await base44.entities.KnowledgeSource.filter({
      id: knowledge_source_id
    });

    if (!source || source.length === 0) {
      return Response.json({ 
        error: 'Knowledge source not found' 
      }, { status: 404 });
    }

    const knowledgeSource = source[0];
    console.log('✅ Found source:', knowledgeSource.title);

    // Update status to processing
    await base44.entities.KnowledgeSource.update(knowledge_source_id, {
      indexing_status: 'processing'
    });

    // Extract content and analyze
    const analysisPrompt = `You are an expert knowledge indexer and analyzer.

**DOCUMENT TO ANALYZE:**
File: ${knowledgeSource.file_name}
Category: ${knowledgeSource.category}
URL: ${knowledgeSource.file_url}

**YOUR TASK:**
Extract and analyze this document to create a comprehensive index. Provide:

1. **Content Summary** (200-300 words): Executive summary of the document
2. **Key Topics** (5-10 topics): Main themes and subjects covered
3. **Entities Mentioned**: Companies, people, products, technologies mentioned
4. **Full Content**: Complete extracted text from the document
5. **Date Range**: Any time periods or dates mentioned in the content
6. **Quality Score**: Rate the document's quality and relevance (0-100)

**OUTPUT FORMAT (JSON):**
{
  "content_extracted": "Full text content...",
  "content_summary": "Executive summary...",
  "key_topics": ["topic1", "topic2", ...],
  "entities_mentioned": ["entity1", "entity2", ...],
  "date_range": {
    "start": "YYYY-MM-DD or null",
    "end": "YYYY-MM-DD or null"
  },
  "quality_score": 85,
  "metadata": {
    "page_count": 10,
    "word_count": 5000,
    "language": "en",
    "content_type": "research_paper"
  }
}

Be thorough and accurate. This will be used by an AI agent to answer strategic questions.`;

    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        file_urls: [knowledgeSource.file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            content_extracted: { type: "string" },
            content_summary: { type: "string" },
            key_topics: { 
              type: "array", 
              items: { type: "string" } 
            },
            entities_mentioned: { 
              type: "array", 
              items: { type: "string" } 
            },
            date_range: {
              type: "object",
              properties: {
                start: { type: ["string", "null"] },
                end: { type: ["string", "null"] }
              }
            },
            quality_score: { type: "number" },
            metadata: { type: "object" }
          },
          required: ["content_extracted", "content_summary", "key_topics"]
        }
      });

      console.log('✅ Content analysis complete');

      // Update knowledge source with indexed data
      await base44.entities.KnowledgeSource.update(knowledge_source_id, {
        content_extracted: analysis.content_extracted,
        content_summary: analysis.content_summary,
        key_topics: analysis.key_topics || [],
        entities_mentioned: analysis.entities_mentioned || [],
        date_range: analysis.date_range || null,
        quality_score: analysis.quality_score || 70,
        metadata: analysis.metadata || {},
        indexing_status: 'indexed'
      });

      console.log('✅ Knowledge source indexed successfully');

      return Response.json({
        success: true,
        message: 'Knowledge source indexed successfully',
        knowledge_source_id,
        summary: {
          topics_found: analysis.key_topics?.length || 0,
          entities_found: analysis.entities_mentioned?.length || 0,
          quality_score: analysis.quality_score || 70,
          content_length: analysis.content_extracted?.length || 0
        }
      });

    } catch (analysisError) {
      console.error('❌ Analysis failed:', analysisError);
      
      await base44.entities.KnowledgeSource.update(knowledge_source_id, {
        indexing_status: 'failed',
        metadata: {
          error: analysisError.message,
          failed_at: new Date().toISOString()
        }
      });

      return Response.json({ 
        error: 'Failed to analyze document',
        details: analysisError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in indexKnowledgeSource:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
});