import { useState, useEffect } from 'react'
import { X, Save, AlertCircle, ChevronDown, Lock, Server, FolderTree, Info } from 'lucide-react'
import { factoryApi } from '../services/api'
import type { FactoryPC, PCUpdateRequest } from '../types'

interface Props {
    pc: FactoryPC
    onClose: () => void
    onSuccess: () => void
}

export default function EditPCModal({ pc, onClose, onSuccess }: Props) {
    const [formData, setFormData] = useState<PCUpdateRequest>({
        pcId: pc.pcId,
        lineNumber: pc.lineNumber,
        pcNumber: pc.pcNumber,
        ipAddress: pc.ipAddress,
        configFilePath: pc.configFilePath,
        logFolderPath: pc.logFolderPath,
        modelFolderPath: pc.modelFolderPath,
        modelVersion: pc.modelVersion
    })

    const [versions, setVersions] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const v = await factoryApi.getVersions()
                if (pc.modelVersion && !v.includes(pc.modelVersion)) {
                    v.push(pc.modelVersion)
                    v.sort()
                }
                setVersions(v)
            } catch (err) {
                console.error('Failed to fetch versions', err)
                setVersions([pc.modelVersion])
            }
        }
        fetchVersions()
    }, [pc.modelVersion])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await factoryApi.updatePC(formData)
            if (res.success) {
                onSuccess()
                onClose()
            } else {
                setError(res.message || 'Failed to update PC')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof PCUpdateRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '520px', width: '95%' }}>

                {/* Header - Compact */}
                <div className="modal-header" style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            background: 'var(--primary-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            <Server size={18} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Edit Unit Details</h3>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                PC-{pc.pcNumber} • Line {pc.lineNumber}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.25rem' }}>
                    {/* Error Alert */}
                    {error && (
                        <div style={{
                            padding: '0.6rem 0.85rem',
                            background: 'var(--danger-bg)',
                            color: 'var(--danger)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1rem',
                            border: '1px solid var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontSize: '0.85rem'
                        }}>
                            <AlertCircle size={16} flexShrink={0} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Section: Identification - Compact Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                        <div>
                            <label className="input-label">Line Number</label>
                            <input
                                type="number"
                                className="input-field compact"
                                value={formData.lineNumber}
                                onChange={e => handleChange('lineNumber', parseInt(e.target.value))}
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="input-label">PC Number</label>
                            <input
                                type="number"
                                className="input-field compact"
                                value={formData.pcNumber}
                                onChange={e => handleChange('pcNumber', parseInt(e.target.value))}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Section: System Info - Compact Grid */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Info size={11} /> System Configuration
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.85rem' }}>
                            <div>
                                <label className="input-label">IP Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="input-field compact text-mono"
                                        value={formData.ipAddress}
                                        disabled
                                        style={{
                                            paddingRight: '2rem',
                                            background: 'var(--bg-app)',
                                            color: 'var(--text-muted)',
                                            borderColor: 'var(--border)',
                                            cursor: 'default',
                                            opacity: 0.8
                                        }}
                                    />
                                    <Lock size={13} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Version</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="input-field compact"
                                        value={formData.modelVersion}
                                        onChange={e => handleChange('modelVersion', e.target.value)}
                                        required
                                        style={{ appearance: 'none' }}
                                    >
                                        {versions.map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={14}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            pointerEvents: 'none',
                                            color: 'var(--text-muted)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Paths - Compact Spacing */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <FolderTree size={11} /> Directory Paths
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="path-input-group">
                                <label className="input-label">Config File</label>
                                <input
                                    type="text"
                                    className="input-field compact text-mono"
                                    value={formData.configFilePath}
                                    onChange={e => handleChange('configFilePath', e.target.value)}
                                    required
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </div>

                            <div className="path-input-group">
                                <label className="input-label">Log Folder</label>
                                <input
                                    type="text"
                                    className="input-field compact text-mono"
                                    value={formData.logFolderPath}
                                    onChange={e => handleChange('logFolderPath', e.target.value)}
                                    required
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </div>

                            <div className="path-input-group">
                                <label className="input-label">Model Folder</label>
                                <input
                                    type="text"
                                    className="input-field compact text-mono"
                                    value={formData.modelFolderPath}
                                    onChange={e => handleChange('modelFolderPath', e.target.value)}
                                    required
                                    style={{ fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer - Reduced margin */}
                    <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.65rem'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ minWidth: '120px', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                        >
                            {loading ? (
                                <>
                                    <div className="pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }}></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <style>{`
                    .input-label {
                        display: block;
                        font-size: 0.75rem;
                        font-weight: 600;
                        margin-bottom: 0.25rem;
                        color: var(--text-muted);
                    }
                    
                    /* Compact inputs */
                    .input-field.compact {
                        padding: 0.45rem 0.65rem;
                        font-size: 0.85rem;
                        height: auto;
                    }

                    /* Focus effect for groups */
                    .path-input-group:focus-within .input-label {
                        color: var(--primary);
                    }
                `}</style>
            </div>
        </div>
    )
}