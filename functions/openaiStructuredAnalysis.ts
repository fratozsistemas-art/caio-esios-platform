import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.67.3';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, context, analysis_type, response_schema, model = "gpt-4o" } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: `You are CAIO AI, a strategic intelligence analyst specialized in corporate analysis, market intelligence, and business strategy. 
        
Your analysis must be:
- Data-driven and fact-based
- Structured and actionable
- Brazilian market focused when relevant
- Using frameworks like ABRA, NIA, HYBRID, EVA, CSI when applicable

Always provide specific, measurable insights with clear recommendations.`
      }
    ];

    if (context) {
      messages.push({
        role: "system",
        content: `Context: ${JSON.stringify(context)}`
      });
    }

    messages.push({
      role: "user",
      content: prompt
    });

    const completionParams = {
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4000
    };

    if (response_schema) {
      completionParams.response_format = {
        type: "json_schema",
        json_schema: {
          name: "analysis_response",
          strict: true,
          schema: response_schema
        }
      };
    }

    const completion = await openai.chat.completions.create(completionParams);

    const result = completion.choices[0].message.content;
    const parsedResult = response_schema ? JSON.parse(result) : result;

    return Response.json({
      success: true,
      data: parsedResult,
      model: completion.model,
      usage: completion.usage,
      analysis_type
    });

  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});