import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_url, document_title } = await req.json();

    if (!document_url) {
      return Response.json({ error: 'document_url is required' }, { status: 400 });
    }

    // Fetch document content
    let documentContent = '';
    try {
      const docResponse = await fetch(document_url);
      documentContent = await docResponse.text();
    } catch (error) {
      return Response.json({ 
        error: 'Failed to fetch document',
        details: error.message 
      }, { status: 400 });
    }

    // Analyze document using LLM
    const analysisPrompt = `
You are an advanced document analyzer for CAIO·AI platform. Analyze the following document and provide:

1. **Document Type Classification**: Categorize as whitepaper, technical_spec, brand_guide, analysis, strategy_doc, competitive_intel, or other

2. **Entity Extraction**: Identify and extract:
   - Platform names (e.g., CAIO, GPT-5, Claude)
   - Version numbers (e.g., v9.2, v10.x)
   - Dates and temporal references
   - People and companies mentioned
   - Key metrics and numbers

3. **Sentiment Analysis**:
   - Overall document sentiment
   - Confidence level (0-100)
   - Key claims with sentiment and verifiability

4. **Executive Summary**: 2-3 paragraph summary of main points

5. **Temporal Anomalies**: Identify any:
   - Future dates mentioned as past events
   - Logical inconsistencies in timeline
   - Conflicting version numbers or dates
   - Severity level for each

6. **Unverifiable Claims**: List any claims that:
   - Reference future events as facts
   - Lack external sources
   - Make competitive assertions without data

7. **Tags**: Generate 5-10 relevant tags for categorization

8. **Hermes Validation**: Provide integrity score (0-100), risk assessment, and value proposition

Document Title: ${document_title || 'Unknown'}

Document Content:
${documentContent.substring(0, 50000)}

Return your analysis as JSON with this structure:
{
  "document_type": "string",
  "extracted_entities": [{"type": "platform|version|date|person|company|metric", "value": "string", "confidence": 0-100}],
  "sentiment_analysis": {
    "overall_sentiment": "positive|neutral|negative|mixed",
    "confidence_level": 0-100,
    "key_claims": [{"claim": "string", "sentiment": "string", "verifiable": boolean}]
  },
  "summary": "string",
  "temporal_anomalies": [{"anomaly": "string", "severity": "low|medium|high|critical", "recommendation": "string"}],
  "unverifiable_claims": ["string"],
  "tags": ["string"],
  "hermes_validation": {
    "integrity_score": 0-100,
    "risk_assessment": "string",
    "value_proposition": "string"
  }
}
`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          document_type: { type: "string" },
          extracted_entities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                value: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          sentiment_analysis: {
            type: "object",
            properties: {
              overall_sentiment: { type: "string" },
              confidence_level: { type: "number" },
              key_claims: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    claim: { type: "string" },
                    sentiment: { type: "string" },
                    verifiable: { type: "boolean" }
                  }
                }
              }
            }
          },
          summary: { type: "string" },
          temporal_anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                anomaly: { type: "string" },
                severity: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          unverifiable_claims: {
            type: "array",
            items: { type: "string" }
          },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          hermes_validation: {
            type: "object",
            properties: {
              integrity_score: { type: "number" },
              risk_assessment: { type: "string" },
              value_proposition: { type: "string" }
            }
          }
        }
      }
    });

    // Save analysis to database
    const analysis = await base44.entities.DocumentAnalysis.create({
      document_title: document_title || 'Untitled Document',
      document_url,
      document_type: llmResponse.document_type,
      extracted_entities: llmResponse.extracted_entities,
      sentiment_analysis: llmResponse.sentiment_analysis,
      summary: llmResponse.summary,
      temporal_anomalies: llmResponse.temporal_anomalies,
      unverifiable_claims: llmResponse.unverifiable_claims,
      tags: llmResponse.tags,
      hermes_validation: llmResponse.hermes_validation
    });

    return Response.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return Response.json({ 
      error: 'Analysis failed', 
      details: error.message 
    }, { status: 500 });
  }
});