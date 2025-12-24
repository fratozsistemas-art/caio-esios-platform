import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ForceGraph2D from 'react-force-graph-2d';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

function StrategicFactsGraph({ facts }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Create topic nodes
    const topics = new Map();
    facts.forEach(fact => {
      if (!topics.has(fact.topic_id)) {
        topics.set(fact.topic_id, {
          id: fact.topic_id,
          label: fact.topic_label,
          type: 'topic',
          count: 1,
          facts: [fact]
        });
      } else {
        const topic = topics.get(fact.topic_id);
        topic.count++;
        topic.facts.push(fact);
      }
    });

    topics.forEach(topic => {
      nodes.push({
        id: topic.id,
        name: topic.label,
        type: 'topic',
        val: Math.sqrt(topic.count) * 3,
        color: '#00D4FF',
        facts: topic.facts
      });
      nodeMap.set(topic.id, topic);
    });

    // Create dimension nodes and link to topics
    const dimensions = new Map();
    facts.forEach(fact => {
      const dimKey = `${fact.topic_id}_${fact.dimension}`;
      if (!dimensions.has(dimKey)) {
        dimensions.set(dimKey, {
          id: dimKey,
          label: fact.dimension,
          type: 'dimension',
          topic_id: fact.topic_id,
          facts: [fact]
        });
      } else {
        dimensions.get(dimKey).facts.push(fact);
      }
    });

    dimensions.forEach(dim => {
      nodes.push({
        id: dim.id,
        name: dim.label,
        type: 'dimension',
        val: 2,
        color: '#8B5CF6',
        facts: dim.facts
      });
      
      links.push({
        source: dim.topic_id,
        target: dim.id,
        value: dim.facts.length
      });
    });

    // Create tag nodes
    const tags = new Map();
    facts.forEach(fact => {
      (fact.tags || []).forEach(tag => {
        const tagKey = `tag_${tag}`;
        if (!tags.has(tagKey)) {
          tags.set(tagKey, {
            id: tagKey,
            label: tag,
            type: 'tag',
            facts: [fact],
            topics: new Set([fact.topic_id])
          });
        } else {
          const tagNode = tags.get(tagKey);
          tagNode.facts.push(fact);
          tagNode.topics.add(fact.topic_id);
        }
      });
    });

    tags.forEach(tag => {
      nodes.push({
        id: tag.id,
        name: tag.label,
        type: 'tag',
        val: 1.5,
        color: '#F43F5E',
        facts: tag.facts
      });

      // Link tags to topics they appear in
      tag.topics.forEach(topicId => {
        links.push({
          source: topicId,
          target: tag.id,
          value: 1
        });
      });
    });

    return { nodes, links };
  }, [facts]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    
    // Highlight connected nodes
    const connectedNodes = new Set([node.id]);
    const connectedLinks = new Set();
    
    graphData.links.forEach(link => {
      if (link.source.id === node.id || link.source === node.id) {
        connectedNodes.add(link.target.id || link.target);
        connectedLinks.add(link);
      }
      if (link.target.id === node.id || link.target === node.id) {
        connectedNodes.add(link.source.id || link.source);
        connectedLinks.add(link);
      }
    });
    
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);
  };

  const paintNode = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Inter`;
    
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const opacity = isHighlighted ? 1 : 0.3;
    
    // Draw node circle
    ctx.fillStyle = node.color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, node.x, node.y + node.val + fontSize);
    ctx.globalAlpha = 1;
  };

  const paintLink = (link, ctx) => {
    const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link);
    ctx.strokeStyle = isHighlighted ? 'rgba(0, 212, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = isHighlighted ? 2 : 1;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              Knowledge Graph
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-cyan-500/20 text-cyan-400">
                {graphData.nodes.length} nodes
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400">
                {graphData.links.length} connections
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-slate-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <ForceGraph2D
              graphData={graphData}
              nodeLabel="name"
              nodeCanvasObject={paintNode}
              linkCanvasObject={paintLink}
              onNodeClick={handleNodeClick}
              backgroundColor="#0F172A"
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleSpeed={0.005}
              cooldownTicks={100}
              onEngineStop={() => {}}
            />
          </div>
        </CardContent>
      </Card>

      {selectedNode && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {selectedNode.type === 'topic' && '📊'}
              {selectedNode.type === 'dimension' && '🔍'}
              {selectedNode.type === 'tag' && '🏷️'}
              {selectedNode.name}
            </CardTitle>
            <Badge className="w-fit">{selectedNode.type}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-300">
              <strong>{selectedNode.facts?.length || 0}</strong> facts associated
            </div>
            
            {selectedNode.facts && selectedNode.facts.slice(0, 3).map((fact, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded p-3">
                <p className="text-white text-sm font-medium mb-1">{fact.summary}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    {fact.status}
                  </Badge>
                  <span>Confidence: {(fact.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
            
            {selectedNode.facts && selectedNode.facts.length > 3 && (
              <p className="text-xs text-slate-400">
                + {selectedNode.facts.length - 3} more facts
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

StrategicFactsGraph.propTypes = {
  facts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    topic_id: PropTypes.string,
    topic_label: PropTypes.string,
    dimension: PropTypes.string,
    summary: PropTypes.string,
    detail: PropTypes.string,
    status: PropTypes.string,
    confidence: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string)
  })).isRequired
};

export default StrategicFactsGraph;