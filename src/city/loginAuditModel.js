export const LOGIN_AUDIT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const LOGIN_AUDIT_PAGE_SIZE = 100;
export const LOGIN_AUDIT_CLEANUP_LIMIT = 250;

export function classifyDevice(userAgent = '', platform = '') {
  const ua = String(userAgent);
  const platformHint = String(platform);
  const deviceType = /iPad|Tablet|PlayBook|Silk/i.test(ua)
    ? 'tablet'
    : /Mobile|Android|iPhone|iPod|IEMobile|Opera Mini/i.test(ua)
      ? 'mobile'
      : ua
        ? 'desktop'
        : 'unknown';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/i.test(ua)
      ? 'Opera'
      : /Firefox\//i.test(ua)
        ? 'Firefox'
        : /CriOS\/|Chrome\//i.test(ua)
          ? 'Chrome'
          : /Safari\//i.test(ua)
            ? 'Safari'
            : 'Other';
  const platformName = /Windows/i.test(ua) || /Win/i.test(platformHint)
    ? 'Windows'
    : /iPhone|iPad|iPod/i.test(ua)
      ? 'iOS'
      : /Android/i.test(ua)
        ? 'Android'
        : /Macintosh|Mac OS/i.test(ua) || /Mac/i.test(platformHint)
          ? 'macOS'
          : /CrOS/i.test(ua)
            ? 'ChromeOS'
            : /Linux/i.test(ua) || /Linux/i.test(platformHint)
              ? 'Linux'
              : 'Other';
  return { deviceType, browser, platform: platformName };
}

export function formatLoginAuditType(type) {
  const labels = {
    session_start: 'App session started',
    system_enter: 'Entered system',
    system_switch: 'Switched system',
    sign_out: 'Signed out',
  };
  return labels[type] || 'App activity';
}

export function formatLoginAuditSystem(system) {
  const labels = {
    winter_academy: 'Winter Academy',
    city: 'City',
    system_picker: 'System selection',
    unknown: 'Unknown',
  };
  return labels[system] || 'Unknown';
}

export function formatDeviceDescription(record) {
  const device = record?.deviceType || 'unknown';
  const browser = record?.browser || 'Other';
  const platform = record?.platform || 'Other';
  return `${device[0].toUpperCase()}${device.slice(1)} · ${browser} · ${platform}`;
}
