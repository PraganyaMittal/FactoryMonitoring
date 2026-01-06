import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
    Server, Package, LayoutGrid, Box, ChevronRight, ChevronDown,
    Activity, Sun, Moon, ScrollText, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { factoryApi } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import { eventBus, EVENTS } from '../utils/eventBus' // Added import

export default function Sidebar() {
    const location = useLocation()
    const { version: activeVersion } = useParams()
    const [searchParams] = useSearchParams()
    const activeLine = searchParams.get('line')
    const { theme, toggleTheme } = useTheme()

    // State
    const [versionMap, setVersionMap] = useState<Record<string, number[]>>({})
    const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)

    // Sidebar UI State
    const [width, setWidth] = useState(200)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const sidebarRef = useRef<HTMLElement>(null)

    useEffect(() => {
        loadTree()

        // 1. Listen for explicit refresh events (e.g. Delete PC)
        const handleRefresh = () => loadTree()
        eventBus.on(EVENTS.REFRESH_DASHBOARD, handleRefresh)

        // 2. Poll for background changes (e.g. New Agent / Insert PC)
        const interval = setInterval(loadTree, 5000)

        return () => {
            eventBus.off(EVENTS.REFRESH_DASHBOARD, handleRefresh)
            clearInterval(interval)
        }
    }, [])

    // Auto-expand the active version if we are on a version page
    useEffect(() => {
        if (activeVersion && !expandedVersions[activeVersion]) {
            setExpandedVersions(prev => ({ ...prev, [activeVersion]: true }))
        }
    }, [activeVersion])

    // Resize Logic
    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
    }, [])

    const stopResizing = useCallback(() => {
        setIsResizing(false)
    }, [])

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing && sidebarRef.current) {
            const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left

            // Constraints
            if (newWidth < 180) {
                if (!isCollapsed) setIsCollapsed(true)
            } else if (newWidth > 600) {
                setWidth(600)
            } else {
                if (isCollapsed) setIsCollapsed(false)
                setWidth(newWidth)
            }
        }
    }, [isResizing, isCollapsed])

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize)
            window.addEventListener("mouseup", stopResizing)
        }
        return () => {
            window.removeEventListener("mousemove", resize)
            window.removeEventListener("mouseup", stopResizing)
        }
    }, [isResizing, resize, stopResizing])

    const loadTree = async () => {
        try {
            const data = await factoryApi.getPCs()
            const tree: Record<string, Set<number>> = {}

            // Logic: Only add lines that have PCs. 
            // If a line becomes empty (0 PCs), it won't be added to the tree here.
            data.lines.forEach(line => {
                line.pcs.forEach(pc => {
                    if (!tree[pc.modelVersion]) {
                        tree[pc.modelVersion] = new Set()
                    }
                    tree[pc.modelVersion].add(line.lineNumber)
                })
            })

            const finalMap: Record<string, number[]> = {}
            Object.keys(tree).sort().forEach(v => {
                finalMap[v] = Array.from(tree[v]).sort((a, b) => a - b)
            })
            setVersionMap(finalMap)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const toggleVersion = (v: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // If collapsed, expanding a version implies expanding the sidebar
        if (isCollapsed) {
            setIsCollapsed(false)
            if (width < 200) setWidth(200)
        }
        setExpandedVersions(prev => ({ ...prev, [v]: !prev[v] }))
    }

    const isActive = (path: string) => {
        if (path === '/dashboard' && !activeVersion && location.pathname === '/dashboard') return true
        if (path.startsWith('/models') && location.pathname.startsWith('/models')) return true
        return false
    }

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
        // Restore standard width if expanding from a fully collapsed state
        if (isCollapsed && width < 200) setWidth(200)
    }

    return (
        <aside
            ref={sidebarRef}
            className={`factory-sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
            style={{ width: isCollapsed ? 64 : width }}
        >
            {/* Resizer Handle */}
            <div
                className="sidebar-resizer"
                onMouseDown={startResizing}
                title="Drag to resize"
            />

            <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '0' : '0 1.25rem' }}>
                <Link to="/dashboard" className="sidebar-logo" title="Factory Monitoring">
                    <div style={{
                        width: 36, height: 36, background: 'var(--primary)', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
                        flexShrink: 0
                    }}>
                        <Server size={20} strokeWidth={3} />
                    </div>
                    <div className="sidebar-label" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span>FACTORY</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>MONITORING</span>
                    </div>
                </Link>

                {!isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="sidebar-toggle-btn"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        <PanelLeftClose size={18} />
                    </button>
                )}
            </div>

            {/* Collapsed Toggle (Centered when collapsed) */}
            {isCollapsed && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <button
                        onClick={toggleSidebar}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        <PanelLeftOpen size={20} />
                    </button>
                </div>
            )}

            <nav className="sidebar-nav">
                <div style={{ marginBottom: '2rem' }}>
                    <div className="sidebar-section-title">{isCollapsed ? 'dash' : 'DASHBOARD'}</div>
                    <Link
                        to="/dashboard"
                        className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                        title="Overview"
                        style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        <LayoutGrid size={18} />
                        <span className="sidebar-label" style={{ flex: 1 }}>Overview</span>
                    </Link>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div className="sidebar-section-title">{isCollapsed ? 'prod' : 'PRODUCTION LINES'}</div>
                    {loading ? (
                        <div className="sidebar-label" style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Loading structure...</div>
                    ) : Object.keys(versionMap).length === 0 ? (
                        <div className="sidebar-label" style={{ padding: '0 1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>No versions found</div>
                    ) : (
                        Object.keys(versionMap).map(v => (
                            <div key={v} style={{ marginBottom: '2px' }}>
                                {/* Parent Version Item */}
                                <div
                                    className={`sidebar-link ${activeVersion === v ? 'text-white' : ''}`}
                                    style={{
                                        justifyContent: isCollapsed ? 'center' : 'space-between',
                                        background: activeVersion === v ? 'var(--bg-hover)' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onClick={(e) => isCollapsed ? toggleVersion(v, e) : null}
                                >
                                    {/* Link part */}
                                    <Link
                                        to={`/dashboard/${v}`}
                                        title={`Version ${v}`}
                                        style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, textDecoration: 'none', color: 'inherit', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                                    >
                                        <Box size={18} color={activeVersion === v ? 'var(--primary)' : 'currentColor'} />
                                        <span className="sidebar-label">Version {v}</span>
                                    </Link>

                                    {/* Collapse Trigger (Only visible when not collapsed) */}
                                    <button
                                        onClick={(e) => toggleVersion(v, e)}
                                        className="sidebar-label"
                                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
                                    >
                                        {expandedVersions[v] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                </div>

                                {/* Nested Lines Dropdown */}
                                {expandedVersions[v] && !isCollapsed && (
                                    <div style={{
                                        paddingLeft: '2.5rem',
                                        borderLeft: '1px solid var(--border)',
                                        marginLeft: '1.1rem',
                                        marginTop: '2px',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {versionMap[v].map(line => (
                                            <Link
                                                key={line}
                                                to={`/dashboard/${v}?line=${line}`}
                                                className="sidebar-link"
                                                style={{
                                                    fontSize: '0.85rem',
                                                    padding: '0.5rem 0.75rem',
                                                    background: (activeVersion === v && activeLine === line.toString()) ? 'var(--primary-dim)' : 'transparent',
                                                    color: (activeVersion === v && activeLine === line.toString()) ? 'var(--primary)' : 'var(--text-muted)'
                                                }}
                                            >
                                                <Activity size={14} />
                                                <span>Line {line}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div>
                    <div className="sidebar-section-title">{isCollapsed ? 'sys' : 'SYSTEM'}</div>
                    <Link
                        to="/models"
                        className={`sidebar-link ${isActive('/models') ? 'active' : ''}`}
                        title="Model Library"
                        style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        <Package size={18} />
                        <span className="sidebar-label">Model Library</span>
                    </Link>
                    <Link
                        to="/log-analyzer"
                        className={`sidebar-link ${location.pathname === '/log-analyzer' ? 'active' : ''}`}
                        title="Log Analyzer"
                        style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        <ScrollText size={18} />
                        <span className="sidebar-label">Log Analyzer</span>
                    </Link>
                </div>
            </nav>

            <div style={{ padding: isCollapsed ? '0.5rem 0' : '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    style={{ justifyContent: 'center', padding: isCollapsed ? '0.2rem' : '0.2rem' }}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span className="sidebar-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </aside>
    )
}