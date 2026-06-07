/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./design-tokens.tokens.json', 'utf8'));

let cssVars = [];

function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
}

function traverse(obj, path = []) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (obj[key].value !== undefined) {
        // It's a token!
        let token = obj[key];
        let val = token.value;
        
        // Handle dimension values missing units
        if (token.type === 'dimension') {
          if (typeof val === 'number') {
            val = val + 'px';
          } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
            val = val + 'px';
          }
        }
        
        // Generate CSS variable name
        let varNameParts = [];
        
        // Special handling for colors to only use color roles
        if (path[0] === 'color' && path[1] === 'helix') {
           // path is ['color', 'helix', roleName]
           const role = path[2];
           if (role) {
             const parts = key.split('-');
             const shade = parts[parts.length - 1]; // e.g. '50'
             varNameParts = ['color', role, shade];
           } else {
             // fallback
             varNameParts = [...path, key];
           }
        } else if (path[0] === 'font' && token.type === 'custom-fontStyle') {
           // If the value is an object (composite token), let's flatten it to individual CSS vars
           if (typeof val === 'object') {
             for (const [prop, propVal] of Object.entries(val)) {
                let finalVal = propVal;
                if (typeof finalVal === 'number' && ['fontSize', 'lineHeight', 'paragraphIndent', 'paragraphSpacing'].includes(prop)) {
                  finalVal += 'px';
                }
                const formattedProp = kebabCase(prop);
                cssVars.push(`  --font-${kebabCase(key)}-${formattedProp}: ${finalVal};`);
             }
             continue; // Skip the generic addition
           } else {
             varNameParts = [...path, key];
           }
        } else {
          varNameParts = [...path, key];
        }
        
        const varName = '--' + varNameParts.map(p => kebabCase(p)).join('-');
        
        // Make sure val is a string or number (not an object)
        if (typeof val !== 'object') {
           cssVars.push(`  ${varName}: ${val};`);
        }
      } else {
        traverse(obj[key], [...path, key]);
      }
    }
  }
}

traverse(data);

// Deduplicate cssVars just in case
cssVars = [...new Set(cssVars)];

const cssOutput = `:root {\n${cssVars.join('\n')}\n}\n`;
fs.writeFileSync('./variables.css', cssOutput, 'utf8');
console.log('Generated variables.css with ' + cssVars.length + ' variables.');
