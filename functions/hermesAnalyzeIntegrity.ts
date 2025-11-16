import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_entity_type, target_entity_id, analysis_types } = await req.json();

    // Fetch target entity
    let targetEntity;
    try {
      const entityMap = {
        'strategy': 'Strategy',
        'analysis': 'Analysis',
        'workspace': 'Workspace',
        'document': 'Document'
      };
      
      const entityName = entityMap[target_entity_type];
      if (!entityName) {
        return Response.json({ error: 'Invalid entity type' }, { status: 400 });
      }

      const entities = await base44.entities[entityName].filter({ id: target_entity_id });
      targetEntity = entities[0];

      if (!targetEntity) {
        return Response.json({ error: 'Entity not found' }, { status: 404 });
      }
    } catch (error) {
      return Response.json({ error: `Failed to fetch entity: ${error.message}` }, { status: 500 });
    }

    // Perform multi-dimensional Hermes analysis
    const analysisResults = [];

    for (const analysisType of analysis_types) {
      let analysisResult;

      switch (analysisType) {
        case 'narrative_integrity':
          analysisResult = await analyzeNarrativeIntegrity(targetEntity, base44);
          break;
        case 'board_management_gap':
          analysisResult = await analyzeBoardManagementGaps(targetEntity, base44);
          break;
        case 'silo_reconciliation':
          analysisResult = await analyzeSilos(targetEntity, base44);
          break;
        case 'tension_analysis':
          analysisResult = await analyzeTensions(targetEntity, base44);
          break;
        case 'coherence_check':
          analysisResult = await checkCoherence(targetEntity, base44);
          break;
        case 'reasoning_audit':
          analysisResult = await auditReasoning(targetEntity, base44);
          break;
        default:
          continue;
      }

      // Store analysis in database
      const hermesAnalysis = await base44.entities.HermesAnalysis.create({
        analysis_type: analysisType,
        target_entity_type,
        target_entity_id,
        ...analysisResult,
        status: 'completed'
      });

      analysisResults.push(hermesAnalysis);
    }

    // Calculate overall cognitive health score
    const cognitiveHealthScore = calculateCognitiveHealth(analysisResults);

    // Store cognitive health metric
    await base44.entities.CognitiveHealthMetric.create({
      metric_type: 'decision_quality',
      scope: target_entity_type,
      scope_id: target_entity_id,
      current_score: cognitiveHealthScore,
      trend: 'stable',
      measured_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      analyses: analysisResults,
      cognitive_health_score: cognitiveHealthScore
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function analyzeNarrativeIntegrity(entity, base44) {
  const prompt = `Você é o Hermes, o trust-broker cognitivo. Analise a integridade narrativa deste documento/estratégia:

Título: ${entity.title || entity.name}
Descrição: ${entity.description || ''}
Conteúdo: ${JSON.stringify(entity)}

Detecte:
1. Inconsistências lógicas
2. Contradições internas
3. Lacunas de informação
4. Manipulação ou distorção de dados
5. Greenwashing ou claims não verificáveis

Retorne sua análise estruturada.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        inconsistencies_detected: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              description: { type: "string" },
              severity: { type: "string" },
              evidence: { type: "array", items: { type: "string" } },
              recommendation: { type: "string" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });

  return response;
}

async function analyzeBoardManagementGaps(entity, base44) {
  const prompt = `Você é o Hermes, mediador entre Board e Management. Analise este documento e identifique gaps de informação que podem causar assimetria entre conselho e gestão:

Conteúdo: ${JSON.stringify(entity)}

Identifique:
1. Informação técnica que precisa de tradução executiva
2. Dados ausentes que o Board precisaria
3. Desalinhamento de linguagem (técnica vs. fiduciária)
4. Contexto faltante para decisões estratégicas
5. Métricas de risco não evidenciadas

Retorne sua análise.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        board_management_gaps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              gap_type: { type: "string" },
              description: { type: "string" },
              impact: { type: "string" },
              suggested_bridge: { type: "string" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });

  return response;
}

async function analyzeSilos(entity, base44) {
  const prompt = `Você é o Hermes, reconciliador de silos. Analise fragmentação de informação:

Conteúdo: ${JSON.stringify(entity)}

Detecte:
1. Silos de informação (dados isolados)
2. Narrativas conflitantes entre fontes
3. Dados duplicados ou inconsistentes
4. Oportunidades de unificação

Retorne estratégias de reconciliação.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        silos_detected: {
          type: "array",
          items: {
            type: "object",
            properties: {
              silo_name: { type: "string" },
              data_sources: { type: "array", items: { type: "string" } },
              conflicting_narratives: { type: "array", items: { type: "string" } },
              reconciliation_strategy: { type: "string" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });

  return response;
}

async function analyzeTensions(entity, base44) {
  const prompt = `Você é o Hermes, analista de tensões organizacionais. Mapeie conflitos e desalinhamentos:

Conteúdo: ${JSON.stringify(entity)}

Identifique:
1. Desalinhamentos estratégicos
2. Conflitos de objetivos
3. Prioridades incompatíveis
4. Tensões dialéticas não resolvidas

Mapeie stakeholders envolvidos e severidade.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        organizational_tensions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              tension_type: { type: "string" },
              stakeholders_involved: { type: "array", items: { type: "string" } },
              description: { type: "string" },
              severity: { type: "number" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });

  return response;
}

async function checkCoherence(entity, base44) {
  const prompt = `Você é o Hermes, validador de coerência lógica. Verifique consistência lógica:

Conteúdo: ${JSON.stringify(entity)}

Valide:
1. Consistência lógica entre premissas e conclusões
2. Suporte factual para claims
3. Coerência temporal (passado-presente-futuro)
4. Alinhamento entre objetivos e ações propostas

Retorne verificação de coerência.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        inconsistencies_detected: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              description: { type: "string" },
              severity: { type: "string" },
              evidence: { type: "array", items: { type: "string" } },
              recommendation: { type: "string" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });

  return response;
}

async function auditReasoning(entity, base44) {
  const prompt = `Você é o Hermes, auditor de raciocínio. Rastreie decisões até premissas originais:

Conteúdo: ${JSON.stringify(entity)}

Crie trilha de auditoria mostrando:
1. Premissas fundamentais
2. Lógica aplicada em cada passo
3. Conclusões derivadas
4. Níveis de confiança em cada inferência
5. Fontes de dados para cada premissa

Retorne trilha completa de raciocínio.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        reasoning_trail: {
          type: "array",
          items: {
            type: "object",
            properties: {
              step: { type: "string" },
              premise: { type: "string" },
              logic: { type: "string" },
              conclusion: { type: "string" },
              confidence: { type: "number" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  });

  return response;
}

function calculateCognitiveHealth(analyses) {
  if (!analyses || analyses.length === 0) return 0;
  
  const avgIntegrity = analyses.reduce((sum, a) => sum + (a.integrity_score || 0), 0) / analyses.length;
  
  // Penalize for critical issues
  const criticalIssues = analyses.reduce((sum, a) => {
    const critical = (a.inconsistencies_detected || []).filter(i => i.severity === 'critical').length;
    return sum + critical;
  }, 0);
  
  const penalty = Math.min(criticalIssues * 10, 30);
  
  return Math.max(0, Math.min(100, avgIntegrity - penalty));
}