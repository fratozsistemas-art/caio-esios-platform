import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const MLFLOW_URI = Deno.env.get('MLFLOW_TRACKING_URI');
const MLFLOW_TOKEN = Deno.env.get('MLFLOW_TRACKING_TOKEN');

const mlflowFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(MLFLOW_TOKEN && { 'Authorization': `Bearer ${MLFLOW_TOKEN}` }),
    ...options.headers
  };

  const response = await fetch(`${MLFLOW_URI}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MLflow API error: ${response.status} - ${error}`);
  }

  return response.json();
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'createExperiment': {
        const { name, tags = {} } = data;
        const result = await mlflowFetch('/api/2.0/mlflow/experiments/create', {
          method: 'POST',
          body: JSON.stringify({
            name,
            tags: Object.entries(tags).map(([key, value]) => ({ key, value }))
          })
        });
        return Response.json({ experiment_id: result.experiment_id });
      }

      case 'listExperiments': {
        const result = await mlflowFetch('/api/2.0/mlflow/experiments/search', {
          method: 'POST',
          body: JSON.stringify({
            max_results: data?.max_results || 100
          })
        });
        return Response.json({ experiments: result.experiments || [] });
      }

      case 'getExperiment': {
        const { experiment_id } = data;
        const result = await mlflowFetch(`/api/2.0/mlflow/experiments/get?experiment_id=${experiment_id}`);
        return Response.json({ experiment: result.experiment });
      }

      case 'createRun': {
        const { experiment_id, run_name, tags = {} } = data;
        const result = await mlflowFetch('/api/2.0/mlflow/runs/create', {
          method: 'POST',
          body: JSON.stringify({
            experiment_id,
            run_name,
            tags: Object.entries(tags).map(([key, value]) => ({ key, value }))
          })
        });
        return Response.json({ run: result.run });
      }

      case 'logMetric': {
        const { run_id, key, value, timestamp, step } = data;
        await mlflowFetch('/api/2.0/mlflow/runs/log-metric', {
          method: 'POST',
          body: JSON.stringify({
            run_id,
            key,
            value,
            timestamp: timestamp || Date.now(),
            step: step || 0
          })
        });
        return Response.json({ success: true });
      }

      case 'logParam': {
        const { run_id, key, value } = data;
        await mlflowFetch('/api/2.0/mlflow/runs/log-parameter', {
          method: 'POST',
          body: JSON.stringify({
            run_id,
            key,
            value: String(value)
          })
        });
        return Response.json({ success: true });
      }

      case 'logBatch': {
        const { run_id, metrics = [], params = [], tags = [] } = data;
        await mlflowFetch('/api/2.0/mlflow/runs/log-batch', {
          method: 'POST',
          body: JSON.stringify({
            run_id,
            metrics: metrics.map(m => ({
              key: m.key,
              value: m.value,
              timestamp: m.timestamp || Date.now(),
              step: m.step || 0
            })),
            params: params.map(p => ({
              key: p.key,
              value: String(p.value)
            })),
            tags: tags.map(t => ({
              key: t.key,
              value: t.value
            }))
          })
        });
        return Response.json({ success: true });
      }

      case 'searchRuns': {
        const { experiment_ids, filter, max_results = 100 } = data;
        const result = await mlflowFetch('/api/2.0/mlflow/runs/search', {
          method: 'POST',
          body: JSON.stringify({
            experiment_ids,
            filter,
            max_results
          })
        });
        return Response.json({ runs: result.runs || [] });
      }

      case 'getRun': {
        const { run_id } = data;
        const result = await mlflowFetch(`/api/2.0/mlflow/runs/get?run_id=${run_id}`);
        return Response.json({ run: result.run });
      }

      case 'updateRun': {
        const { run_id, status, end_time } = data;
        await mlflowFetch('/api/2.0/mlflow/runs/update', {
          method: 'POST',
          body: JSON.stringify({
            run_id,
            status,
            end_time
          })
        });
        return Response.json({ success: true });
      }

      case 'deleteRun': {
        const { run_id } = data;
        await mlflowFetch('/api/2.0/mlflow/runs/delete', {
          method: 'POST',
          body: JSON.stringify({ run_id })
        });
        return Response.json({ success: true });
      }

      case 'listModels': {
        const result = await mlflowFetch('/api/2.0/mlflow/registered-models/search', {
          method: 'POST',
          body: JSON.stringify({
            max_results: data?.max_results || 100
          })
        });
        return Response.json({ models: result.registered_models || [] });
      }

      case 'getModelVersions': {
        const { model_name } = data;
        const result = await mlflowFetch('/api/2.0/mlflow/model-versions/search', {
          method: 'POST',
          body: JSON.stringify({
            filter: `name='${model_name}'`
          })
        });
        return Response.json({ versions: result.model_versions || [] });
      }

      case 'transitionModelVersionStage': {
        const { model_name, version, stage, archive_existing_versions = false } = data;
        await mlflowFetch('/api/2.0/mlflow/model-versions/transition-stage', {
          method: 'POST',
          body: JSON.stringify({
            name: model_name,
            version: String(version),
            stage,
            archive_existing_versions
          })
        });
        return Response.json({ success: true });
      }

      case 'updateModelVersion': {
        const { model_name, version, description } = data;
        await mlflowFetch('/api/2.0/mlflow/model-versions/update', {
          method: 'PATCH',
          body: JSON.stringify({
            name: model_name,
            version: String(version),
            description
          })
        });
        return Response.json({ success: true });
      }

      case 'setModelVersionTag': {
        const { model_name, version, key, value } = data;
        await mlflowFetch('/api/2.0/mlflow/model-versions/set-tag', {
          method: 'POST',
          body: JSON.stringify({
            name: model_name,
            version: String(version),
            key,
            value
          })
        });
        return Response.json({ success: true });
      }

      case 'updateRegisteredModel': {
        const { name, description } = data;
        await mlflowFetch('/api/2.0/mlflow/registered-models/update', {
          method: 'PATCH',
          body: JSON.stringify({
            name,
            description
          })
        });
        return Response.json({ success: true });
      }

      case 'setRegisteredModelTag': {
        const { name, key, value } = data;
        await mlflowFetch('/api/2.0/mlflow/registered-models/set-tag', {
          method: 'POST',
          body: JSON.stringify({
            name,
            key,
            value
          })
        });
        return Response.json({ success: true });
      }

      case 'getMetricHistory': {
        const { run_id, metric_key } = data;
        const result = await mlflowFetch(`/api/2.0/mlflow/metrics/get-history?run_id=${run_id}&metric_key=${metric_key}`);
        return Response.json({ metrics: result.metrics || [] });
      }

      case 'listArtifacts': {
        const { run_id, path = '' } = data;
        const result = await mlflowFetch(`/api/2.0/mlflow/artifacts/list?run_id=${run_id}&path=${path}`);
        return Response.json({ artifacts: result.files || [] });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('MLflow client error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});