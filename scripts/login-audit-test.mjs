import assert from 'node:assert/strict';
import {
  classifyDevice,
  formatDeviceDescription,
  formatLoginAuditSystem,
  formatLoginAuditType,
  LOGIN_AUDIT_PAGE_SIZE,
  LOGIN_AUDIT_RETENTION_MS,
} from '../src/city/loginAuditModel.js';

assert.deepEqual(
  classifyDevice(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36 Edg/124.0',
    'Win32',
  ),
  { deviceType: 'desktop', browser: 'Edge', platform: 'Windows' },
);
assert.deepEqual(
  classifyDevice(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    'iPhone',
  ),
  { deviceType: 'mobile', browser: 'Safari', platform: 'iOS' },
);
assert.deepEqual(
  classifyDevice(
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    'MacIntel',
  ),
  { deviceType: 'tablet', browser: 'Safari', platform: 'iOS' },
);
assert.deepEqual(classifyDevice(), { deviceType: 'unknown', browser: 'Other', platform: 'Other' });
assert.equal(formatLoginAuditType('system_switch'), 'Switched system');
assert.equal(formatLoginAuditType('invalid'), 'App activity');
assert.equal(formatLoginAuditSystem('winter_academy'), 'Winter Academy');
assert.equal(formatDeviceDescription({ deviceType: 'desktop', browser: 'Chrome', platform: 'Linux' }), 'Desktop · Chrome · Linux');
assert.equal(LOGIN_AUDIT_RETENTION_MS, 30 * 24 * 60 * 60 * 1000);
assert.equal(LOGIN_AUDIT_PAGE_SIZE, 100);

console.log('Login audit model checks passed.');
