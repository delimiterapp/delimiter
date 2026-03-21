import { SidebarLinks } from './sidebar-links'
import { navigation } from './sidebar-nav'

export function Sidebar() {
  return (
    <aside className="sidebar-scroll sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 overflow-y-auto border-r border-border px-5 py-6 md:block">
      <SidebarLinks navigation={navigation} />
    </aside>
  )
}
