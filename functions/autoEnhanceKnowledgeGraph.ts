import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const nodes = await base44.entities.KnowledgeGraphNode.list();
    let enhanced = 0;

    for (const node of nodes.slice(0, 10)) {
      if (node.type === 'company' && node.label) {
        const prompt = `Analise brevemente esta empresa: ${node.label}
        
Retorne informações estruturadas sobre:
- Setor de atuação
- Principais produtos/serviços
- Localização (país/região)
- Tags relevantes (3-5)`;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              industry: { type: "string" },
              products: { type: "array", items: { type: "string" } },
              location: { type: "string" },
              tags: { type: "array", items: { type: "string" } }
            }
          }
        });

        await base44.entities.KnowledgeGraphNode.update(node.id, {
          properties: {
            ...node.properties,
            ...llmResponse,
            last_enhanced: new Date().toISOString()
          }
        });

        enhanced++;
      }
    }

    return Response.json({ success: true, enhanced });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});