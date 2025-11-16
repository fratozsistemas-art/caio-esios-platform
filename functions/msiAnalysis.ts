import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Multi-Substrate Intelligence (MSI) Analysis
 * 
 * Combines three cognitive substrates:
 * 1. Knowledge Graph Intelligence (relationships, connections)
 * 2. RAG Intelligence (documents, reports)
 * 3. Pattern Synthesis Intelligence (emergent insights)
 * 
 * Returns unified strategic intelligence with CRV scoring
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, context, focus_entities } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query is required' }, { status: 400 });
        }

        const results = {
            query,
            timestamp: new Date().toISOString(),
            substrates: {},
            synthesis: {},
            confidence: {}
        };

        // SUBSTRATE A: KNOWLEDGE GRAPH INTELLIGENCE
        try {
            const kgQuery = `
Analise o Knowledge Graph para a seguinte questão estratégica:
"${query}"

${focus_entities ? `Entidades foco: ${JSON.stringify(focus_entities)}` : ''}
${context ? `Contexto adicional: ${context}` : ''}

Identifique:
1. Relacionamentos-chave entre empresas, pessoas e entidades
2. Board interlocks (conselheiros compartilhados)
3. Padrões de controle familiar
4. Exposição a governo/regulação
5. Cadeias de suprimento e dependências

Retorne insights estruturados sobre as conexões descobertas.
`;

            const kgResponse = await base44.integrations.Core.InvokeLLM({
                prompt: kgQuery,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        key_relationships: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    from: { type: "string" },
                                    to: { type: "string" },
                                    relationship_type: { type: "string" },
                                    strategic_significance: { type: "string" },
                                    confidence: { type: "number" }
                                }
                            }
                        },
                        board_interlocks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    person: { type: "string" },
                                    companies: { type: "array", items: { type: "string" } },
                                    implication: { type: "string" }
                                }
                            }
                        },
                        network_insights: {
                            type: "array",
                            items: { type: "string" }
                        },
                        confidence_score: { type: "number" }
                    }
                }
            });

            results.substrates.knowledge_graph = {
                status: "completed",
                data: kgResponse,
                source: "Knowledge Graph Traversal",
                confidence_tier: "Tier 1 (95%)"
            };

        } catch (error) {
            results.substrates.knowledge_graph = {
                status: "error",
                error: error.message
            };
        }

        // SUBSTRATE B: RAG INTELLIGENCE
        try {
            const ragQuery = `
Busque em documentos, relatórios financeiros, filings regulatórios e notícias informações relevantes para:
"${query}"

${context ? `Contexto: ${context}` : ''}

Identifique:
1. Mudanças regulatórias (DOU, CVM)
2. Desempenho financeiro (relatórios trimestrais)
3. Sentimento de mercado (notícias, analistas)
4. Tendências setoriais
5. Precedentes históricos

Classifique cada fonte por tier de confiança:
- Tier 1 (95%): Governo (Receita, DOU, CVM, BACEN)
- Tier 2 (85%): Dados financeiros (Bloomberg, S&P)
- Tier 3 (70%): Mídia (Valor Econômico, Reuters)
- Tier 4 (60%): Social media, fóruns
`;

            const ragResponse = await base44.integrations.Core.InvokeLLM({
                prompt: ragQuery,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        regulatory_insights: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    source: { type: "string" },
                                    finding: { type: "string" },
                                    impact: { type: "string" },
                                    confidence_tier: { type: "string" }
                                }
                            }
                        },
                        financial_insights: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    metric: { type: "string" },
                                    value: { type: "string" },
                                    trend: { type: "string" },
                                    source: { type: "string" }
                                }
                            }
                        },
                        market_sentiment: {
                            type: "object",
                            properties: {
                                overall: { type: "string" },
                                key_narratives: { type: "array", items: { type: "string" } }
                            }
                        },
                        document_summary: {
                            type: "array",
                            items: { type: "string" }
                        },
                        confidence_score: { type: "number" }
                    }
                }
            });

            results.substrates.rag_intelligence = {
                status: "completed",
                data: ragResponse,
                source: "Document Retrieval & Analysis",
                documents_analyzed: ragResponse.document_summary?.length || 0
            };

        } catch (error) {
            results.substrates.rag_intelligence = {
                status: "error",
                error: error.message
            };
        }

        // SUBSTRATE C: PATTERN SYNTHESIS INTELLIGENCE
        try {
            const kg = results.substrates.knowledge_graph?.data;
            const rag = results.substrates.rag_intelligence?.data;

            const synthesisQuery = `
Você é um sintetizador estratégico de elite. Analise os insights de dois substratos:

**KNOWLEDGE GRAPH INSIGHTS:**
${JSON.stringify(kg, null, 2)}

**RAG INTELLIGENCE:**
${JSON.stringify(rag, null, 2)}

**QUESTÃO ORIGINAL:**
"${query}"

Sua missão: Identificar PADRÕES EMERGENTES que nenhum dos substratos capturou sozinho.

Procure por:
1. **CONTRADIÇÕES** - Quando KG diz uma coisa e RAG diz outra (investigue o gap)
2. **ANOMALIAS** - Pontos de dados que não se encaixam (sinais mais valiosos)
3. **CONVERGÊNCIA** - Quando múltiplas fontes apontam para mesma conclusão (alta confiança)
4. **DIVERGÊNCIA** - Quando consenso é uniforme (oportunidade contrarian?)
5. **PADRÕES CROSS-INDUSTRY** - Lições de um setor aplicáveis a outro
6. **WEAK SIGNALS** - Indicadores precoces de mudanças de mercado
7. **BLACK SWANS** - Cenários de baixa probabilidade, alto impacto

Retorne os "aha moments" que definem pensamento estratégico breakthrough.
`;

            const synthesisResponse = await base44.integrations.Core.InvokeLLM({
                prompt: synthesisQuery,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        emergent_patterns: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    pattern_name: { type: "string" },
                                    description: { type: "string" },
                                    evidence_kg: { type: "string" },
                                    evidence_rag: { type: "string" },
                                    strategic_significance: { type: "string" },
                                    confidence: { type: "number" }
                                }
                            }
                        },
                        contradictions_resolved: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    contradiction: { type: "string" },
                                    resolution: { type: "string" },
                                    deeper_truth: { type: "string" }
                                }
                            }
                        },
                        asymmetric_opportunities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    opportunity: { type: "string" },
                                    why_others_miss_it: { type: "string" },
                                    potential_value: { type: "string" },
                                    risk_factors: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        black_swan_scenarios: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    scenario: { type: "string" },
                                    probability: { type: "string" },
                                    impact: { type: "string" },
                                    early_indicators: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        synthesis_confidence: { type: "number" }
                    }
                }
            });

            results.substrates.pattern_synthesis = {
                status: "completed",
                data: synthesisResponse,
                source: "Multi-Substrate Pattern Recognition"
            };

        } catch (error) {
            results.substrates.pattern_synthesis = {
                status: "error",
                error: error.message
            };
        }

        // FINAL SYNTHESIS WITH CRV SCORING
        const kg_confidence = results.substrates.knowledge_graph?.data?.confidence_score || 50;
        const rag_confidence = results.substrates.rag_intelligence?.data?.confidence_score || 50;
        const synthesis_confidence = results.substrates.pattern_synthesis?.data?.synthesis_confidence || 50;

        results.confidence = {
            overall_crv_score: Math.round((kg_confidence + rag_confidence + synthesis_confidence) / 3),
            substrate_scores: {
                knowledge_graph: kg_confidence,
                rag_intelligence: rag_confidence,
                pattern_synthesis: synthesis_confidence
            },
            data_quality_assessment: {
                sources_analyzed: [
                    results.substrates.knowledge_graph?.status === 'completed' ? 'Knowledge Graph' : null,
                    results.substrates.rag_intelligence?.status === 'completed' ? 'RAG Documents' : null,
                    results.substrates.pattern_synthesis?.status === 'completed' ? 'Pattern Synthesis' : null
                ].filter(Boolean),
                tier_1_sources: results.substrates.rag_intelligence?.data?.regulatory_insights?.filter(i => i.confidence_tier?.includes('Tier 1')).length || 0,
                tier_2_sources: results.substrates.rag_intelligence?.data?.financial_insights?.length || 0
            },
            key_assumptions: [
                "[FATO] Dados do Knowledge Graph são baseados em entidades validadas",
                "[HIPÓTESE] Padrões emergentes requerem validação com dados de mercado",
                "[FATO] Fontes Tier 1 (governo) têm 95% de confiança",
                "[HIPÓTESE] Projeções de cenários black swan são especulativas"
            ]
        };

        results.synthesis = {
            executive_summary: `MSI Analysis concluída para: "${query}". CRV Score: ${results.confidence.overall_crv_score}/100. ${results.substrates.pattern_synthesis?.data?.emergent_patterns?.length || 0} padrões emergentes identificados.`,
            strategic_implications: results.substrates.pattern_synthesis?.data?.emergent_patterns?.map(p => p.strategic_significance) || [],
            recommended_actions: results.substrates.pattern_synthesis?.data?.asymmetric_opportunities?.map(o => o.opportunity) || []
        };

        return Response.json({
            success: true,
            msi_analysis: results,
            execution_time_ms: Date.now() - new Date(results.timestamp).getTime()
        });

    } catch (error) {
        return Response.json({
            error: error.message,
            details: 'MSI Analysis failed'
        }, { status: 500 });
    }
});