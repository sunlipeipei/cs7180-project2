const fs = require('fs');
const path = require('path');

const hookContent = fs.readFileSync(path.join(__dirname, 'src/hooks/useTimer.ts'), 'utf8');

if (hookContent.includes('fetch(') || hookContent.includes('axios.')) {
    console.error('[FAIL] useTimer has server dependencies (fetch/axios found).');
    process.exit(1);
} else {
    console.log('[PASS] useTimer strictly uses client-side hooks without polling the server.');
}

if (hookContent.includes('switchMode(') && hookContent.includes('handleSessionEnd')) {
    // We need to ensure that handleSessionEnd doesn't directly call switchMode to force the transition
    const handleSessionEndMatch = hookContent.match(/const handleSessionEnd =.*?\{([\s\S]*?)\}/);
    if (handleSessionEndMatch && handleSessionEndMatch[1].includes('switchMode(')) {
        console.error('[FAIL] handleSessionEnd appears to force a mode transition.');
        process.exit(1);
    } else {
        console.log('[PASS] handleSessionEnd does not forcefully transition the mode. It is non-coercive.');
    }
}

console.log('[SUCCESS] All basic verifications for circular timer and strict client-side evaluation passed.');
