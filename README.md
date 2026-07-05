<div align="center">

# 📱 Reveal Remote

### Control remoto inalámbrico para presentaciones reveal.js

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)]()
[![reveal.js](https://img.shields.io/badge/reveal.js-F2E142?style=for-the-badge&logo=revealdotjs&logoColor=black)]()
[![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=socketdotio&logoColor=white)]()
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)]()

**Navegá tus slides desde el celular sin instalar nada. Escaneá el QR y controlá la presentación.**

</div>

---

## 📋 Tabla de contenidos

- [¿Qué es?](#-qué-es)
- [¿Cómo funciona?](#-cómo-funciona)
- [Demo incluida](#-demo-incluida)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación y uso](#-instalación-y-uso)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Protocolo WebSocket](#-protocolo-websocket)
- [Personalizar para tu presentación](#-personalizar-para-tu-presentación)
- [Autores](#-autores)

---

## 🧐 ¿Qué es?

Este proyecto es un **control remoto inalámbrico para presentaciones reveal.js** que funciona a través de WebSocket. Con tu celular en la misma red podés navegar las slides usando **botones direccionales** o **gestos de deslizamiento** con estela visual animada, sin necesidad de instalar ninguna app.

Incluye una **presentación demo** que documenta la propia arquitectura del proyecto, pero podés **usar el control remoto con cualquier presentación reveal.js** agregando unas líneas de JavaScript.

---

## ⚙️ ¿Cómo funciona?

Tres actores se comunican a través de WebSocket:

```
📱 Celular (Controller)                      💻 PC (Display)
  remote.html                                  presentacion.html
       │                                            ▲
       │  { action: "right" }                       │
       ├─────────────── WebSocket ──────────────────┤
       │                                            │
       │                Servidor                    │
       │        Node.js + Express + ws              │
       │        (recibe del controller,             │
       │          reenvía al display)               │
       │                                            │
       └─────────────── WebSocket ──────────────────┘
                  { type: "slideInfo",
                 index: 3, fragment: 2 }
```

**Secuencia:**

1. El usuario ejecuta `node server/server.js` — el servidor se levanta en el puerto 3000
2. La PC abre `http://localhost:3000` — la presentación carga y se conecta al WebSocket como `display`
3. El celular escanea el QR que aparece en la presentación y abre `remote.html`
4. `remote.html` se conecta al WebSocket como `controller`
5. Cuando el usuario toca un botón o desliza el dedo, el celular envía `{ action: "right" }`
6. El servidor recibe el mensaje y lo reenvía al display
7. La presentación recibe `{ action: "right" }` y ejecuta `Reveal.next()`
8. La presentación responde con el estado actual: `{ type: "slideInfo", index: 3, total: 14, fragment: 2, totalFragments: 5 }`
9. El celular muestra el número de slide y actualiza la barra de progreso

---

## 🎮 Demo incluida

La presentación demo (`presentacion.html`) es una **charla técnica sobre el propio proyecto** e incluye:

- **11 diapositivas** que cubren problema, arquitectura, protocolo y stack
- Diagramas visuales de la arquitectura (controller ↔ server ↔ display)
- Explicación del protocolo WebSocket
- QR modal con animación de apertura

> 💡 El control remoto funciona con **cualquier presentación reveal.js**. Solo necesitás agregar el código WebSocket del lado del display.

---

## ✨ Características

| Característica                 | Detalle                                                         |
| ------------------------------ | --------------------------------------------------------------- |
| 📱 **Sin instalación**         | No requiere app, funciona en el navegador del celular           |
| 🔗 **Conexión por QR**         | Modal centrado con drop animation, se cierra automáticamente    |
| 🕹️ **Botones direccionales**   | D-Pad con arriba, abajo, anterior, siguiente + feedback háptico |
| 👆 **Gesture trail**           | Estela visual con fade-out gradual al levantar el dedo          |
| 🔄 **Reconexión automática**   | Backoff exponencial (2s → 15s), indicador visual de estado      |
| 📊 **Sincronización de slide** | Muestra slide + fragmento (ej: 2.3) y barra de progreso         |
| ⌨️ **Long-press**              | Mantener un botón lo repite cada 80ms tras 300ms de hold        |
| 🖤 **Diseño OLED**             | Fondo `#000000`, monocromático con acento azul                  |
| 🌐 **Sin frameworks**          | JS vanilla, cero dependencias del lado del cliente              |
| 🔌 **Un solo puerto**          | HTTP + WebSocket conviven sin CORS ni proxy                     |

---

## 🛠️ Tecnologías

| Tecnología               | Versión | Rol                                                  |
| ------------------------ | ------- | ---------------------------------------------------- |
| **Node.js**              | —       | Entorno de ejecución del servidor                    |
| **Express**              | ^5.2    | Servidor HTTP + routing                              |
| **ws**                   | ^8.21   | WebSocket server para relay                          |
| **reveal.js**            | ^6.0    | Framework de presentaciones (demo)                   |
| **qrcode**               | ^1.5    | Generación de QR server-side                         |
| **JavaScript (vanilla)** | —       | Cliente WebSocket en remote.html y presentacion.html |
| **HTML5 / CSS3**         | —       | Interfaz del control remoto y la presentación        |

---

## 🚀 Instalación y uso

### Requisitos

- [Node.js](https://nodejs.org/) (v16 o superior)
- Un navegador moderno en la PC
- Un celular en la misma red Wi-Fi

### Pasos

```bash
# 1. Clonar
git clone https://github.com/PierSoco/Reveal-Remote.git
cd Reveal-Remote

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
node server/server.js
```

### Conectar

```
En la PC:
  → Abrí http://localhost:3000
  → Mové el mouse al borde superior de la pantalla

En el celular:
  → Escaneá el código QR que aparece en la presentación
  → O abrí http://<IP_DE_LA_PC>:3000/remote
```

## 📁 Estructura del proyecto

```
📦 Reveal-Remote/
├── 📁 server/
│   └── 📄 server.js              # Servidor HTTP + WebSocket + QR
├── 📁 public/
│   ├── 📄 presentacion.html      # Presentación demo (reveal.js) + QR modal
│   └── 📄 remote.html            # Control remoto para celular 📱
├── 📄 package.json               # Dependencias
└── 📄 README.md                  # Este archivo
```

---

## 🏗️ Arquitectura

### Servidor (`server/server.js`)

El servidor tiene dos responsabilidades en un mismo puerto:

**HTTP (Express 5):**

- Sirve archivos estáticos desde `public/`
- `GET /api/qr?url=...` → Genera un QR code y lo devuelve como data URL

**WebSocket (ws):**

- Gestiona dos tipos de clientes: `display` (la presentación) y `controller` (el celular)
- Retransmite mensajes entre ellos

### Cliente display (`presentacion.html`)

Se conecta al WebSocket, escucha comandos `action` y los pasa a Reveal.js. También escucha `slidechanged`, `fragmentshown` y `fragmenthidden` para enviar el estado actualizado al control remoto.

### Cliente controller (`remote.html`)

Interfaz táctil optimizada para celular con:

- D-Pad direccional con long-press
- Gesture trail con canvas + fade-out animado
- Indicador de conexión y barra de progreso
- Reconexión automática con backoff exponencial

---

## 🔌 Protocolo WebSocket

### Display → Servidor

```json
{ "type": "display" }
// Registra la presentación como display
```

### Controller → Servidor

```json
{ "type": "controller" }
// Registra el control remoto como controller
```

### Controller → Servidor → Display

```json
{ "action": "left" | "right" | "up" | "down" }
// Comando de navegación
```

### Display → Servidor → Controller

```json
{
  "type": "slideInfo",
  "index": 3,
  "total": 14,
  "fragment": 2,
  "totalFragments": 5
}
// Información del slide actual con fragmento
```

### Servidor → Display

```json
{ "type": "controller-connected" }
// Se envía cuando un controller se conecta
```

---

## 🛠️ Personalizar para tu presentación

Para usar este control remoto con **tu propia presentación reveal.js**, agregá este código al final de tu HTML (antes de `</body>`):

```javascript
<script>
(function() {
  const ws = new WebSocket('ws://' + window.location.host);
  ws.onopen = () => ws.send(JSON.stringify({ type: 'display' }));
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'controller-connected') {
      // Opcional: cerrar QR, entrar en fullscreen, etc.
    } else if (msg.action) {
      if (msg.action === 'right') Reveal.right();
      else if (msg.action === 'left') Reveal.left();
      else if (msg.action === 'up') Reveal.up();
      else if (msg.action === 'down') Reveal.down();
    }
  };
  function sendSlideState() {
    const i = Reveal.getIndices();
    const el = Reveal.getCurrentSlide();
    const frags = el ? el.querySelectorAll('.fragment').length : 0;
    ws.send(JSON.stringify({
      type: 'slideInfo',
      index: i.h + 1,
      total: Reveal.getTotalSlides(),
      fragment: i.f >= 0 ? i.f + 1 : 0,
      totalFragments: frags
    }));
  }
  Reveal.addEventListener('ready', () => {
    Reveal.addEventListener('slidechanged', sendSlideState);
    Reveal.addEventListener('fragmentshown', sendSlideState);
    Reveal.addEventListener('fragmenthidden', sendSlideState);
  });
})();
</script>
```

---

## 👥 Autores

- **Socodober Pierre** — [GitHub](https://github.com/PierSoco)

---

## 📄 Licencia

MIT — Sentite libre de usarlo, modificarlo y compartirlo.

---

<div align="center">
  <a href="https://github.com/PierSoco/Reveal-Remote">github.com/PierSoco/Reveal-Remote</a>
</div>
