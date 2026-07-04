# EDW LANG

Un lenguaje propio, en español, que transpila a JavaScript. Hecho por **Edward Dev**, pensado para escribir comandos de bots de WhatsApp (Baileys) y APIs REST más rápido y con sintaxis propia.

Firma: todo arranca con `edw`.

## Instalación local

```bash
git clone https://github.com/Edward-oficial/edw-lang.git
cd edw-lang
npm install -g .
```

Esto te deja el comando `edw` disponible en cualquier carpeta.

## Uso

```bash
edw comando.edw          # genera comando.js
edw comando.edw --run    # genera y lo corre de una
```

## Ejemplo rápido

**`ping.edw`**
```
edw asincrona funcion run(sock, msg, args):
    edw intenta:
        edw dejax inicio = Date.now()
        edw espera sock.sendMessage(msg.key.remoteJid, { text: "🏓 Calculando..." })
        edw dejax demora = Date.now() - inicio
        edw espera sock.sendMessage(msg.key.remoteJid, { text: "🏓 Pong! " + demora + "ms" })
    edw atrapa error:
        edw krx error

edw exportar { command: "ping", run: run }
```

Corres `edw ping.edw` y te genera `ping.js`, listo para meter en la carpeta de comandos de tu bot.

## Sintaxis

| EDW | JavaScript |
|---|---|
| `dejax` / `constx` | `let` / `const` |
| `funcion` / `asincrona funcion` | `function` / `async function` |
| `espera` | `await` |
| `retorna` | `return` |
| `gritax` / `sux` / `krx` | `console.log` / `.info` / `.error` |
| `si` / `siotro` / `sino` | `if` / `else if` / `else` |
| `para i en 1..5:` | `for (let i = 1; i <= 5; i++)` |
| `paraCada x en lista:` | `for (const x of lista)` |
| `mientras` | `while` |
| `intenta` / `atrapa err` | `try` / `catch (err)` |
| `importar "x" como y` | `const y = require("x")` |
| `exportar y` | `module.exports = y` |
| `clase` | `class` |
| `verx` / `falsx` / `nullx` | `true` / `false` / `null` |
| `.agregarx(x)` | `.push(x)` |
| `.tamaniox()` | `.length` |
| `.obtenerx(i)` | `[i]` (solo índices numéricos literales por ahora) |
| `( comentario )` | `// comentario` |
| `:` + sangría de 4 espacios | `{ }` |

Más ejemplos en la carpeta [`examples/`](./examples).

## Cómo funciona por dentro

`src/edw2js.js` es un transpilador basado en líneas: lee el `.edw` línea por línea, reconoce los patrones de arriba, y arma las llaves `{ }` según la sangría (como Python). No es un parser con AST todavía — es una primera versión funcional.

## Limitaciones conocidas (honesto, para no prometer de más)

- Objetos literales solo funcionan bien en una sola línea.
- `.obtenerx(i)` no soporta variables como índice todavía, solo números literales.
- El anidamiento muy profundo (4+ niveles) no está probado a fondo.
- Los comentarios de fin de línea (código + comentario en la misma línea) no se detectan, solo comentarios en línea propia.

Si quieres mejorar algo de esto, los PRs son bienvenidos.

## Licencia

MIT — © 2026 Edward Dev
