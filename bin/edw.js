#!/usr/bin/env node
// bin/edw.js — CLI de EDW LANG
// Uso: edw archivo.edw           -> genera archivo.js
//      edw archivo.edw --run     -> genera y ejecuta con node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { transpile } = require('../src/edw2js.js');

const args = process.argv.slice(2);
const inputFile = args.find(a => !a.startsWith('--'));
const shouldRun = args.includes('--run');

if (!inputFile) {
  console.log('Uso: edw <archivo.edw> [--run]');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`No encontré el archivo: ${inputFile}`);
  process.exit(1);
}

const source = fs.readFileSync(inputFile, 'utf8');
const js = transpile(source);

const outputFile = inputFile.replace(/\.edw$/, '.js');
fs.writeFileSync(outputFile, js);
console.log(`✅ Generado: ${outputFile}`);

if (shouldRun) {
  console.log('---');
  execSync(`node ${outputFile}`, { stdio: 'inherit' });
  }
  
