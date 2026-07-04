// edw2js.js — Transpilador EDW LANG -> JavaScript
// Autor base: Edward Dev
// Enfoque: basado en líneas + indentación (como Python).

function replaceKeywords(line) {
  line = line.replace(/\bconstx\b/g, 'const');
  line = line.replace(/\bdejax\b/g, 'let');
  line = line.replace(/\bretorna\b/g, 'return');
  line = line.replace(/\bespera\b/g, 'await');
  line = line.replace(/\bverx\b/g, 'true');
  line = line.replace(/\bfalsx\b/g, 'false');
  line = line.replace(/\bnullx\b/g, 'null');
  line = line.replace(/\.agregarx\(/g, '.push(');
  line = line.replace(/\.tamaniox\(\)/g, '.length');
  line = line.replace(/\.obtenerx\((\d+)\)/g, '[$1]');
  line = line.replace(/\bgritax\b/g, 'console.log');
  line = line.replace(/\bsux\b/g, 'console.info');
  line = line.replace(/\bkrx\b/g, 'console.error');

  // gritax "algo"  ->  console.log("algo")   (statement sin paréntesis -> con paréntesis)
  line = line.replace(
    /^(\s*)console\.(log|info|error)\s+(.+?)\s*$/,
    (m, ind, fn, expr) => `${ind}console.${fn}(${expr})`
  );
  // krx error (ya transpilado a console.error error) también cae en el regex de arriba.

  return line;
}

function transpileLine(raw) {
  let line = raw.replace(/^(\s*)edw\s+/, '$1'); // quita el prefijo "edw "

  // comentarios ( ... ) -> // ...
  const commentMatch = line.match(/^(\s*)\(\s*(.*?)\s*\)\s*$/);
  if (commentMatch) return `${commentMatch[1]}// ${commentMatch[2]}`;
  if (line.trim() === '') return '';

  const indent = (line.match(/^(\s*)/) || ['', ''])[1];
  let m;

  // clase X:
  if ((m = line.match(/^(\s*)clase\s+(\w+)\s*:\s*$/))) {
    return `${indent}class ${m[2]} {`;
  }

  // asincrona funcion nombre(params):
  if ((m = line.match(/^(\s*)asincrona\s+funcion\s+(\w+)\s*\(([^)]*)\)\s*:\s*$/))) {
    return `${indent}async function ${m[2]}(${m[3]}) {`;
  }
  // funcion nombre(params):   (también sirve como método dentro de clase)
  if ((m = line.match(/^(\s*)funcion\s+(\w+)\s*\(([^)]*)\)\s*:\s*$/))) {
    return `${indent}function ${m[2]}(${m[3]}) {`;
  }

  // si / siotro / sino
  if ((m = line.match(/^(\s*)si\s+(.*):\s*$/))) return `${indent}if (${m[2]}) {`;
  if ((m = line.match(/^(\s*)siotro\s+(.*):\s*$/))) return `${indent}} else if (${m[2]}) {`;
  if ((m = line.match(/^(\s*)sino\s*:\s*$/))) return `${indent}} else {`;

  // intenta / atrapa X
  if ((m = line.match(/^(\s*)intenta\s*:\s*$/))) return `${indent}try {`;
  if ((m = line.match(/^(\s*)atrapa\s+(\w+)\s*:\s*$/))) return `${indent}} catch (${m[2]}) {`;

  // para i en 1..5:
  if ((m = line.match(/^(\s*)para\s+(\w+)\s+en\s+(\S+)\.\.(\S+)\s*:\s*$/))) {
    return `${indent}for (let ${m[2]} = ${m[3]}; ${m[2]} <= ${m[4]}; ${m[2]}++) {`;
  }

  // paraCada n en lista:
  if ((m = line.match(/^(\s*)paraCada\s+(\w+)\s+en\s+(\w+)\s*:\s*$/))) {
    return `${indent}for (const ${m[2]} of ${m[3]}) {`;
  }

  // mientras cond:
  if ((m = line.match(/^(\s*)mientras\s+(.*):\s*$/))) return `${indent}while (${m[2]}) {`;

  // dejax nombre = asincrona (params) =>:   ->  let nombre = async (params) => {
  if ((m = line.match(/^(\s*)(dejax|constx)\s+(\w+)\s*=\s*asincrona\s*\(([^)]*)\)\s*=>\s*:\s*$/))) {
    const decl = m[2] === 'constx' ? 'const' : 'let';
    return `${indent}${decl} ${m[3]} = async (${m[4]}) => {`;
  }
  // dejax nombre = (params) =>:   ->  let nombre = (params) => {
  if ((m = line.match(/^(\s*)(dejax|constx)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*:\s*$/))) {
    const decl = m[2] === 'constx' ? 'const' : 'let';
    return `${indent}${decl} ${m[3]} = (${m[4]}) => {`;
  }

  // exportar por defecto X   ->   export default X;   (ES Modules)
  if ((m = line.match(/^(\s*)exportar\s+por\s+defecto\s+(.+?)\s*$/))) {
    return `${indent}export default ${m[2]};`;
  }

  if ((m = line.match(/^(\s*)importar\s+"([^"]+)"\s+como\s+(\w+)\s*$/))) {
    return `${indent}const ${m[3]} = require("${m[2]}");`;
  }

  // exportar nombre   O   exportar { objeto: literal }
  if ((m = line.match(/^(\s*)exportar\s+(.+?)\s*$/))) {
    return `${indent}module.exports = ${m[2]};`;
  }

  return replaceKeywords(line);
}

function closeBlocksByIndent(lines) {
  const out = [];
  const stack = [-1]; // sentinel: nada abierto a nivel superior
  const opensBlock = (l) => l.trim().endsWith('{');

  for (const line of lines) {
    if (line.trim() === '') { out.push(''); continue; }
    const indent = (line.match(/^(\s*)/)[1]).length;
    const isCloser = line.trim().startsWith('}'); // "} else {" / "}" / "}, { quoted: m })"

    // Si la línea ya trae su propio '}' (else/catch/objeto cerrado a mano),
    // consumimos un nivel de la pila sin emitir una llave extra.
    if (isCloser && stack.length > 1) {
      stack.pop();
    }

    // Cierra automáticamente cualquier bloque cuya sangría de apertura
    // sea igual o mayor a la sangría actual (volvimos a ese nivel o más atrás).
    while (stack.length > 1 && indent <= stack[stack.length - 1]) {
      const openIndent = stack.pop();
      out.push(' '.repeat(openIndent) + '}');
    }

    out.push(line);

    if (opensBlock(line)) stack.push(indent);
  }
  while (stack.length > 1) {
    const openIndent = stack.pop();
    out.push(' '.repeat(openIndent) + '}');
  }
  return out;
}

function transpile(source) {
  const lines = source.split('\n').map(transpileLine);
  return closeBlocksByIndent(lines).join('\n');
}

module.exports = { transpile };
