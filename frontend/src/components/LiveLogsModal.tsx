import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Copy, Check, Download, Search } from 'lucide-react';
import type { Build, Pipeline } from '../types/pipeline';

interface LiveLogsModalProps {
  pipeline: Pipeline;
  build: Build;
  onClose: () => void;
}

export const LiveLogsModal: React.FC<LiveLogsModalProps> = ({
  pipeline,
  build,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [build.logs, autoScroll]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(build.logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const element = document.createElement('a');
    const file = new Blob([build.logs.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${pipeline.name}-build-${build.buildNumber}.log`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getLineClass = (line: string) => {
    const upper = line.toUpperCase();
    if (upper.includes('[ERROR]') || upper.includes('FAIL') || upper.includes('ERROR:')) return 'terminal-line error';
    if (upper.includes('[SUCCESS]') || upper.includes('PASS') || upper.includes('200 OK')) return 'terminal-line success';
    if (upper.includes('[DOCKER]')) return 'terminal-line docker';
    if (upper.includes('[SECURITY]')) return 'terminal-line security';
    if (upper.includes('[CHECKOUT]')) return 'terminal-line checkout';
    return 'terminal-line info';
  };

  const filteredLogs = build.logs.filter((line) =>
    line.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Terminal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div style={{ display: 'flex', gap: '6px', marginRight: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }}></span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            </div>
            <Terminal size={18} color="#818cf8" />
            <h3>{pipeline.name} : Console Output (Build #{build.buildNumber})</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close logs">
            <X size={20} />
          </button>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body">
          {filteredLogs.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
              No log messages matching "{searchTerm}"
            </div>
          ) : (
            filteredLogs.map((line, idx) => (
              <div key={idx} className={getLineClass(line)}>
                <span>{line}</span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Toolbar */}
        <div className="terminal-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Search console logs..."
              className="terminal-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setAutoScroll(!autoScroll)}
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
            >
              Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleCopyLogs}
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleDownloadLogs}
              style={{ fontSize: '0.78rem', padding: '6px 10px' }}
            >
              <Download size={14} />
              <span>Save .log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
