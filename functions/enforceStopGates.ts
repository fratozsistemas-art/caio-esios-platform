import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * STOP GATES ENFORCEMENT - Iterative Refinement
 * Implementa validação rigorosa em pontos críticos do TSI
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { gate_number, project_id, deliverables } = await req.json();
    
    console.log(`🚦 Evaluating GATE ${gate_number} for project ${project_id}`);
    
    const project = await base44.asServiceRole.entities.TSIProject.get(project_id);
    
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    
    let gateResult;
    
    switch (gate_number) {
      case 0:
        gateResult = await evaluateGate0(base44, project, deliverables);
        break;
      case 1:
        gateResult = await evaluateGate1(base44, project, deliverables);
        break;
      case 2:
        gateResult = await evaluateGate2(base44, project, deliverables);
        break;
      default:
        return Response.json({ error: 'Invalid gate number' }, { status: 400 });
    }
    
    // Update project with gate result
    const updateField = `gate_${gate_number}_status`;
    await base44.asServiceRole.entities.TSIProject.update(project_id, {
      [updateField]: gateResult.passed ? 'passed' : 'failed',
      [`gate_${gate_number}_feedback`]: gateResult
    });
    
    console.log(`✅ GATE ${gate_number}: ${gateResult.passed ? 'PASSED' : 'FAILED'}`);
    
    return Response.json({
      success: true,
      gate_number,
      result: gateResult
    });
    
  } catch (error) {
    console.error('Gate enforcement error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});

/**
 * GATE 0: FOUNDATION VALIDATION
 * Valida se o projeto tem fundação sólida para começar
 */
async function evaluateGate0(base44, project, deliverables) {
  console.log('📋 Gate 0: Foundation Validation');
  
  const d1 = deliverables.find(d => d.deliverable_code === 'D1');
  
  if (!d1 || !d1.content) {
    return {
      passed: false,
      gate_name: 'Foundation Validation',
      critical_issues: ['D1 (Market Intelligence) não foi gerado'],
      blockers: ['Sem contexto de mercado, impossível prosseguir'],
      required_actions: ['Execute D1 primeiro'],
      confidence_assessment: {
        overall_crv: 0,
        data_quality: 0,
        reasoning: 'Deliverable ausente'
      }
    };
  }
  
  const validationPrompt = `Você é o Gate Keeper 0 - Validador de Fundação.

**SUA MISSÃO:** Avaliar se este projeto tem FUNDAÇÃO SÓLIDA para prosseguir.

**PROJETO:**
- Título: ${project.title}
- Modo: ${project.mode}
- Brief: ${project.project_brief || 'Não fornecido'}

**DELIVERABLE 1 (Market Intelligence):**
${JSON.stringify(d1.content, null, 2)}

**CRV Score D1:** ${d1.crv_score}%

**CRITÉRIOS DE APROVAÇÃO (Gate 0):**

1. **Clareza de Objetivo** (30%)
   - O objetivo do projeto está claro e específico?
   - É acionável ou vago demais?

2. **Qualidade de Dados** (40%)
   - CRV ≥ 70%?
   - Fontes confiáveis?
   - Assumptions documentadas?

3. **Feasibility** (30%)
   - O escopo é realista?
   - Constraints são gerenciáveis?
   - Há red flags críticos?

**DECISÃO:**
- **PASS:** Se ≥80% dos critérios atendidos E sem blockers críticos
- **FAIL:** Se <80% OU se há blocker crítico

**OUTPUT (JSON):**
{
  "passed": boolean,
  "gate_name": "Foundation Validation",
  "score_breakdown": {
    "clarity_score": number (0-100),
    "data_quality_score": number (0-100),
    "feasibility_score": number (0-100),
    "overall_score": number (0-100)
  },
  "critical_issues": [string],
  "blockers": [string],
  "warnings": [string],
  "required_actions": [string],
  "confidence_assessment": {
    "overall_crv": number,
    "data_quality": number,
    "reasoning": string
  },
  "recommendation": string
}`;

  const validation = await base44.integrations.Core.InvokeLLM({
    prompt: validationPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        gate_name: { type: "string" },
        score_breakdown: {
          type: "object",
          properties: {
            clarity_score: { type: "number" },
            data_quality_score: { type: "number" },
            feasibility_score: { type: "number" },
            overall_score: { type: "number" }
          }
        },
        critical_issues: { type: "array", items: { type: "string" } },
        blockers: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        required_actions: { type: "array", items: { type: "string" } },
        confidence_assessment: {
          type: "object",
          properties: {
            overall_crv: { type: "number" },
            data_quality: { type: "number" },
            reasoning: { type: "string" }
          }
        },
        recommendation: { type: "string" }
      }
    }
  });
  
  return validation;
}

/**
 * GATE 1: STRATEGY VALIDATION
 * Valida se a estratégia proposta é sólida
 */
