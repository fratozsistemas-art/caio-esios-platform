import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generic secure entity query function
 * Centralizes authorization logic for sensitive entities
 * 
 * Request body:
 * {
 *   entity_name: string,
 *   operation: 'list' | 'get' | 'create' | 'update' | 'delete',
 *   query: object (for list/get operations),
 *   data: object (for create/update operations),
 *   id: string (for get/update/delete operations),
 *   sort: string (for list operations),
 *   limit: number (for list operations)
 * }
 */

// Entity security configuration
const ENTITY_SECURITY_CONFIG = {
  // Critical sensitivity entities
  Conversation: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  ExternalShareLink: { userField: 'created_by_email', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  WorkspaceAccess: { userField: 'user_email', allowedOps: ['list', 'get'], adminOnly: ['create', 'update', 'delete'] },
  DefensePattern: { userField: 'created_by', allowedOps: ['list', 'get'] },
  UserRole: { userField: 'user_email', allowedOps: ['list', 'get'], adminOnly: ['create', 'update', 'delete'] },
  EntityAccess: { userField: 'user_email', allowedOps: ['list', 'get'], adminOnly: ['create', 'update', 'delete'] },
  AgentMemory: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  AgentTrainingDataset: { userField: 'created_by', allowedOps: ['list', 'get'], adminOnly: ['create', 'update', 'delete'] },
  FineTunedAgent: { userField: 'created_by', allowedOps: ['list', 'get'], adminOnly: ['create', 'update', 'delete'] },
  HermesAnalysis: { userField: 'created_by', allowedOps: ['list', 'get', 'create'] },
  CognitiveHealthMetric: { userField: 'created_by', allowedOps: ['list', 'get'] },
  HermesRemediation: { userField: 'created_by', allowedOps: ['list', 'get', 'create'] },
  
  // High sensitivity entities
  ABTestEvent: { userField: 'user_email', allowedOps: ['list', 'get', 'create'] },
  Portfolio: { userField: 'owner_email', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  CrossInsight: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update'] },
  Feedback: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update'] },
  Report: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'delete'] },
  QuickAction: { userField: 'created_by', allowedOps: ['list', 'get'], adminOnly: ['create', 'update', 'delete'] },
  Workspace: { userField: 'owner_email', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  ExternalAccessLog: { userField: 'accessor_email', allowedOps: ['list', 'get', 'create'] },
  Strategy: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  Analysis: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  TSIProject: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  TSIDeliverable: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  KnowledgeGraphNode: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  KnowledgeGraphRelationship: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  ClientArchetype: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  BehavioralProfile: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  EngagementRecord: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update'] },
  VectorDecision: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update'] },
  VectorCheckpoint: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update'] },
  StrategyPlaybook: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update', 'delete'] },
  InstitutionalMemory: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update'] },
  TISAnalysis: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update'] },
  AgentCollaboration: { userField: 'created_by', allowedOps: ['list', 'get', 'create', 'update'] },
  AgentFeedback: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update'] },
  SupportTicket: { userField: 'user_email', allowedOps: ['list', 'get', 'create', 'update'] },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const { entity_name, operation, query = {}, data = {}, id, sort, limit } = await req.json();

    // Validate entity is configured for secure access
    const securityConfig = ENTITY_SECURITY_CONFIG[entity_name];
    if (!securityConfig) {
      return Response.json({ 
        error: 'Entity not configured for secure access',
        entity: entity_name 
      }, { status: 400 });
    }

    // Check if operation is allowed
    const isAdmin = user.role === 'admin';
    const isAdminOnlyOp = securityConfig.adminOnly?.includes(operation);
    
    if (isAdminOnlyOp && !isAdmin) {
      return Response.json({ 
        error: 'Admin privileges required for this operation',
        operation 
      }, { status: 403 });
    }

    if (!securityConfig.allowedOps.includes(operation) && !isAdminOnlyOp) {
      return Response.json({ 
        error: 'Operation not allowed for this entity',
        operation 
      }, { status: 403 });
    }

    // Get the user field for this entity
    const userField = securityConfig.userField;
    const userIdentifier = userField === 'user_email' || userField === 'owner_email' || 
                          userField === 'created_by_email' || userField === 'accessor_email'
      ? user.email
      : user.id;

    // Execute operation with security filters
    let result;

    switch (operation) {
      case 'list': {
        // Inject user filter for non-admin users
        const secureQuery = isAdmin ? query : { ...query, [userField]: userIdentifier };
        result = await base44.asServiceRole.entities[entity_name].list(sort || '-created_date', limit || 100, secureQuery);
        break;
      }

      case 'get': {
        if (!id) {
          return Response.json({ error: 'ID required for get operation' }, { status: 400 });
        }
        // Get the record
        const record = await base44.asServiceRole.entities[entity_name].get(id);
        
        // Verify user owns this record (unless admin)
        if (!isAdmin && record && record[userField] !== userIdentifier) {
          return Response.json({ error: 'Access denied to this record' }, { status: 403 });
        }
        
        result = record;
        break;
      }

      case 'create': {
        // Inject user field into data
        const secureData = { ...data, [userField]: userIdentifier };
        result = await base44.asServiceRole.entities[entity_name].create(secureData);
        break;
      }

      case 'update': {
        if (!id) {
          return Response.json({ error: 'ID required for update operation' }, { status: 400 });
        }
        
        // Get the record first to verify ownership
        const existingRecord = await base44.asServiceRole.entities[entity_name].get(id);
        
        if (!existingRecord) {
          return Response.json({ error: 'Record not found' }, { status: 404 });
        }
        
        // Verify user owns this record (unless admin)
        if (!isAdmin && existingRecord[userField] !== userIdentifier) {
          return Response.json({ error: 'Access denied to update this record' }, { status: 403 });
        }
        
        // Don't allow changing the user field
        const secureData = { ...data };
        delete secureData[userField];
        
        result = await base44.asServiceRole.entities[entity_name].update(id, secureData);
        break;
      }

      case 'delete': {
        if (!id) {
          return Response.json({ error: 'ID required for delete operation' }, { status: 400 });
        }
        
        // Get the record first to verify ownership
        const existingRecord = await base44.asServiceRole.entities[entity_name].get(id);
        
        if (!existingRecord) {
          return Response.json({ error: 'Record not found' }, { status: 404 });
        }
        
        // Verify user owns this record (unless admin)
        if (!isAdmin && existingRecord[userField] !== userIdentifier) {
          return Response.json({ error: 'Access denied to delete this record' }, { status: 403 });
        }
        
        result = await base44.asServiceRole.entities[entity_name].delete(id);
        break;
      }

      default:
        return Response.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return Response.json({
      success: true,
      operation,
      entity: entity_name,
      data: result
    });

  } catch (error) {
    console.error('secureEntityQuery error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    }, { status: 500 });
  }
});