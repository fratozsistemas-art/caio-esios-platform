import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceId } = await req.json();

    if (!sourceId) {
      return Response.json({ error: 'Source ID is required' }, { status: 400 });
    }

    // Get external data source
    const sources = await base44.entities.ExternalDataSource.filter({ id: sourceId });
    const source = sources[0];

    if (!source) {
      return Response.json({ error: 'Data source not found' }, { status: 404 });
    }

    const data = source.fetched_data;
    const symbol = source.query_params?.symbol;

    if (!data || !symbol) {
      return Response.json({ error: 'No data to sync' }, { status: 400 });
    }

    let nodesCreated = 0;
    let relationshipsCreated = 0;

    // Create or update company node
    const existingCompanyNodes = await base44.entities.GraphCompany.filter({ 
      ticker: symbol 
    });

    let companyNode;

    if (existingCompanyNodes.length > 0) {
      // Update existing
      companyNode = existingCompanyNodes[0];
      await base44.asServiceRole.entities.GraphCompany.update(companyNode.id, {
        name: data.Name || companyNode.name,
        description: data.Description || companyNode.description,
        industry: data.Industry || companyNode.industry,
        sector: data.Sector || companyNode.sector,
        market_cap: parseFloat(data.MarketCapitalization) || companyNode.market_cap,
        country: data.Country || companyNode.country,
        metadata: {
          ...companyNode.metadata,
          alpha_vantage_data: {
            pe_ratio: data.PERatio,
            dividend_yield: data.DividendYield,
            profit_margin: data.ProfitMargin,
            beta: data.Beta,
            eps: data.EPS,
            revenue_per_share: data.RevenuePerShareTTM,
            updated_at: new Date().toISOString()
          }
        }
      });
    } else {
      // Create new
      companyNode = await base44.asServiceRole.entities.GraphCompany.create({
        name: data.Name || symbol,
        ticker: symbol,
        description: data.Description || '',
        industry: data.Industry || 'Unknown',
        sector: data.Sector || 'Unknown',
        market_cap: parseFloat(data.MarketCapitalization) || 0,
        country: data.Country || 'Unknown',
        metadata: {
          alpha_vantage_data: {
            pe_ratio: data.PERatio,
            dividend_yield: data.DividendYield,
            profit_margin: data.ProfitMargin,
            beta: data.Beta,
            eps: data.EPS,
            revenue_per_share: data.RevenuePerShareTTM,
            fetched_at: new Date().toISOString()
          }
        }
      });
      nodesCreated++;
    }

    // Create metric nodes for financial KPIs
    const metrics = [
      { name: 'P/E Ratio', value: data.PERatio, category: 'valuation' },
      { name: 'Profit Margin', value: data.ProfitMargin, category: 'profitability' },
      { name: 'Beta', value: data.Beta, category: 'risk' },
      { name: 'Dividend Yield', value: data.DividendYield, category: 'returns' }
    ];

    for (const metric of metrics) {
      if (metric.value && metric.value !== 'None') {
        const metricNode = await base44.asServiceRole.entities.GraphMetric.create({
          name: `${symbol} - ${metric.name}`,
          metric_type: metric.category,
          value: parseFloat(metric.value) || 0,
          unit: metric.name === 'Dividend Yield' || metric.name === 'Profit Margin' ? 'percentage' : 'ratio',
          source: 'alpha_vantage',
          metadata: {
            symbol: symbol,
            metric_name: metric.name
          }
        });
        nodesCreated++;

        // Create relationship between company and metric
        await base44.asServiceRole.entities.KnowledgeGraphRelationship.create({
          from_node_id: companyNode.id,
          from_node_type: 'company',
          to_node_id: metricNode.id,
          to_node_type: 'metric',
          relationship_type: 'has_metric',
          strength: 1.0,
          metadata: {
            metric_category: metric.category,
            source: 'financial_api'
          }
        });
        relationshipsCreated++;
      }
    }

    // Update the external data source with linked entities
    await base44.asServiceRole.entities.ExternalDataSource.update(sourceId, {
      linked_entities: [
        {
          entity_type: 'GraphCompany',
          entity_id: companyNode.id
        }
      ],
      metadata: {
        ...source.metadata,
        last_sync_at: new Date().toISOString(),
        nodes_created: nodesCreated,
        relationships_created: relationshipsCreated
      }
    });

    return Response.json({
      success: true,
      company_node: companyNode,
      nodes_created: nodesCreated,
      relationships_created: relationshipsCreated,
      message: `Successfully synced ${symbol} financial data to Knowledge Graph`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});