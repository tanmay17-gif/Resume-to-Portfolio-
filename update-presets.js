const fs = require('fs');
let content = fs.readFileSync('src/lib/stylePresets.ts', 'utf8');

// Update features with threeUIVisual
content = content.replace(/features:\s*\{([\s\S]*?)threeAccent:\s*(true|false)\s*\}/g, (match, p1, p2) => {
    return eatures: {\threeAccent: \, threeUIVisual: "none" };
});

// Update specific presets
content = content.replace(/(dark_pro:\s*\{[\s\S]*?threeUIVisual:\s*)"none"/, $1"hero");
content = content.replace(/(glass:\s*\{[\s\S]*?threeUIVisual:\s*)"none"/, $1"hero");
content = content.replace(/(grid:\s*\{[\s\S]*?threeUIVisual:\s*)"none"/, $1"project");

fs.writeFileSync('src/lib/stylePresets.ts', content);
console.log('Done');
