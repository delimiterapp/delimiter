'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type User = { id: string; email: string; name: string | null; plan: string }
type Project = { id: string; name: string; key: string }

interface AppContextValue {
  user: User | null
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (project: Project) => void
  addProject: (name: string) => Promise<Project | null>
  refreshProjects: () => Promise<Project[]>
  loading: boolean
}

const AppContext = createContext<AppContextValue>({
  user: null,
  projects: [],
  activeProject: null,
  setActiveProject: () => {},
  addProject: async () => null,
  refreshProjects: async () => [],
  loading: true,
})

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const setActiveProject = useCallback((project: Project) => {
    setActiveProjectState(project)
    localStorage.setItem('delimiter_active_project', project.id)
  }, [])

  const refreshProjects = useCallback(async () => {
    const res = await fetch('/api/projects')
    if (res.ok) {
      const data = await res.json()
      setProjects(data.projects)
      return data.projects as Project[]
    }
    return []
  }, [])

  const addProject = useCallback(async (name: string): Promise<Project | null> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const data = await res.json()
      const updated = await refreshProjects()
      setActiveProject(data.project)
      return data.project
    }
    return null
  }, [refreshProjects, setActiveProject])

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me')
        if (!meRes.ok) {
          window.location.href = '/sign-in'
          return
        }
        const meData = await meRes.json()
        setUser({ ...meData.user, plan: meData.user.plan || 'none' })

        const projRes = await fetch('/api/projects')
        if (projRes.ok) {
          const projData = await projRes.json()
          const projs: Project[] = projData.projects

          setProjects(projs)

          // Restore last active project or default to first
          const savedId = localStorage.getItem('delimiter_active_project')
          const saved = projs.find((p) => p.id === savedId)
          setActiveProjectState(saved || projs[0] || null)
        }
      } catch {
        window.location.href = '/sign-in'
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  return (
    <AppContext.Provider value={{ user, projects, activeProject, setActiveProject, addProject, refreshProjects, loading }}>
      {children}
    </AppContext.Provider>
  )
}
