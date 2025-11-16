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
        'document': 'Document',
        'tsi_project': 'TSIProject',
        'workflow': 'AgentWorkflow',
        'agent_workflow': 'AgentWorkflow',
        'enrichment_suggestion': 'EnrichmentSuggestion'
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
          analysisResult = await analyzeNarrativeIntegrity(targetEntity, target_entity_type, base44);
          break;
        case 'board_management_gap':
          analysisResult = await analyzeBoardManagementGaps(targetEntity, target_entity_type, base44);
          break;
        case 'silo_reconciliation':
          analysisResult = await analyzeSilos(targetEntity, target_entity_type, base44);
          break;
        case 'tension_analysis':
          analysisResult = await analyzeTensions(targetEntity, target_entity_type, base44);
          break;
        case 'coherence_check':
          analysisResult = await checkCoherence(targetEntity, target_entity_type, base44);
          break;
        case 'reasoning_audit':
          analysisResult = await auditReasoning(targetEntity, target_entity_type, base44);
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

async function analyzeNarrativeIntegrity(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, o trust-broker cognitivo. Analise a integridade narrativa deste ${entityType}:

${contextPrompt}

Detecte:
1. Inconsistências lógicas
2. Contradições internas
3. Lacunas de informação
4. Manipulação ou distorção de dados
5. Greenwashing ou claims não verificáveis
6. Desalinhamento entre objetivos declarados e ações/métricas

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

async function analyzeBoardManagementGaps(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, mediador entre Board e Management. Analise este ${entityType} e identifique gaps de informação que podem causar assimetria entre conselho e gestão:

${contextPrompt}

Identifique:
1. Informação técnica que precisa de tradução executiva
2. Dados ausentes que o Board precisaria
3. Desalinhamento de linguagem (técnica vs. fiduciária)
4. Contexto faltante para decisões estratégicas
5. Métricas de risco não evidenciadas
6. Timeline misalignment (curto vs. longo prazo)

Para ${entityType} específico, considere:
${getEntitySpecificGuidance(entityType, 'board_management')}

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

async function analyzeSilos(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, reconciliador de silos. Analise fragmentação de informação em ${entityType}:

${contextPrompt}

Detecte:
1. Silos de informação (dados isolados)
2. Narrativas conflitantes entre fontes
3. Dados duplicados ou inconsistentes
4. Oportunidades de unificação
5. Dependências não documentadas

Para ${entityType}, foque em:
${getEntitySpecificGuidance(entityType, 'silos')}

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

async function analyzeTensions(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, analista de tensões organizacionais. Mapeie conflitos e desalinhamentos em ${entityType}:

${contextPrompt}

Identifique:
1. Desalinhamentos estratégicos
2. Conflitos de objetivos
3. Prioridades incompatíveis
4. Tensões dialéticas não resolvidas
5. Conflitos de recursos ou timeline

Para ${entityType}:
${getEntitySpecificGuidance(entityType, 'tensions')}

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

async function checkCoherence(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, validador de coerência lógica. Verifique consistência lógica em ${entityType}:

${contextPrompt}

Valide:
1. Consistência lógica entre premissas e conclusões
2. Suporte factual para claims
3. Coerência temporal (passado-presente-futuro)
4. Alinhamento entre objetivos e ações propostas
5. Consistência de métricas e KPIs

Para ${entityType}:
${getEntitySpecificGuidance(entityType, 'coherence')}

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

async function auditReasoning(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, auditor de raciocínio. Rastreie decisões até premissas originais em ${entityType}:

${contextPrompt}

Crie trilha de auditoria mostrando:
1. Premissas fundamentais
2. Lógica aplicada em cada passo
3. Conclusões derivadas
4. Níveis de confiança em cada inferência
5. Fontes de dados para cada premissa

Para ${entityType}:
${getEntitySpecificGuidance(entityType, 'reasoning')}

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

function getEntityContextPrompt(entity, entityType) {
  const commonFields = `
ID: ${entity.id}
Criado em: ${entity.created_date}
Criado por: ${entity.created_by}
`;

  switch (entityType) {
    case 'tsi_project':
      return `${commonFields}
Título: ${entity.title || 'N/A'}
Tipo de Missão: ${entity.mission?.type || 'N/A'}
Objetivo: ${entity.mission?.primary_objective || 'N/A'}
Target: ${entity.target?.company_name || 'N/A'}
Status: ${entity.status || 'N/A'}
Confidence Score: ${entity.confidence_score || 'N/A'}
Resultados: ${JSON.stringify(entity.analysis_results || {})}`;

    case 'workflow':
    case 'agent_workflow':
      return `${commonFields}
Nome: ${entity.name}
Tipo: ${entity.workflow_type}
Descrição: ${entity.description || 'N/A'}
Modo de Execução: ${entity.execution_mode}
Status: ${entity.status}
Taxa de Sucesso: ${entity.success_rate || 0}%
Execuções: ${entity.execution_count || 0}
Passos: ${JSON.stringify(entity.steps || [])}`;

    case 'enrichment_suggestion':
      return `${commonFields}
Entidade Tipo: ${entity.entity_type}
Entidade Label: ${entity.entity_label}
Tipo de Sugestão: ${entity.suggestion_type}
Fonte de Dados: ${entity.data_source}
Dados Sugeridos: ${JSON.stringify(entity.suggested_data || {})}
Dados Atuais: ${JSON.stringify(entity.current_data || {})}
Confidence Score: ${entity.confidence_score}
Raciocínio: ${entity.reasoning}`;

    default:
      return `${commonFields}
Título/Nome: ${entity.title || entity.name || 'N/A'}
Descrição: ${entity.description || 'N/A'}
Conteúdo Completo: ${JSON.stringify(entity)}`;
  }
}

function getEntitySpecificGuidance(entityType, analysisType) {
  const guidelines = {
    tsi_project: {
      board_management: 'Verifique se objetivos estratégicos estão traduzidos em linguagem fiduciária. Identifique se há contexto de mercado suficiente para decisões do Board.',
      silos: 'Detecte se dados de diferentes fases TSI (contexto, competitivo, tech, financeiro) estão integrados ou fragmentados.',
      tensions: 'Mapeie conflitos entre diferentes fases do projeto ou entre objetivos de curto e longo prazo.',
      coherence: 'Valide coerência entre missão, constraints, preferências e resultados de análise.',
      reasoning: 'Rastreie a lógica desde a configuração inicial até as recomendações finais, incluindo todas as fases CAIO TSI+ executadas.'
    },
    workflow: {
      board_management: 'Verifique se outputs do workflow são adequados para apresentação executiva. Identifique necessidade de síntese adicional.',
      silos: 'Detecte se diferentes passos do workflow estão compartilhando dados adequadamente ou criando silos de informação.',
      tensions: 'Identifique conflitos entre agentes ou dependências não resolvidas entre passos.',
      coherence: 'Valide consistência entre input_schema, output_schema e step results.',
      reasoning: 'Trace o fluxo de dados através dos passos, documentando transformações e decisões de cada agente.'
    },
    enrichment_suggestion: {
      board_management: 'Avalie se a sugestão tem impacto estratégico que deveria ser comunicado ao Board.',
      silos: 'Verifique se a sugestão está considerando dados de todas as fontes relevantes ou apenas de um silo.',
      tensions: 'Identifique potenciais conflitos entre dados sugeridos e dados existentes.',
      coherence: 'Valide se dados sugeridos são coerentes com o contexto da entidade e outras informações conhecidas.',
      reasoning: 'Documente a lógica que levou à sugestão, incluindo fontes de dados e evidências de suporte.'
    }
  };

  return guidelines[entityType]?.[analysisType] || 'Aplique análise padrão para este tipo de entidade.';
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