export function isTnDOSExperimentEnabled(isDevelopment, search) {
  return isDevelopment && new URLSearchParams(search).get('tndos') === '1';
}
