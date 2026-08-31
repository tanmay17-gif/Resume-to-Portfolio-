const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(process.cwd(), 'src', 'components', 'layouts');
const files = fs.readdirSync(layoutsDir).filter(f => f.endsWith('-layout.tsx'));

files.forEach(f => {
  const filePath = path.join(layoutsDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add CustomSections to import
  content = content.replace(
    /import {([^}]+)} from "@\/components\/portfolio-primitives";/,
    (match, p1) => {
      if (p1.includes('CustomSections')) return match;
      return `import {${p1}, CustomSections } from "@/components/portfolio-primitives";`;
    }
  );

  // 2. Find where to inject CustomSections
  if (!content.includes('<CustomSections data={data} presetKey={p} />')) {
    const footerMatch = content.match(/{\/\*\s*Footer\s*\*\/}/i) || content.match(/<footer/i) || content.match(/<div className="mt-8/);
    if (footerMatch) {
      const idx = footerMatch.index;
      const before = content.slice(0, idx);
      const after = content.slice(idx);
      content = before + `
          {/* Custom Sections */}
          <CustomSections data={data} presetKey={p} />\n\n          ` + after;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${f}`);
});
