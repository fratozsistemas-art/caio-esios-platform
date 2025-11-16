import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { profile_id } = await req.json();

        if (!profile_id) {
            return Response.json({ error: 'profile_id is required' }, { status: 400 });
        }

        // Get behavioral profile
        const profiles = await base44.entities.BehavioralProfile.filter({ id: profile_id });
        if (!profiles || profiles.length === 0) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profiles[0];

        // Get all engagement records for this profile
        const engagements = await base44.entities.EngagementRecord.filter({
            behavioral_profile_id: profile_id
        });

        // Calculate predictive metrics
        const predictions = {
            churn_risk: calculateChurnRisk(profile, engagements),
            predicted_needs: await predictNextNeeds(profile, engagements, base44),
            engagement_recommendations: generateRecommendations(profile, engagements),
            optimal_next_timing: calculateOptimalTiming(engagements),
            satisfaction_trend: calculateSatisfactionTrend(engagements),
            confidence_trajectory: calculateConfidenceTrajectory(profile, engagements)
        };

        return Response.json({
            success: true,
            profile_id,
            predictions
        });

    } catch (error) {
        console.error('Prediction error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});

// Calculate churn risk based on engagement patterns
function calculateChurnRisk(profile, engagements) {
    const factors = {
        engagement_recency: 0,
        satisfaction_trend: 0,
        confidence_decline: 0,
        behavioral_inconsistency: 0,
        unmet_expectations: 0
    };

    // 1. Engagement recency (30% weight)
    if (profile.last_engagement_date) {
        const daysSince = Math.floor((Date.now() - new Date(profile.last_engagement_date)) / (1000 * 60 * 60 * 24));
        if (daysSince > 180) factors.engagement_recency = 30;
        else if (daysSince > 90) factors.engagement_recency = 20;
        else if (daysSince > 60) factors.engagement_recency = 10;
    } else {
        factors.engagement_recency = 30;
    }

    // 2. Satisfaction trend (25% weight)
    const recentEngagements = engagements
        .filter(e => e.client_satisfaction)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
        .slice(0, 3);

    if (recentEngagements.length >= 2) {
        const avgRecent = recentEngagements.reduce((sum, e) => sum + e.client_satisfaction, 0) / recentEngagements.length;
        if (avgRecent < 3) factors.satisfaction_trend = 25;
        else if (avgRecent < 3.5) factors.satisfaction_trend = 15;
        else if (avgRecent < 4) factors.satisfaction_trend = 8;
    }

    // 3. Confidence decline (20% weight)
    if (profile.archetype_confidence < 60) {
        factors.confidence_decline = 20;
    } else if (profile.archetype_confidence < 70) {
        factors.confidence_decline = 10;
    }

    // 4. Behavioral inconsistency (15% weight)
    if (profile.behavioral_consistency < 60) {
        factors.behavioral_inconsistency = 15;
    } else if (profile.behavioral_consistency < 75) {
        factors.behavioral_inconsistency = 8;
    }

    // 5. Unmet expectations (10% weight)
    const unresolvedIssues = engagements.filter(e => e.objectives_achieved === false).length;
    if (unresolvedIssues > 2) factors.unmet_expectations = 10;
    else if (unresolvedIssues > 0) factors.unmet_expectations = 5;

    const totalRisk = Object.values(factors).reduce((sum, val) => sum + val, 0);

    return {
        risk_score: totalRisk,
        risk_level: totalRisk > 60 ? 'HIGH' : totalRisk > 30 ? 'MEDIUM' : 'LOW',
        factors,
        primary_concerns: Object.entries(factors)
            .filter(([_, value]) => value > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, _]) => key.replace(/_/g, ' '))
    };
}

