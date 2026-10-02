import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Compass, PlusCircle, Layers, CreditCard, Bell, 
  HelpCircle, User, LogOut, Sun, Moon, ShieldAlert, Disc
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Compass },
    { label: 'Create Spin', path: '/create-spin', icon: PlusCircle },
    { label: 'My Spins', path: '/spins', icon: Layers },
    { label: 'Upgrade ($0.50)', path: '/upgrade', icon: CreditCard },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Support', path: '/support', icon: HelpCircle },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-950 p-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">Spin<span className="text-amber-500">Duck</span></span>
            <p className="text-[10px] text-slate-400 font-medium">Create. Spin. Decide.</p>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {user && user.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 mt-4"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* User Footer Action */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200"
          >
            <span>Theme Mode</span>
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {user ? (
            <div className="flex items-center justify-between px-2">
              <div className="text-xs">
                <p className="font-semibold text-slate-200">{user.displayName}</p>
                <p className="text-slate-500">@{user.username}</p>
              </div>
              <button
                onClick={() => logout().then(() => navigate('/login'))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="block text-center py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <Link to="/" className="flex items-center gap-2">
            <Disc className="w-6 h-6 text-amber-500" />
            <span className="text-lg font-extrabold text-white">Spin<span className="text-amber-500">Duck</span></span>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </header>

        {/* Content body */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>

        {/* Mobile Navbar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-800 flex justify-around p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
                  active ? 'text-amber-500 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label.split(' ')[0]}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
