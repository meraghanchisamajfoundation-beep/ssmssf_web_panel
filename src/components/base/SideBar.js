import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiGrid, 
  FiUsers, 
  FiFileText, 
  FiBell, 
  FiSettings, 
  FiShield,
  FiCreditCard,
  FiFolder,
  FiUser,
  FiLayers,
  FiX
} from 'react-icons/fi';
import { useAuth } from '@/lib/AuthProvider';
import { TrsutData } from '@/lib/constentData';

const SideBar = ({ collapsed, onClose }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { icon: FiGrid,       label: 'Dashboard',        link: '/',                description: 'Overview & analytics' },
    { icon: FiUsers,      label: 'Members',           link: '/members',         description: 'Manage members' },
    { icon: FiUser,       label: 'Agents',            link: '/agents',          description: 'Agent management' },
    { icon: FiBell,       label: 'Yojna',             link: '/yojna',           description: 'Schemes & programs' },
    { icon: FiCreditCard, label: 'Closing Payments',  link: '/closingPayments', description: 'Closing payments' },
    { icon: FiCreditCard, label: 'Payments',          link: '/transactions',    description: 'Payment history' },
  ];

  const systemItems = [
    { icon: FiSettings, label: 'Settings', link: '/setting', description: 'App configuration' },
  ];

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const NavItem = ({ item, index }) => {
    const active = isActive(item.link);
    const Icon = item.icon;
    return (
      <li key={index} style={{ animation: `slideIn 0.35s ease ${index * 0.05}s both` }}>
        <Link
          href={item.link}
          onClick={onClose}
          className={`nav-item group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden
            ${active ? 'nav-active' : 'nav-default'}
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? item.label : ''}
        >
          {active && <span className="active-glow" />}
          <span className={`icon-wrap flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
            ${active ? 'icon-active' : 'icon-default'}`}>
            <Icon size={17} />
          </span>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-semibold block leading-tight ${active ? 'text-gold-bright' : 'text-gold-muted group-hover:text-gold-mid'}`}
                style={{ color: active ? '#f0c040' : 'rgba(220,180,80,0.72)' }}>
                {item.label}
              </span>
              <span className="text-xs block mt-0.5"
                style={{ color: active ? 'rgba(240,192,64,0.58)' : 'rgba(180,130,40,0.42)' }}>
                {item.description}
              </span>
            </div>
          )}
          {active && !collapsed && (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f0c040' }} />
          )}
        </Link>
      </li>
    );
  };

  const initials = user?.username ? user.username.charAt(0).toUpperCase() : 'A';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        /* ── Root ── */
        .sidebar-root {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(180deg, #1a0a00 0%, #140700 55%, #0d0400 100%);
          border-right: 1px solid rgba(212,160,23,0.14);
          position: relative;
        }

        /* subtle noise/grain overlay for depth */
        .sidebar-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.18;
        }

        .sidebar-root > * { position: relative; z-index: 1; }

        /* ── Logo bar ── */
        .sidebar-logo-border {
          border-bottom: 1px solid rgba(212,160,23,0.12);
        }
        .logo-org-name {
          font-size: 13px;
          font-weight: 700;
          color: #f0c040;
          line-height: 1.25;
          letter-spacing: 0.01em;
        }
        .logo-subtitle {
          font-size: 11px;
          color: rgba(212,160,23,0.42);
          margin-top: 2px;
        }
        .logo-img-wrap {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1.5px solid rgba(212,160,23,0.45);
          background: rgba(26,10,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          padding: 2px;
        }
        .logo-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }

        /* ── Nav items ── */
        .nav-item { position: relative; }

        .nav-active {
          background: linear-gradient(135deg, rgba(200,134,10,0.28) 0%, rgba(139,26,0,0.16) 100%);
          border: 1px solid rgba(212,160,23,0.38);
          box-shadow: 0 1px 10px rgba(200,134,10,0.12), inset 0 1px 0 rgba(255,215,80,0.08);
        }
        .nav-default {
          border: 1px solid transparent;
        }
        .nav-default:hover {
          background: rgba(212,160,23,0.07);
          border-color: rgba(212,160,23,0.14);
        }
        .active-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at left center, rgba(200,134,10,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Icons ── */
        .icon-active {
          background: linear-gradient(135deg, #c8860a 0%, #9a5000 100%);
          color: #fff8e0;
          box-shadow: 0 2px 10px rgba(200,134,10,0.42);
        }
        .icon-default {
          background: rgba(212,160,23,0.08);
          color: rgba(212,160,23,0.50);
        }
        .group:hover .icon-default {
          background: rgba(200,134,10,0.14);
          color: rgba(240,192,64,0.85);
        }

        /* ── Section label ── */
        .section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.13em;
          color: rgba(212,160,23,0.38);
          text-transform: uppercase;
        }

        /* ── Scrollbar ── */
        .sidebar-nav::-webkit-scrollbar { width: 3px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(212,160,23,0.18);
          border-radius: 99px;
        }

        /* ── Divider ── */
        .divider { border-color: rgba(212,160,23,0.09); }

        /* ── Avatar ── */
        .avatar-ring {
          background: linear-gradient(135deg, #c8860a, #8b1a00);
          padding: 2px;
          border-radius: 50%;
        }
        .avatar-inner {
          background: #1a0800;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f0c040;
          font-weight: 700;
          font-size: 14px;
        }
        .online-dot {
          width: 8px; height: 8px;
          background: #f0c040;
          border-radius: 50%;
          border: 2px solid #1a0a00;
          position: absolute; bottom: 0; right: 0;
        }

        /* ── Footer ── */
        .sidebar-footer {
          border-top: 1px solid rgba(212,160,23,0.1);
        }
        .footer-username {
          font-size: 13px;
          font-weight: 600;
          color: #f0c040;
        }
        .footer-email {
          font-size: 11px;
          color: rgba(212,160,23,0.4);
        }

        /* ── Animations ── */
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <aside className={`sidebar-root flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-72'}
        h-full
      `}>

        {/* ── Logo ── */}
        <div className={`sidebar-logo-border flex items-center h-16 px-4 flex-shrink-0
          ${collapsed ? 'justify-center' : 'gap-3'}
        `}>
          <div className="logo-img-wrap">
            <img src={TrsutData.logo} alt="Logo" />
          </div>
          {!collapsed && (
            <div>
              <p className="logo-org-name">{TrsutData.sideBarName}</p>
              <p className="logo-subtitle">Admin Panel</p>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-nav flex-1 overflow-y-auto py-4 px-3 space-y-5">

          {/* Main */}
          <div>
            {!collapsed && <p className="section-label px-2 mb-3">Main Menu</p>}
            <ul className="space-y-1">
              {navItems.map((item, i) => <NavItem key={i} item={item} index={i} />)}
            </ul>
          </div>

          <hr className="divider" />

          {/* System */}
          <div>
            {!collapsed && <p className="section-label px-2 mb-3">System</p>}
            <ul className="space-y-1">
              {systemItems.map((item, i) => (
                <NavItem key={i} item={item} index={i + navItems.length} />
              ))}
            </ul>
          </div>

        </nav>

        {/* ── User footer ── */}
        <div className={`sidebar-footer px-3 py-4 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? '' : 'w-full'}`}>
            <div className="relative flex-shrink-0">
              <div className="avatar-ring w-10 h-10">
                <div className="avatar-inner">{initials}</div>
              </div>
              <span className="online-dot" />
            </div>
            {!collapsed && user && (
              <div className="min-w-0 flex-1">
                <p className="footer-username truncate">{user.username || 'Admin'}</p>
                <p className="footer-email truncate">{user.email || 'admin@trust.com'}</p>
              </div>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};

export default SideBar;