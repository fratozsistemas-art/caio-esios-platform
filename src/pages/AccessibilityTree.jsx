"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Network, ChevronRight, ChevronDown, Search, AlertTriangle, CheckCircle,
  Eye, Code, Layers, Info, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * A11Y analysis util – deixei fora do componente para não recriar a função o tempo todo
 */
function analyzeAccessibility(element) {
  const issues = [];

  if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
    issues.push({ type: 'error', message: 'Image missing alt attribute' });
  }

  if (element.tagName === 'BUTTON' && !element.textContent && !element.getAttribute('aria-label')) {
    issues.push({ type: 'error', message: 'Button has no accessible name' });
  }

  if (element.tagName === 'A' && !element.textContent && !element.getAttribute('aria-label')) {
    issues.push({ type: 'error', message: 'Link has no accessible text' });
  }

  if (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) &&
    !element.getAttribute('aria-label') &&
    !element.getAttribute('aria-labelledby') &&
    !(element.id && document.querySelector(`label[for="${element.id}"]`))
  ) {
    issues.push({ type: 'warning', message: 'Form control missing label' });
  }

  const ariaAttributes = Array.from(element.attributes).filter((attr) =>
    attr.name.startsWith('aria-')
  );

  if (ariaAttributes.length > 0) {
    issues.push({
      type: 'info',
      message: `Has ${ariaAttributes.length} ARIA attribute(s)`,
      attributes: ariaAttributes.map((a) => a.name),
    });
  }

  return issues;
}

/**
 * Gera snapshot "AI-friendly" a partir da árvore DOM que você já construiu
 * Ponto central para ligar o LLM à UI.
 */
function buildAgentSnapshotFromDomTree(rootNode) {
  if (!rootNode) return null;

  const elements = [];

  const visit = (node) => {
    if (!node.element) return;

    const el = node.element;
    const aiId = el.getAttribute("data-ai-id");

    if (aiId) {
      const rect = el.getBoundingClientRect();

      // role: prioriza data-ai-role, depois role nativo
      const role =
        el.getAttribute("data-ai-role") ||
        el.getAttribute("role") ||
        node.ariaRole ||
        null;

      // label: aria-label > aria-labelledby > texto
      let label = el.getAttribute("aria-label");
      if (!label) {
        const ariaLabelledby = el.getAttribute("aria-labelledby");
        if (ariaLabelledby) {
          const labelledEl = document.getElementById(ariaLabelledby);
          if (labelledEl) label = labelledEl.textContent?.trim() || null;
        }
      }
      if (!label) {
        label = node.ariaLabel || el.textContent?.trim() || null;
      }

      let value = null;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      ) {
        value = el.value;
      }

      const disabled =
        el.disabled ??
        el.getAttribute("aria-disabled") === "true" ??
        false;

      const visible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== "hidden";

      elements.push({
        id: aiId,
        tag: node.tag,
        role,
        label,
        value,
        visible,
        disabled,
      });
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(visit);
    }
  };

  visit(rootNode);

  const screenEl = document.querySelector("[data-ai-screen]");
  const screen = screenEl?.getAttribute("data-ai-screen") || null;

  return { screen, elements };
}