async function evaluateGate1(base44, project, deliverables) {
  console.log('🎯 Gate 1: Strategy Validation');
  
  const d5 = deliverables.find(d => d.deliverable_code === 'D5');
  
  if (!d5 || !d5.content) {
    return {
      passed: false,
      gate_name: 'Strategy Validation',
      critical_issues: ['D5 (Strategic Synthesis) não foi gerado'],
      blockers: ['Sem síntese estratégica, impossível avaliar viabilidade'],
      required_actions: ['Execute D5 primeiro']
    };
  }
  
  // Query Knowledge Graph para comparação
  let similarStrategies = [];
  try {
    const kgQuery = await base44.asServiceRole.functions.invoke('queryKnowledgeGraph', {
      query_type: 'find_similar_companies',
      params: {
        industry: d5.content.detailed_analysis?.industry || project.title,
        stage: 'all'
      }
    });
    similarStrategies = kgQuery.data?.results || [];
  } catch (error) {
    console.warn('Knowledge Graph query failed:', error.message);
  }
  
  const validationPrompt = `Você é o Gate Keeper 1 - Validador de Estratégia.

**SUA MISSÃO:** Avaliar se a ESTRATÉGIA proposta é robusta e acionável.

**PROJETO:** ${project.title}

**DELIVERABLE 5 (Strategic Synthesis):**
${JSON.stringify(d5.content, null, 2)}

**CRV Score D5:** ${d5.crv_score}%

**CONTEXTO DE MERCADO (Knowledge Graph):**
${similarStrategies.length > 0 ? JSON.stringify(similarStrategies.slice(0, 5), null, 2) : 'Nenhum dado comparativo disponível'}

**CRITÉRIOS DE APROVAÇÃO (Gate 1):**

1. **Strategic Clarity** (25%)
   - GO/NO-GO recommendation está clara?
   - Opções estratégicas bem definidas (A, B, C)?
   - VRIN analysis sólida?

2. **Data Confidence** (25%)
   - CRV consolidado ≥ 70%?
   - Assumptions críticas documentadas?
   - [FATO] vs [HIPÓTESE] classificado?

3. **Actionability** (25%)
   - Strategic options são executáveis?
   - Timeline realista?
   - Resource requirements claros?

4. **Risk Assessment** (25%)
   - Critical gaps identificados?
   - Mitigation plans existem?
   - Downside scenarios considerados?

**DECISÃO:**
- **PASS:** Se ≥75% E CRV consolidado ≥70% E sem blockers críticos
- **FAIL:** Se <75% OU CRV <70% OU blocker crítico existe

**OUTPUT (JSON):**`;

  const validation = await base44.integrations.Core.InvokeLLM({
    prompt: validationPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        gate_name: { type: "string" },
        score_breakdown: {
          type: "object",
          properties: {
            strategic_clarity: { type: "number" },
            data_confidence: { type: "number" },
            actionability: { type: "number" },
            risk_assessment: { type: "number" },
            overall_score: { type: "number" }
          }
        },
        critical_issues: { type: "array", items: { type: "string" } },
        blockers: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        required_actions: { type: "array", items: { type: "string" } },
        comparisons_with_similar_strategies: { type: "array", items: { type: "string" } },
        recommendation: { type: "string" }
      }
    }
  });
  
  return validation;
}

/**
 * GATE 2: EXECUTION READINESS
 * Valida se o plano de execução é viável
 */
async function evaluateGate2(base44, project, deliverables) {
  console.log('🚀 Gate 2: Execution Readiness');
  
  const d7 = deliverables.find(d => d.deliverable_code === 'D7');
  
  if (!d7 || !d7.content) {
    return {
      passed: false,
      gate_name: 'Execution Readiness',
      critical_issues: ['D7 (Implementation Roadmap) não foi gerado'],
      blockers: ['Sem roadmap de implementação'],
      required_actions: ['Execute D7 primeiro']
    };
  }
  
  const validationPrompt = `Você é o Gate Keeper 2 - Validador de Execução.

**SUA MISSÃO:** Avaliar se o PLANO DE EXECUÇÃO é viável e completo.

**DELIVERABLE 7 (Implementation Roadmap):**
${JSON.stringify(d7.content, null, 2)}

**CRV Score D7:** ${d7.crv_score}%

**CRITÉRIOS DE APROVAÇÃO (Gate 2):**

1. **Resource Planning** (30%)
   - Team requirements claros?
   - Budget allocation definido?
   - Tools/technology especificados?

2. **Timeline Realism** (30%)
   - Milestones são alcançáveis?
   - Dependencies mapeadas?
   - Buffer adequado?

3. **Risk Mitigation** (20%)
   - Top risks identificados?
   - Mitigation plans existem?
   - Contingencies definidas?

4. **Accountability** (20%)
   - RACI matrix presente?
   - OKRs mensuráveis?
   - Governance definido?

**DECISÃO:**
- **PASS:** Se ≥75% E roadmap viável E risks mitigados
- **FAIL:** Se <75% OU timeline irrealista OU risks críticos sem mitigação

**OUTPUT (JSON):**`;

  const validation = await base44.integrations.Core.InvokeLLM({
    prompt: validationPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        gate_name: { type: "string" },
        score_breakdown: {
          type: "object",
          properties: {
            resource_planning: { type: "number" },
            timeline_realism: { type: "number" },
            risk_mitigation: { type: "number" },
            accountability: { type: "number" },
            overall_score: { type: "number" }
          }
        },
        critical_issues: { type: "array", items: { type: "string" } },
        blockers: { type: "array", items: { type: "string" } },
        warnings: { type: "array", items: { type: "string" } },
        required_actions: { type: "array", items: { type: "string" } },
        recommendation: { type: "string" }
      }
    }
  });
  
  return validation;
}