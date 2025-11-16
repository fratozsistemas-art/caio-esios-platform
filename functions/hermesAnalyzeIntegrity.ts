
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_entity_type, target_entity_id, analysis_types, conversation_data } = await req.json();

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
        'enrichment_suggestion': 'EnrichmentSuggestion',
        'workflow_execution': 'WorkflowExecution',
        'knowledge_item': 'KnowledgeItem'
      };
      
      const entityName = entityMap[target_entity_type];
      
      // Special handling for conversations (not a standard entity)
      if (target_entity_type === 'conversation') {
        if (!conversation_data) {
          return Response.json({ error: 'Conversation data required' }, { status: 400 });
        }
        targetEntity = conversation_data;
      } else {
        if (!entityName) {
          return Response.json({ error: 'Invalid entity type' }, { status: 400 });
        }

        const entities = await base44.entities[entityName].filter({ id: target_entity_id });
        targetEntity = entities[0];

        if (!targetEntity) {
          return Response.json({ error: 'Entity not found' }, { status: 404 });
        }
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
        case 'sentiment_consistency':
          analysisResult = await analyzeSentimentConsistency(targetEntity, target_entity_type, base44);
          break;
        case 'task_coherence':
          analysisResult = await analyzeTaskCoherence(targetEntity, target_entity_type, base44);
          break;
        case 'conversation_quality':
          analysisResult = await analyzeConversationQuality(targetEntity, target_entity_type, base44);
          break;
        default:
          continue;
      }

      // Store analysis in database (skip for conversation if no ID)
      const hermesAnalysis = await base44.entities.HermesAnalysis.create({
        analysis_type: analysisType,
        target_entity_type,
        target_entity_id: target_entity_id || 'conversation_' + Date.now(),
        ...analysisResult,
        status: 'completed'
      });

      analysisResults.push(hermesAnalysis);

      // PROACTIVE REMEDIATION: Auto-trigger for critical/high severity issues
      const criticalIssues = (analysisResult.inconsistencies_detected || [])
        .filter(i => i.severity === 'critical' || i.severity === 'high');

      if (criticalIssues.length > 0) {
        for (const issue of criticalIssues) {
          await base44.functions.invoke('hermesAutoRemediate', {
            analysis_id: hermesAnalysis.id,
            entity_type: target_entity_type,
            entity_id: hermesAnalysis.target_entity_id, // Use the ID saved with the analysis
            issue_type: issue.type,
            severity: issue.severity,
            issue_description: issue.description,
            recommendation: issue.recommendation
          });
        }
      }
    }

    // Calculate overall cognitive health score
    const cognitiveHealthScore = calculateCognitiveHealth(analysisResults);

    // Store cognitive health metric
    await base44.entities.CognitiveHealthMetric.create({
      metric_type: 'decision_quality',
      scope: target_entity_type,
      scope_id: target_entity_id || 'conversation_session',
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

async function analyzeSentimentConsistency(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, analista de consistência emocional. Analise sentimento e tom em ${entityType}:

${contextPrompt}

Para conversas/interações, analise:
1. Sentimento geral (positivo, neutro, negativo, misto)
2. Consistência de sentimento ao longo do tempo
3. Mudanças abruptas de tom e seus gatilhos
4. Alinhamento entre sentimento e conteúdo factual
5. Indicadores de frustração, confusão ou satisfação

Retorne análise de sentimento estruturada.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        sentiment_analysis: {
          type: "object",
          properties: {
            overall_sentiment: { type: "string" },
            sentiment_consistency: { type: "number" },
            tone_shifts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  from_tone: { type: "string" },
                  to_tone: { type: "string" },
                  trigger: { type: "string" }
                }
              }
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

async function analyzeTaskCoherence(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, analista de coerência de execução. Analise coerência de tarefas/execução em ${entityType}:

${contextPrompt}

Avalie:
1. Coerência entre status reportado e progresso real
2. Validade de dependências entre tarefas/passos
3. Alinhamento entre recursos alocados e necessários
4. Realismo de timeline baseado em histórico
5. Consistência de métricas de progresso
6. Bloqueadores não documentados

Retorne métricas de coerência.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        task_coherence_metrics: {
          type: "object",
          properties: {
            completion_coherence: { type: "number" },
            dependency_validity: { type: "number" },
            resource_alignment: { type: "number" },
            timeline_realism: { type: "number" }
          }
        },
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

async function analyzeConversationQuality(entity, entityType, base44) {
  const contextPrompt = getEntityContextPrompt(entity, entityType);
  
  const prompt = `Você é o Hermes, auditor de qualidade conversacional. Analise qualidade de conversa:

${contextPrompt}

Avalie:
1. Clareza e objetividade das mensagens
2. Resolução de dúvidas e follow-through
3. Consistência de informações fornecidas
4. Detecção de mal-entendidos ou loops
5. Qualidade das respostas do agente
6. Satisfação implícita do usuário

Retorne análise de qualidade conversacional.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        integrity_score: { type: "number" },
        sentiment_analysis: {
          type: "object",
          properties: {
            overall_sentiment: { type: "string" },
            sentiment_consistency: { type: "number" },
            tone_shifts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "string" },
                  from_tone: { type: "string" },
                  to_tone: { type: "string" },
                  trigger: { type: "string" }
                }
              }
            }
          }
        },
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

function getEntityContextPrompt(entity, entityType) {
  const commonFields = `
ID: ${entity.id || 'N/A'}
Criado em: ${entity.created_date || 'N/A'}
Criado por: ${entity.created_by || 'N/A'}
`;

  switch (entityType) {
    case 'tsi_project':
      return `${commonFields}
Título: ${entity.title || 'N/A'}
Tipo de Missão: ${entity.mission?.type || 'N/A'}
Objetivo: ${entity.mission?.primary_objective || 'N/A'}
Target: ${entity.target?.company_name || 'N/A'}
Constraints: ${JSON.stringify(entity.constraints || {})}
Status: ${entity.status || 'N/A'}
Confidence Score: ${entity.confidence_score || 'N/A'}
Fases CAIO TSI+: ${JSON.stringify(entity.caio_tsi_phases || {})}
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
Duração Média: ${entity.avg_duration_seconds || 'N/A'}s
Passos: ${JSON.stringify(entity.steps || [])}
Config Hierárquica: ${JSON.stringify(entity.hierarchical_config || {})}`;

    case 'workflow_execution':
      return `${commonFields}
Workflow: ${entity.workflow_name}
Status: ${entity.status}
Passo Atual: ${entity.current_step || 'N/A'}
Passos Completados: ${(entity.completed_steps || []).length}
Inputs: ${JSON.stringify(entity.inputs || {})}
Outputs: ${JSON.stringify(entity.outputs || {})}
Resultados dos Passos: ${JSON.stringify(entity.step_results || {})}
Duração: ${entity.duration_seconds || 'N/A'}s
Erro: ${entity.error_message || 'Nenhum'}
Logs: ${JSON.stringify((entity.logs || []).slice(-5))}`;

    case 'conversation':
      return `${commonFields}
Mensagens: ${JSON.stringify(entity.messages || [])}
Metadata: ${JSON.stringify(entity.metadata || {})}
Agente: ${entity.agent_name || 'N/A'}`;

    case 'enrichment_suggestion':
      return `${commonFields}
Entidade Tipo: ${entity.entity_type}
Entidade Label: ${entity.entity_label}
Tipo de Sugestão: ${entity.suggestion_type}
Fonte de Dados: ${entity.data_source}
Dados Sugeridos: ${JSON.stringify(entity.suggested_data || {})}
Dados Atuais: ${JSON.stringify(entity.current_data || {})}
Confidence Score: ${entity.confidence_score}
Raciocínio: ${entity.reasoning}
Evidências: ${JSON.stringify(entity.supporting_evidence || [])}`;

    case 'knowledge_item':
      return `${commonFields}
Título: ${entity.title}
Tipo: ${entity.type}
Framework: ${entity.framework}
Resumo: ${entity.summary || 'N/A'}
Insights Chave: ${JSON.stringify(entity.key_insights || [])}
Itens de Ação: ${JSON.stringify(entity.action_items || [])}`;

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
    workflow_execution: {
      board_management: 'Avalie se resultados de execução estão prontos para reporting executivo ou precisam de síntese adicional.',
      silos: 'Verifique se logs e resultados estão fragmentados ou se há visão unificada da execução.',
      tensions: 'Identifique passos que falharam ou estão bloqueados, mapeando dependências problemáticas.',
      coherence: 'Valide coerência entre status reportado, passos completados e outputs gerados.',
      reasoning: 'Documente a sequência lógica de execução, decisões de cada passo e propagação de dados.'
    },
    conversation: {
      board_management: 'Identifique se a conversa contém insights estratégicos que deveriam ser escalados para o Board.',
      silos: 'Detecte se informações fornecidas são consistentes com dados do Knowledge Graph ou se há desconexão.',
      tensions: 'Identifique frustrações, mal-entendidos ou expectativas não atendidas na conversa.',
      coherence: 'Valide consistência de informações fornecidas ao longo da conversa.',
      reasoning: 'Trace a lógica das respostas do agente, validando se recomendações são fundamentadas.'
    },
    enrichment_suggestion: {
      board_management: 'Avalie se a sugestão tem impacto estratégico que deveria ser comunicado ao Board.',
      silos: 'Verifique se a sugestão está considerando dados de todas as fontes relevantes ou apenas de um silo.',
      tensions: 'Identifique potenciais conflitos entre dados sugeridos e dados existentes.',
      coherence: 'Valide se dados sugeridos são coerentes com o contexto da entidade e outras informações conhecidas.',
      reasoning: 'Documente a lógica que levou à sugestão, incluindo fontes de dados e evidências de suporte.'
    },
    knowledge_item: {
      board_management: 'Verifique se o conteúdo está formatado adequadamente para consumo executivo.',
      silos: 'Detecte se o item está conectado a outros conhecimentos relacionados ou isolado.',
      tensions: 'Identifique conflitos entre insights ou action items contraditórios.',
      coherence: 'Valide alinhamento entre framework, insights e ações propostas.',
      reasoning: 'Trace a lógica dos insights até as fontes de dados originais.'
    }
  };

  return guidelines[entityType]?.[analysisType] || 'Aplique análise padrão para este tipo de entidade.';
}

function calculateCognitiveHealth(analyses) {
  if (!analyses || analyses.length === 0) return 0;
  
  const avgIntegrity = analyses.reduce((sum, a) => sum + (a.integrity_score || 0), 0) / analyses.length;
  
  const criticalIssues = analyses.reduce((sum, a) => {
    const critical = (a.inconsistencies_detected || []).filter(i => i.severity === 'critical').length;
    return sum + critical;
  }, 0);
  
  const penalty = Math.min(criticalIssues * 10, 30);
  
  return Math.max(0, Math.min(100, avgIntegrity - penalty));
}
