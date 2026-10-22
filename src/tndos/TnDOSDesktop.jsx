import React, { useEffect, useRef, useState } from 'react';
import {
  AppWindow,
  ArrowBendUpLeft,
  Buildings,
  CalendarBlank,
  GraduationCap,
  Minus,
  X,
} from '@phosphor-icons/react';
import App from '../App.jsx';

const APP_NAME = 'Training & Design';
const SYSTEMS = [
  { id: 'winter_academy', label: 'Winter Academy', Icon: GraduationCap },
  { id: 'city', label: 'City', Icon: Buildings },
];

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function windowLabel(tab, items) {
  return items.find(item => item.id === tab)?.label || APP_NAME;
}

export default function TnDOSDesktop() {
  const [menuItems, setMenuItems] = useState([]);
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindow, setActiveWindow] = useState('login');
  const [profile, setProfile] = useState({ name: '', systems: [] });
  const [activeSystem, setActiveSystem] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const [position, setPosition] = useState(null);
  const [maximized, setMaximized] = useState(false);
  const drag = useRef(null);
  const desktopRef = useRef(null);
  const itemMap = new Map(menuItems.map(item => [item.id, item]));
  const activeItem = activeWindow && itemMap.get(activeWindow);

  useEffect(() => {
    const updateMenu = event => {
      const nextItems = event.detail || [];
      const nextIds = new Set(nextItems.map(item => item.id));
      setMenuItems(nextItems);
      setActiveSystem(nextItems.some(item => item.id.startsWith('system:')) ? null : nextItems[0]?.system || null);
      setOpenWindows(previous => previous.filter(id => id === 'training' || nextIds.has(id)));
      setActiveWindow(previous => previous && (previous === 'login' || previous === 'training' || nextIds.has(previous)) ? previous : null);
    };
    const updateProfile = event => {
      const nextProfile = {
        name: event.detail?.name || '',
        systems: event.detail?.systems || [],
      };
      setProfile(nextProfile);
      if (nextProfile.name) setActiveWindow(previous => previous === 'login' ? null : previous);
      else setActiveWindow('login');
    };
    window.addEventListener('tndos:navigation-menu', updateMenu);
    window.addEventListener('tndos:profile', updateProfile);
    return () => {
      window.removeEventListener('tndos:navigation-menu', updateMenu);
      window.removeEventListener('tndos:profile', updateProfile);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyboard = event => {
      if (sleeping) {
        event.preventDefault();
        setSleeping(false);
        return;
      }
      if (event.key === 'Escape') {
        if (startMenuOpen) setStartMenuOpen(false);
        else if (activeWindow && activeWindow !== 'login') goToDesktop();
      }
      if ((event.altKey && event.key === 'ArrowLeft') && activeWindow && activeWindow !== 'login') goToDesktop();
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [activeWindow, sleeping, startMenuOpen]);

  const selectMenuItem = item => {
    if (!item) return;
    setPosition(null);
    setMaximized(false);
    setStartMenuOpen(false);
    if (item.id.startsWith('system:')) {
      setOpenWindows(previous => previous.includes('training') ? previous : [...previous, 'training']);
      setActiveWindow('training');
      window.dispatchEvent(new CustomEvent('tndos:select-system', {
        detail: item.id.slice('system:'.length),
      }));
      return;
    }
    setOpenWindows(previous => previous.includes(item.id) ? previous : [...previous, item.id]);
    setActiveWindow(item.id);
    if (item.id.startsWith('city:')) {
      window.dispatchEvent(new CustomEvent('tndos:select-city-tab', {
        detail: item.id.slice('city:'.length),
      }));
      return;
    }
    if (window.location.hash !== `#${item.id}`) window.location.hash = `#${item.id}`;
  };

  const openTrainingApp = () => {
    const currentTab = window.location.hash.slice(1);
    const tab = menuItems.some(item => item.id === currentTab) ? currentTab : 'calendar';
    if (menuItems.some(item => item.id === tab)) {
      selectMenuItem(itemMap.get(tab));
    } else {
      setOpenWindows(previous => previous.includes('training') ? previous : [...previous, 'training']);
      setActiveWindow('training');
      setPosition(null);
      setMaximized(false);
    }
  };

  const selectSystem = system => {
    if (!profile.systems.includes(system)) return;
    setActiveWindow(null);
    setStartMenuOpen(false);
    setPosition(null);
    setMaximized(false);
    window.dispatchEvent(new CustomEvent('tndos:select-system', { detail: system }));
  };

  const goToDesktop = () => {
    setActiveWindow(null);
    setPosition(null);
    setMaximized(false);
  };

  const closeWindow = () => {
    if (!activeWindow) return;
    const remaining = openWindows.filter(id => id !== activeWindow);
    setOpenWindows(remaining);
    const next = remaining[remaining.length - 1] || null;
    setActiveWindow(next);
    setPosition(null);
    setMaximized(false);
    if (next?.startsWith('city:')) {
      window.dispatchEvent(new CustomEvent('tndos:select-city-tab', {
        detail: next.slice('city:'.length),
      }));
    } else if (next && next !== 'training') {
      window.location.hash = `#${next}`;
    }
  };

  const startDragging = event => {
    if (maximized || event.button !== 0 || event.target.closest('button')) return;
    const bounds = desktopRef.current?.getBoundingClientRect();
    const windowElement = event.currentTarget.closest('.tndos-window');
    if (!bounds || !windowElement) return;
    const rect = windowElement.getBoundingClientRect();
    drag.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      bounds,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveWindow = event => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const { bounds, offsetX, offsetY } = drag.current;
    const windowElement = event.currentTarget.closest('.tndos-window');
    const maxX = Math.max(0, bounds.width - (windowElement?.offsetWidth || 0));
    const maxY = Math.max(0, bounds.height - (windowElement?.offsetHeight || 0));
    setPosition({
      x: Math.min(maxX, Math.max(0, event.clientX - bounds.left - offsetX)),
      y: Math.min(maxY, Math.max(0, event.clientY - bounds.top - offsetY)),
    });
  };

  const stopDragging = event => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };

  const toggleMaximize = () => {
    setMaximized(value => !value);
    setPosition(null);
  };

  const appIcon = tab => {
    const item = itemMap.get(tab);
    if (item?.icon) {
      const Icon = item.icon;
      return <Icon size={25} weight="duotone" />;
    }
    return <CalendarBlank size={25} weight="duotone" />;
  };
  const startSleep = () => {
    setStartMenuOpen(false);
    setActiveWindow(null);
    setSleeping(true);
  };

  const requestLogout = () => {
    setStartMenuOpen(false);
    window.dispatchEvent(new CustomEvent('tndos:logout'));
  };
  const openWindow = windowId => windowId === 'training'
    ? openTrainingApp()
    : selectMenuItem(itemMap.get(windowId));

  return (
    <main className={`tndos-desktop${activeWindow === 'login' ? ' tndos-login-mode' : ''}`} aria-label="TnDOS desktop">
      {sleeping && (
        <button className="tndos-sleep-screen" type="button" onClick={() => setSleeping(false)} aria-label="Wake TnDOS">
          <span className="tndos-glow-logo">TnDOS</span>
          <span className="tndos-sleep-prompt">Click or press any key to wake</span>
        </button>
      )}
      <section ref={desktopRef} className="tndos-workspace" aria-label="Desktop workspace">
        <div className="tndos-wallpaper-logo" aria-hidden="true">TnDOS</div>
        <div className="tndos-desktop-icons" aria-label="Applications">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`tndos-desktop-shortcut${openWindows.includes(item.id) ? ' is-open' : ''}`}
              type="button"
              title={`Open ${item.label}`}
              onClick={() => selectMenuItem(item)}
            >
              <span className="tndos-shortcut-icon">{appIcon(item.id)}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <section
          className={`tndos-window${maximized ? ' tndos-window-maximized' : ''}${activeWindow ? '' : ' tndos-window-hidden'}`}
          aria-label={`${activeWindow ? windowLabel(activeWindow, menuItems) : APP_NAME} application window`}
          aria-hidden={!activeWindow}
          style={maximized ? undefined : position ? { left: position.x, top: position.y, transform: 'none' } : undefined}
        >
          <header
            className="tndos-window-titlebar"
            onPointerDown={startDragging}
            onPointerMove={moveWindow}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <div className="tndos-window-leading">
              <button className="tndos-back-button" type="button" onClick={goToDesktop} title="Back to desktop" aria-label="Back to desktop">
                <ArrowBendUpLeft size={16} />
                <span>Desktop</span>
              </button>
              <div className="tndos-window-title">
                {appIcon(activeWindow)}
                <span>{activeWindow === 'training' ? APP_NAME : windowLabel(activeWindow, menuItems)}</span>
              </div>
            </div>
            <div className="tndos-window-controls" aria-label="Window controls">
              <button type="button" aria-label="Minimize window" title="Minimize" onClick={goToDesktop}>
                <Minus size={15} />
              </button>
              <button type="button" aria-label={maximized ? 'Restore window' : 'Maximize window'} title={maximized ? 'Restore' : 'Maximize'} onClick={toggleMaximize}>
                <AppWindow size={14} />
              </button>
              <button className="tndos-window-close" type="button" aria-label="Close window" title="Close" onClick={closeWindow}>
                <X size={15} />
              </button>
            </div>
          </header>
          <div className="tndos-window-content">
            <App />
          </div>
        </section>

      </section>

      <footer className="tndos-taskbar">
        {profile.name && (
          <div className="tndos-start-menu-wrap">
            {startMenuOpen && (
              <section className="tndos-start-menu" aria-label="Start menu" role="menu">
                <div className="tndos-start-menu-banner"><span>TnDOS</span><small>Teach For Bangladesh</small></div>
                <button type="button" className="tndos-start-menu-action" role="menuitem" onClick={startSleep}>
                  <span className="tndos-menu-action-icon">Zz</span><span>Sleep</span>
                </button>
                <button type="button" className="tndos-start-menu-action" role="menuitem" onClick={requestLogout}>
                  <span className="tndos-menu-action-icon">↪</span><span>Log out</span>
                </button>
              </section>
            )}
            <button
              className={`tndos-profile${startMenuOpen ? ' is-active' : ''}`}
              title={profile.name}
              type="button"
              aria-haspopup="menu"
              aria-expanded={startMenuOpen}
              onClick={() => setStartMenuOpen(value => !value)}
            >
              <span className="tndos-profile-mark">T</span>
              <span>{profile.name}</span>
            </button>
          </div>
        )}
        <div className="tndos-taskbar-systems" role="group" aria-label="Training systems">
          {SYSTEMS.filter(system => profile.systems.includes(system.id)).map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`tndos-system-button${activeSystem === id ? ' is-active' : ''}`}
              type="button"
              aria-pressed={activeSystem === id}
              onClick={() => selectSystem(id)}
            >
              <Icon size={16} weight="bold" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        {openWindows.map(id => (
          <button
            key={id}
            className={`tndos-taskbar-app${activeWindow === id ? ' is-active' : ''}`}
            type="button"
            title={`Switch to ${windowLabel(id, menuItems)}`}
            onClick={() => openWindow(id)}
          >
            {appIcon(id)}
            <span>{id === 'training' ? APP_NAME : windowLabel(id, menuItems)}</span>
          </button>
        ))}
        <div className="tndos-taskbar-spacer" />
        <div className="tndos-taskbar-clock" aria-label={`Local time ${formatClock(clock)}`}>
          <time dateTime={clock.toISOString()}>{formatClock(clock)}</time>
        </div>
      </footer>

    </main>
  );
}
