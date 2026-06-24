'use client';

import Link from 'next/link';
import { FiGithub, FiTwitter, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg font-heading">Q</span>
              </div>
              <span className="text-xl font-bold font-heading gradient-text">QuizVerse AI</span>
            </Link>
            <p className="text-sm text-dark-300 leading-relaxed">
              The AI-powered multiplayer quiz platform. Learn, compete, and grow with friends.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-dark-200 mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {['Browse Quizzes', 'Create Quiz', 'AI Generator', 'Multiplayer', 'Leaderboard'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-dark-300 hover:text-accent-cyan transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-dark-200 mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {['Documentation', 'API Reference', 'Blog', 'Changelog', 'Support'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-dark-300 hover:text-accent-cyan transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-dark-200 mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-dark-300 hover:text-accent-cyan transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-400 flex items-center gap-1">
            © {new Date().getFullYear()} QuizVerse AI. Made with{' '}
            <FiHeart className="w-3.5 h-3.5 text-accent-pink" /> by the community.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-dark-400 hover:text-white transition-colors">
              <FiGithub className="w-5 h-5" />
            </a>
            <a href="#" className="text-dark-400 hover:text-white transition-colors">
              <FiTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
