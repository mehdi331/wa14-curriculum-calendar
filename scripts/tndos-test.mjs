import assert from 'node:assert/strict';
import { isTnDOSExperimentEnabled } from '../src/tndos/feature.js';

assert.equal(isTnDOSExperimentEnabled(true, '?tndos=1'), true);
assert.equal(isTnDOSExperimentEnabled(true, '?tndos=0'), false);
assert.equal(isTnDOSExperimentEnabled(true, '?tndos=true'), false);
assert.equal(isTnDOSExperimentEnabled(true, ''), false);
assert.equal(isTnDOSExperimentEnabled(false, '?tndos=1'), false);
assert.equal(isTnDOSExperimentEnabled(false, '?tndos=1&hash=onlineUsers'), false);

console.log('TnDOS experiment gate checks passed.');