// Predict next client needs using AI
async function predictNextNeeds(profile, engagements, base44) {
    const recentEngagements = engagements
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
        .slice(0, 5);

    const prompt = `Analyze this client's behavioral profile and predict their next strategic needs.

CLIENT PROFILE:
- Name: ${profile.client_name}
- Organization: ${profile.organization_name}
- Industry: ${profile.industry}
- Stage: ${profile.company_stage}
- Primary Archetype: ${profile.primary_archetype_id || 'Unknown'}
- Total Engagements: ${profile.total_engagements}
- Archetype Confidence: ${profile.archetype_confidence}%
- Behavioral Consistency: ${profile.behavioral_consistency}%

RECENT ENGAGEMENTS (${recentEngagements.length}):
${recentEngagements.map((e, idx) => `
${idx + 1}. ${e.engagement_type} - ${e.primary_objective}
   - Frameworks: ${e.frameworks_applied?.join(', ') || 'None'}
   - Satisfied: ${e.objectives_achieved ? 'Yes' : 'No'}
   - Rating: ${e.client_satisfaction || 'N/A'}/5
   - Deviations: ${e.archetype_deviations?.join(', ') || 'None'}
`).join('\n')}

STRATEGIC CONTEXT:
- Challenges: ${profile.strategic_context?.primary_challenges?.join(', ') || 'Unknown'}
- Goals: ${profile.strategic_context?.strategic_goals?.join(', ') || 'Unknown'}

---

Predict the client's next 3-5 strategic needs with confidence scores.

IMPORTANT: Return ONLY valid JSON, no markdown.
Format:
{
  "predicted_needs": [
    {
      "need": "Clear description",
      "confidence": 85,
      "rationale": "Why this is likely",
      "timing": "1-3 months",
      "recommended_frameworks": ["ABRA", "NIA"],
      "suggested_approach": "How to position"
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
            type: "object",
            properties: {
                predicted_needs: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            need: { type: "string" },
                            confidence: { type: "number" },
                            rationale: { type: "string" },
                            timing: { type: "string" },
                            recommended_frameworks: {
                                type: "array",
                                items: { type: "string" }
                            },
                            suggested_approach: { type: "string" }
                        }
                    }
                }
            }
        }
    });

    return result.predicted_needs || [];
}

// Generate actionable recommendations
function generateRecommendations(profile, engagements) {
    const recommendations = [];

    // Recency-based recommendations
    if (profile.last_engagement_date) {
        const daysSince = Math.floor((Date.now() - new Date(profile.last_engagement_date)) / (1000 * 60 * 60 * 24));
        
        if (daysSince > 180) {
            recommendations.push({
                type: 'URGENT',
                category: 'Re-engagement',
                action: 'Schedule immediate check-in call',
                rationale: `No contact for ${daysSince} days - pattern drift risk critical`,
                priority: 'critical'
            });
        } else if (daysSince > 90) {
            recommendations.push({
                type: 'PROACTIVE',
                category: 'Re-engagement',
                action: 'Send value-add content or industry insights',
                rationale: `${daysSince} days since last contact - maintain top-of-mind`,
                priority: 'high'
            });
        }
    }

    // Confidence-based recommendations
    if (profile.archetype_confidence < 70 && profile.total_engagements >= 2) {
        recommendations.push({
            type: 'VALIDATION',
            category: 'Profile Refinement',
            action: 'Schedule archetype validation session',
            rationale: `Low confidence (${profile.archetype_confidence}%) after ${profile.total_engagements} engagements`,
            priority: 'medium'
        });
    }

    // Satisfaction-based recommendations
    const recentSatisfaction = engagements
        .filter(e => e.client_satisfaction)
        .slice(0, 3);

    if (recentSatisfaction.length > 0) {
        const avgSat = recentSatisfaction.reduce((sum, e) => sum + e.client_satisfaction, 0) / recentSatisfaction.length;
        
        if (avgSat < 3.5) {
            recommendations.push({
                type: 'IMPROVEMENT',
                category: 'Service Quality',
                action: 'Conduct satisfaction deep-dive interview',
                rationale: `Average satisfaction ${avgSat.toFixed(1)}/5 below target`,
                priority: 'high'
            });
        }
    }

    // Success-based recommendations
    const unresolvedCount = engagements.filter(e => e.objectives_achieved === false).length;
    if (unresolvedCount > 2) {
        recommendations.push({
            type: 'STRATEGIC',
            category: 'Value Delivery',
            action: 'Review and adjust engagement approach',
            rationale: `${unresolvedCount} engagements with unmet objectives`,
            priority: 'high'
        });
    }

    // Proactive upsell opportunities
    if (profile.relationship_intelligence?.trust_level >= 4 && profile.total_engagements >= 3) {
        recommendations.push({
            type: 'OPPORTUNITY',
            category: 'Relationship Expansion',
            action: 'Propose strategic advisor retainer',
            rationale: 'High trust + proven track record = upsell ready',
            priority: 'medium'
        });
    }

    return recommendations;
}

// Calculate optimal next engagement timing
function calculateOptimalTiming(engagements) {
    if (engagements.length < 2) {
        return {
            suggested_date: 'Within 30 days',
            confidence: 50,
            rationale: 'Insufficient history - default cadence'
        };
    }

    // Calculate average time between engagements
    const sortedEngagements = engagements
        .filter(e => e.started_at)
        .sort((a, b) => new Date(a.started_at) - new Date(b.started_at));

    const intervals = [];
    for (let i = 1; i < sortedEngagements.length; i++) {
        const days = Math.floor(
            (new Date(sortedEngagements[i].started_at) - new Date(sortedEngagements[i-1].started_at)) 
            / (1000 * 60 * 60 * 24)
        );
        intervals.push(days);
    }

    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const lastEngagement = new Date(sortedEngagements[sortedEngagements.length - 1].started_at);
    const suggestedNext = new Date(lastEngagement.getTime() + avgInterval * 24 * 60 * 60 * 1000);

    return {
        suggested_date: suggestedNext.toISOString().split('T')[0],
        avg_interval_days: Math.round(avgInterval),
        confidence: intervals.length >= 3 ? 80 : 60,
        rationale: `Based on ${intervals.length} historical intervals (avg ${Math.round(avgInterval)} days)`
    };
}

// Calculate satisfaction trend
function calculateSatisfactionTrend(engagements) {
    const withSatisfaction = engagements
        .filter(e => e.client_satisfaction)
        .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));

    if (withSatisfaction.length < 2) {
        return { trend: 'STABLE', direction: 'neutral', confidence: 0 };
    }

    const recent = withSatisfaction.slice(-3);
    const older = withSatisfaction.slice(0, -3);

    if (older.length === 0) {
        return { trend: 'STABLE', direction: 'neutral', confidence: 50 };
    }

    const recentAvg = recent.reduce((sum, e) => sum + e.client_satisfaction, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.client_satisfaction, 0) / older.length;

    const delta = recentAvg - olderAvg;

    return {
        trend: delta > 0.3 ? 'IMPROVING' : delta < -0.3 ? 'DECLINING' : 'STABLE',
        direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
        recent_avg: Math.round(recentAvg * 10) / 10,
        historical_avg: Math.round(olderAvg * 10) / 10,
        delta: Math.round(delta * 10) / 10,
        confidence: withSatisfaction.length >= 5 ? 85 : 65
    };
}

// Calculate confidence trajectory
function calculateConfidenceTrajectory(profile, engagements) {
    const withConfidence = engagements
        .filter(e => e.confirmation_rate !== undefined)
        .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));

    if (withConfidence.length < 2) {
        return { 
            trajectory: 'STABLE', 
            current: profile.archetype_confidence || 50,
            projected_30d: profile.archetype_confidence || 50,
            confidence: 0 
        };
    }

    const confirmationRates = withConfidence.map(e => e.confirmation_rate);
    const avgRate = confirmationRates.reduce((sum, val) => sum + val, 0) / confirmationRates.length;

    // Simple linear regression
    const slope = confirmationRates.length >= 3 
        ? (confirmationRates[confirmationRates.length - 1] - confirmationRates[0]) / confirmationRates.length
        : 0;

    const projected = Math.max(0, Math.min(100, profile.archetype_confidence + slope * 3));

    return {
        trajectory: slope > 2 ? 'IMPROVING' : slope < -2 ? 'DECLINING' : 'STABLE',
        current: profile.archetype_confidence || 50,
        projected_30d: Math.round(projected),
        avg_confirmation_rate: Math.round(avgRate),
        confidence: withConfidence.length >= 5 ? 80 : 60
    };
}