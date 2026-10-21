import base64 from "../../content/tools/base64.json";
import colour from "../../content/tools/colour.json";
import edge from "../../content/tools/edge.json";
import json from "../../content/tools/json.json";
import regex from "../../content/tools/regex.json";

export interface ToolDef {
  id: string;
  title: string;
  name: string;
  index: string;
  label: string;
  hint: string;
  desc: string;
  accent: string;
  glow: string;
  keywords: string;
}

export const DEV_TOOLS: ToolDef[] = [
  json,
  regex,
  colour,
  edge,
  base64,
] as ToolDef[];

const TOOL_MAP = new Map(DEV_TOOLS.map((t) => [t.id, t]));

export function getTool(id: string): ToolDef {
  const tool = TOOL_MAP.get(id);
  if (!tool) throw new Error(`Unknown tool id: ${id}`);
  return tool;
}
