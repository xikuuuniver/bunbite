import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, LogOut, UtensilsCrossed } from 'lucide-react';
import { dashboardNav, navPath } from '../nav';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSlug: string;
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({ activeSlug, collapsed, onToggleCollapsed, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-primary to-[#1d3313] text-white">
      {/* Brand */}
      <div className={cn('flex items-center gap-3 px-5 py-5 border-b border-white/10', collapsed && 'justify-center px-0')}>
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <UtensilsCrossed size={18} className="text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-lg leading-none tracking-wide truncate">BunBite</p>
            <p className="text-[11px] text-white/60 mt-1">Management Suite</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {dashboardNav.map((item) => {
          const isActive = item.slug === activeSlug;
          const Icon = item.icon;
          return (
            <Link
              key={item.slug || 'home'}
              href={navPath(item.slug)}
              onClick={onNavigate}
              data-testid={`link-dashboard-nav-${item.slug || 'dashboard'}`}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive ? 'text-primary bg-secondary' : 'text-white/75 hover:text-white hover:bg-white/10',
              )}
            >
              {isActive && !collapsed && (
                <motion.span
                  layoutId="dashboard-nav-active"
                  className="absolute inset-0 rounded-xl bg-secondary -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={onToggleCollapsed}
          className={cn(
            'hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors',
            collapsed && 'justify-center px-0',
          )}
          data-testid="button-dashboard-collapse"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors',
            collapsed && 'justify-center px-0',
          )}
          data-testid="link-dashboard-exit"
          onClick={onNavigate}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 mt-1">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold shrink-0">
              {(user.firstName?.[0] || user.username[0]).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user.firstName || user.username}</p>
              <p className="text-[10px] text-white/50 truncate">Restaurant Manager</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
