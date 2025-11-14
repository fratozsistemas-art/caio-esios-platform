import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0';

/**
 * Direct integration with Anthropic Claude API
 * Provides access to Claude models for advanced analysis
 */
Deno.serve(async (req) => {
  console.log('🤖 [Claude Analysis] Function started');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [Claude] User authenticated:', user.email);

    const {
      prompt,
      model = "claude-3-5-sonnet-20241022", // Default to latest Sonnet
      max_tokens = 4096,
      temperature = 1.0,
      system_prompt = null,
      response_format = "text", // "text" or "json"
      json_schema = null
    } = await req.json();

    if (!prompt) {
      return Response.json({ 
        error: 'prompt is required' 
      }, { status: 400 });
    }

    console.log(`🎯 [Claude] Model: ${model}, Format: ${response_format}`);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')
    });

    // Build messages array
    const messages = [
      {
        role: "user",
        content: prompt
      }
    ];

    // Build request parameters
    const requestParams = {
      model,
      max_tokens,
      temperature,
      messages
    };

    // Add system prompt if provided
    if (system_prompt) {
      requestParams.system = system_prompt;
    }

    // Handle JSON response format
    if (response_format === "json" && json_schema) {
      // Add JSON formatting instruction to system prompt
      const jsonInstruction = `You must respond with valid JSON matching this schema:\n\n${JSON.stringify(json_schema, null, 2)}\n\nRespond ONLY with the JSON object, no markdown, no explanations.`;
      
      if (requestParams.system) {
        requestParams.system += `\n\n${jsonInstruction}`;
      } else {
        requestParams.system = jsonInstruction;
      }
    }

    console.log('📤 [Claude] Sending request to Anthropic API...');

    // Call Claude API
    const startTime = Date.now();
    const response = await anthropic.messages.create(requestParams);
    const duration = Date.now() - startTime;

    console.log(`✅ [Claude] Response received in ${duration}ms`);
    console.log(`📊 [Claude] Usage: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`);

    // Extract content
    const content = response.content[0].text;

    // Parse JSON if requested
    let result = content;
    if (response_format === "json") {
      try {
        result = JSON.parse(content);
        console.log('✅ [Claude] JSON parsed successfully');
      } catch (parseError) {
        console.error('❌ [Claude] JSON parse failed:', parseError.message);
        console.error('Raw content:', content);
        return Response.json({
          error: 'Failed to parse JSON response',
          details: parseError.message,
          raw_content: content
        }, { status: 500 });
      }
    }

    return Response.json({
      success: true,
      result,
      metadata: {
        model: response.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        },
        duration_ms: duration,
        stop_reason: response.stop_reason
      }
    });

  } catch (error) {
    console.error('❌ [Claude] Error:', error);
    
    // Handle Anthropic-specific errors
    if (error.status === 401) {
      return Response.json({
        error: 'Invalid Anthropic API key',
        details: 'Please check your ANTHROPIC_API_KEY secret'
      }, { status: 500 });
    }
    
    if (error.status === 429) {
      return Response.json({
        error: 'Rate limit exceeded',
        details: 'Too many requests to Anthropic API'
      }, { status: 429 });
    }

    return Response.json({ 
      error: 'Claude analysis failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});