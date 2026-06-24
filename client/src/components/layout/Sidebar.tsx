'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiBook, FiPlusCircle, FiBarChart2, FiAward,
  FiUsers, FiSettings, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { getAvatarUrl } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/create', label: 'Create Quiz', icon: FiPlusCircle },
  { href: '/browse', label: 'My Quizzes', icon: FiBook },
  { href: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/leaderboard', label: 'Achievements', icon: FiAward },
  { href: '/settings', label: 'Friends', icon: FiUsers },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-30 glass border-r border-white/5"
      >
        {/* User Section */}
        <div className="p-4 border-b border-white/5">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <img
                  src={getAvatarUrl(user?.avatar, user?.name)}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-500/30"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.name || 'Player'}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-primary-500/20 text-primary-400">
                      Lv.{user?.level || 1}
                    </span>
                    <span className="text-xs text-dark-300">{user?.xp || 0} XP</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <img
                  src={getAvatarUrl(user?.avatar, user?.name)}
                  alt={user?.name || 'User'}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-500/30"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={`${link.href}-${i}`}
                href={link.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-white'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl gradient-primary opacity-15"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon className={`w-5 h-5 relative z-10 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
                {sidebarOpen && (
                  <span className="relative z-10 truncate">{link.label}</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-dark-700 text-xs font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Content Spacer */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-[260px]' : 'w-[72px]'}`} />
    </>
  );
}

export { Sidebar };
