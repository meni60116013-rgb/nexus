/**
 * V-CORE SENTINEL - INTELLECTUAL PROPERTY & SECURITY LAYER
 * Copyright (c) 2026 Nexus V-Core Systems. All rights reserved.
 * Protected against unauthorized duplication, reverse engineering, and plagiarism.
 */

export const LICENSE_INFO = {
  system: "Suite V-Core Sentinel",
  owner: "meni60116013-rgb@gmail.com",
  status: "PROPRIETARY_REGISTERED",
  buildHash: "VC-" + Math.random().toString(36).substring(2, 10).toUpperCase()
};

export function injectWatermark(container) {
  const badge = document.createElement('div');
  badge.id = 'vcore-security-badge';
  badge.style.cssText = `
    position: absolute;
    bottom: 12px;
    left: 12px;
    font-size: 10px;
    color: #8b949e;
    font-family: monospace;
    background: rgba(22, 27, 34, 0.85);
    padding: 6px 10px;
    border: 1px solid #30363d;
    border-radius: 4px;
    pointer-events: none;
    z-index: 1000;
  `;
  badge.innerHTML = `PROPIEDAD INTELECTUAL REGISTRADA | ${LICENSE_INFO.buildHash}`;
  container.appendChild(badge);
}
