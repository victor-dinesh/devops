import React from 'react';
import { X, ShieldCheck, ShieldAlert, Wrench } from 'lucide-react';
import type { Build, Pipeline } from '../types/pipeline';

interface SecurityScanModalProps {
  pipeline: Pipeline;
  build: Build;
  onClose: () => void;
}

export const SecurityScanModal: React.FC<SecurityScanModalProps> = ({
  pipeline,
  build,
  onClose,
}) => {
  const { securitySummary } = build;
  const vulns = securitySummary?.vulnerabilities || [];

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-window" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 840 }}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            {securitySummary?.passed ? (
              <ShieldCheck size={20} color="#10b981" />
            ) : (
              <ShieldAlert size={20} color="#f59e0b" />
            )}
            <div>
              <h3>Security & Vulnerability Audit Report</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {pipeline.name} (Build #{build.buildNumber}) &bull; Scanned via Trivy Engine
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Severity Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#fb7185', fontWeight: 700 }}>CRITICAL</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>{securitySummary?.critical ?? 0}</div>
            </div>
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#fb923c', fontWeight: 700 }}>HIGH</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>{securitySummary?.high ?? 0}</div>
            </div>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#facc15', fontWeight: 700 }}>MEDIUM</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#eab308' }}>{securitySummary?.medium ?? 0}</div>
            </div>
            <div style={{ background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.25)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>LOW</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8' }}>{securitySummary?.low ?? 0}</div>
            </div>
          </div>

          {/* Vulnerability Table */}
          {vulns.length === 0 ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', padding: '32px', textAlign: 'center' }}>
              <ShieldCheck size={40} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ color: '#10b981', marginBottom: 4 }}>Clean Security Bill</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Zero CVE vulnerabilities discovered during this pipeline scan run.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <table className="vuln-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Vulnerability ID</th>
                    <th>Vulnerable Dependency</th>
                    <th>Fixed Version</th>
                    <th>Remediation Advice</th>
                  </tr>
                </thead>
                <tbody>
                  {vulns.map((vuln) => (
                    <tr key={vuln.id}>
                      <td>
                        <span className={`severity-tag ${vuln.severity}`}>
                          {vuln.severity}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{vuln.cve}</strong>
                      </td>
                      <td>
                        <code>{vuln.package}</code> <span style={{ color: 'var(--text-muted)' }}>({vuln.currentVersion})</span>
                      </td>
                      <td>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>{vuln.fixedIn}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                          <Wrench size={13} color="#a5b4fc" />
                          <span>{vuln.remediation}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 24px', background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
