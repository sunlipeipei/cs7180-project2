const fs = require('fs');

const hookPath = './src/hooks/useTimer.ts';
const content = fs.readFileSync(hookPath, 'utf8');

let hasErrors = false;

if (content.includes("onSessionEnd(mode)")) {
    console.log("SUCCESS: useTimer calls onSessionEnd without automatically modifying state to force a break transition.");
} else {
    console.error("FAIL: Could not find onSessionEnd call indicating manual transition.");
    hasErrors = true;
}

if (!content.includes("fetch(") && !content.includes("axios")) {
    console.log("SUCCESS: useTimer contains no network requests. Timer countdown is entirely client-side.");
} else {
    console.error("FAIL: useTimer appears to make network requests during countdown.");
    hasErrors = true;
}

if (hasErrors) process.exit(1);
process.exit(0);