function DOMTreeNode({
  node,
  depth = 0,
  searchTerm,
  onSelectNode,
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [a11yIssues, setA11yIssues] = useState([]);

  useEffect(() => {
    if (node.element) {
      const issues = analyzeAccessibility(node.element);
      setA11yIssues(issues);
    }
  }, [node.element]);

  const matchesSearch = (node, term) => {
    if (!term) return true;
    const lowerTerm = term.toLowerCase();
    return (
      node.tag?.toLowerCase().includes(lowerTerm) ||
      node.id?.toLowerCase().includes(lowerTerm) ||
      node.classes?.some((c) => c.toLowerCase().includes(lowerTerm)) ||
      node.ariaRole?.toLowerCase().includes(lowerTerm) ||
      node.ariaLabel?.toLowerCase().includes(lowerTerm)
    );
  };

  const isMatch = matchesSearch(node, searchTerm);
  const hasMatchingChildren = node.children?.some((child) =>
    matchesSearch(child, searchTerm)
  );

  if (!isMatch && !hasMatchingChildren) return null;

  const hasChildren = node.children && node.children.length > 0;
  const indentLevel = depth * 20;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer transition-colors group ${
          isMatch ? "bg-[#C7A763]/10" : ""
        }`}
        style={{ paddingLeft: `${indentLevel + 8}px` }}
        onClick={() => {
          if (hasChildren) setIsExpanded(!isExpanded);
          onSelectNode(node);
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-white/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <Code className="w-3 h-3 text-blue-400 flex-shrink-0" />
        <span className="text-sm font-mono text-blue-400">{node.tag}</span>

        {node.id && (
          <span className="text-sm font-mono text-green-400">#{node.id}</span>
        )}

        {node.classes && node.classes.length > 0 && (
          <span className="text-sm font-mono text-yellow-400">
            .{node.classes.slice(0, 2).join(".")}
            {node.classes.length > 2 && "..."}
          </span>
        )}

        {node.ariaRole && (
          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
            role={node.ariaRole}
          </Badge>
        )}

        {a11yIssues.length > 0 && (
          <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            {a11yIssues.some((i) => i.type === "error") && (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            {a11yIssues.some((i) => i.type === "warning") && (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
            {a11yIssues.some((i) => i.type === "info") && (
              <Info className="w-4 h-4 text-blue-400" />
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child, idx) => (
              <DOMTreeNode
                key={`${child.tag}-${idx}`}
                node={child}
                depth={depth + 1}
                searchTerm={searchTerm}
                onSelectNode={onSelectNode}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NodeInspector({ node }) {
  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-center text-slate-400">
        <div>
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a node to inspect</p>
        </div>
      </div>
    );
  }

  const element = node.element;
  const computedStyle =
    element && typeof window !== "undefined"
      ? window.getComputedStyle(element)
      : null;
  const ariaAttributes =
    element && element.attributes
      ? Array.from(element.attributes).filter((attr) =>
          attr.name.startsWith("aria-")
        )
      : [];

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-400" />
            Element Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Tag:</span>
            <span className="text-white font-mono">{node.tag}</span>
          </div>
          {node.id && (
            <div className="flex justify-between">
              <span className="text-slate-400">ID:</span>
              <span className="text-green-400 font-mono">{node.id}</span>
            </div>
          )}
          {node.classes && node.classes.length > 0 && (
            <div>
              <span className="text-slate-400 block mb-1">Classes:</span>
              <div className="flex flex-wrap gap-1">
                {node.classes.map((cls, idx) => (
                  <Badge
                    key={idx}
                    className="bg-yellow-500/20 text-yellow-400 text-xs font-mono"
                  >
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {ariaAttributes.length > 0 && (
        <Card className="bg-white/5 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              ARIA Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ariaAttributes.map((attr, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-purple-400 font-mono">
                  {attr.name}:
                </span>
                <span className="text-white">{attr.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {computedStyle && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Computed Styles (Key)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            {["display", "position", "width", "height", "opacity", "z-index"].map(
              (prop) => (
                <div key={prop} className="flex justify-between font-mono">
                  <span className="text-slate-400">{prop}:</span>
                  <span className="text-cyan-400">
                    {computedStyle[prop]}
                  </span>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AccessibilityTree() {
  const [domTree, setDomTree] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [stats, setStats] = useState({ total: 0, withAria: 0, issues: 0 });
  const [agentSnapshot, setAgentSnapshot] = useState(null);

  const buildDOMTree = (
    element,
    maxDepth = 10,
    currentDepth = 0
  ) => {
    if (currentDepth > maxDepth) return null;

    const el = element;

    const node = {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      classes: Array.from(el.classList),
      ariaRole: el.getAttribute("role") || null,
      ariaLabel: el.getAttribute("aria-label") || null,
      element: el,
      children: [],
    };

    Array.from(el.children).forEach((child) => {
      const childNode = buildDOMTree(child, maxDepth, currentDepth + 1);
      if (childNode) node.children.push(childNode);
    });

    return node;
  };

  const scanDOM = () => {
    const rootElement =
      document.querySelector("#root") || document.body;
    const tree = buildDOMTree(rootElement);
    setDomTree(tree);

    const allElements = document.querySelectorAll("*");
    const withAria = document.querySelectorAll(
      "[aria-label], [aria-labelledby], [role]"
    );
    const imagesWithoutAlt = document.querySelectorAll("img:not([alt])");
    const buttonsWithoutLabel = Array.from(
      document.querySelectorAll("button")
    ).filter(
      (btn) =>
        !btn.textContent &&
        !btn.getAttribute("aria-label")
    );

    setStats({
      total: allElements.length,
      withAria: withAria.length,
      issues: imagesWithoutAlt.length + buttonsWithoutLabel.length,
    });

    setAgentSnapshot(null);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      scanDOM();
    }
  }, []);

  const handleGenerateAgentSnapshot = () => {
    if (!domTree) return;
    const snapshot = buildAgentSnapshotFromDomTree(domTree);
    if (!snapshot) return;

    setAgentSnapshot(snapshot);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          DOM, Accessibility & AI Snapshot
        </h1>
        <p className="text-slate-400 mt-1">
          Inspect DOM structure, accessibility & expose AI-friendly UI snapshot
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Total Elements</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {stats.withAria}
            </p>
            <p className="text-xs text-slate-400">With ARIA</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-red-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.issues}</p>
            <p className="text-xs text-slate-400">Potential Issues</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">Agent Snapshot</p>
            <p className="text-sm font-mono text-cyan-400">
              {agentSnapshot
                ? `${agentSnapshot.elements.length} elements`
                : "Not generated"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  DOM Tree
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={scanDOM}
                    variant="outline"
                    className="border-white/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Rescan
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGenerateAgentSnapshot}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Generate Agent Snapshot
                  </Button>
                </div>
              </div>
              <div className="relative mt-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by tag, id, class, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {domTree ? (
                <DOMTreeNode
                  node={domTree}
                  searchTerm={searchTerm}
                  onSelectNode={setSelectedNode}
                />
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Scanning DOM...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {agentSnapshot && (
            <Card className="bg-black/40 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-sm text-cyan-300 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Agent UI Snapshot (JSON enviado ao modelo)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-cyan-100 bg-black/60 p-3 rounded-lg overflow-x-auto max-h-64">
                  {JSON.stringify(agentSnapshot, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Inspector
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NodeInspector node={selectedNode} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}