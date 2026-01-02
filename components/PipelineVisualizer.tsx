
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PipelineVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 300;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = [
      { id: 'BG-Wiki', x: 100, y: 100, color: '#38bdf8' },
      { id: 'FFXiclopedia', x: 100, y: 200, color: '#818cf8' },
      { id: 'Aggregator (Python)', x: 350, y: 150, color: '#f59e0b' },
      { id: 'Gemini AI Validator', x: 550, y: 150, color: '#10b981' },
      { id: 'Firestore DB', x: 750, y: 150, color: '#ef4444' },
    ];

    const links = [
      { source: nodes[0], target: nodes[2] },
      { source: nodes[1], target: nodes[2] },
      { source: nodes[2], target: nodes[3] },
      { source: nodes[3], target: nodes[4] },
    ];

    // Links
    svg.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .append('animate')
      .attr('attributeName', 'stroke-dashoffset')
      .attr('values', '20;0')
      .attr('dur', '1s')
      .attr('repeatCount', 'indefinite');

    // Nodes
    const g = svg.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    g.append('circle')
      .attr('r', 35)
      .attr('fill', d => d.color)
      .attr('opacity', 0.2);

    g.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.color);

    g.append('text')
      .text(d => d.id)
      .attr('dy', 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .attr('font-weight', '500');

  }, []);

  return (
    <div className="w-full h-[400px] glass rounded-xl flex items-center justify-center overflow-hidden">
      <svg ref={svgRef} width="800" height="300" viewBox="0 0 800 300"></svg>
    </div>
  );
};

export default PipelineVisualizer;
