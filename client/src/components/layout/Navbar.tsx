'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCompass, FiPlusCircle, FiPlay, FiAward, FiSun, FiMoon, FiBell, FiMenu, FiX, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { getAvatarUrl } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: FiHome },
  { href: '/browse', label: 'Browse', icon: FiCompass },
  { href: '/create', label: 'Create', icon: FiPlusCircle },
  { href: '/play', label: 'Play', icon: FiPlay },
  { href: '/leaderboard', label: 'Leaderboard', icon: FiAward },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isGamePage = pathname?.startsWith('/game/') && pathname?.includes('/play');
  if (isGamePage) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg font-heading">Q</span>
              </div>
              <span className="text-xl font-bold font-heading gradient-text hidden sm:block">
                QuizVerse AI
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-dark-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-xl gradient-primary opacity-20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <link.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </motion.button>

              {/* Notification Bell */}
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FiBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-pink rounded-full border-2 border-dark-900" />
                </motion.button>
              )}

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <img
                      src={getAvatarUrl(user.avatar, user.name)}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl overflow-hidden z-50 p-2"
                        >
                          <div className="px-3 py-2 border-b border-white/5 mb-1">
                            <p className="font-semibold text-sm">{user.name}</p>
                            <p className="text-xs text-dark-300">Level {user.level} • {user.xp} XP</p>
                          </div>
                          <Link
                            href={`/profile/${user.id || user._id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-dark-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <FiUser className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-dark-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <FiCompass className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-dark-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <FiSettings className="w-4 h-4" />
                            Settings
                          </Link>
                          <hr className="border-white/5 my-1" />
                          <button
                            onClick={() => { logout(); setDropdownOpen(false); }}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors w-full"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-dark-200 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-dark-800 border-l border-white/5 p-6 pt-20">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'gradient-primary text-white'
                          : 'text-dark-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}

export { Navbar };
