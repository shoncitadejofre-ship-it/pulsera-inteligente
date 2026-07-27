# 🚀 Cómo Desplegar la Pulsera Inteligente

## ❌ ¿Por qué NO usar Netlify?

**Netlify solo funciona para sitios estáticos** (HTML, CSS, JavaScript puro)

Tu proyecto necesita:
- ✅ Servidor Node.js corriendo 24/7
- ✅ Base de datos SQLite
- ✅ Envío de emails
- ✅ APIs backend

Por eso Netlify **NO funcionará**.

---

## ✅ Opción 1: Render.com (GRATIS - RECOMENDADO) 🌟

**Perfecto para tu proyecto universitario**

### Características:
- ✅ **100% GRATIS** (plan gratuito permanente)
- ✅ Soporta Node.js + SQLite
- ✅ Te da un link público: `https://tu-pulsera.onrender.com`
- ✅ SSL automático (HTTPS)
- ✅ Fácil de configurar

### Pasos para desplegar:

#### 1. Subir tu código a GitHub

```cmd
cd "C:\Users\shonc\Desktop\Nueva carpeta"
git init
git add .
git commit -m "Pulsera Inteligente - Primera versión"
```

Luego crea un repositorio en GitHub y súbelo:
```cmd
git remote add origin https://github.com/TU-USUARIO/pulsera-inteligente.git
git push -u origin main
```

#### 2. Crear cuenta en Render

1. Ve a: https://render.com
2. Regístrate con tu cuenta de GitHub
3. Haz clic en **"New +"** → **"Web Service"**

#### 3. Conectar tu repositorio

1. Busca tu repositorio `pulsera-inteligente`
2. Haz clic en **"Connect"**

#### 4. Configurar el servicio

- **Name:** `pulsera-inteligente`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

#### 5. Variables de entorno (para el email)

En la sección **"Environment Variables"** agrega:

```
EMAIL_USER = tu-email@gmail.com
EMAIL_PASS = tu-contraseña-de-aplicacion
```

#### 6. Deploy

Haz clic en **"Create Web Service"**

¡Listo! En 2-3 minutos tendrás tu link:
```
https://pulsera-inteligente.onrender.com
```

**Importante:** En el plan gratuito, si nadie usa el link por 15 minutos, el servidor "duerme". La primera visita tardará 30-50 segundos en despertar.

---

## ✅ Opción 2: Railway.app (GRATIS con límite)

### Características:
- ✅ **$5 USD gratis al mes** (sin tarjeta)
- ✅ Más rápido que Render
- ✅ No se duerme el servidor

### Pasos:

1. Ve a: https://railway.app
2. Regístrate con GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Selecciona tu repositorio
5. Railway detecta Node.js automáticamente
6. Agrega variables de entorno para email
7. Deploy automático

Link: `https://pulsera-inteligente.up.railway.app`

---

## ✅ Opción 3: Heroku (Ya NO es gratis)

Heroku eliminó su plan gratuito en 2022. Ahora cuesta $7/mes mínimo.

**No recomendado** para proyecto universitario.

---

## ✅ Opción 4: Vercel (Con Serverless Functions)

Vercel es gratis pero requiere **modificar el código** para usar Serverless Functions en vez de un servidor tradicional.

**Más complejo** - solo si tienes experiencia.

---

## ✅ Opción 5: Replit (GRATIS y más fácil)

### Características:
- ✅ **Completamente GRATIS**
- ✅ **No necesitas GitHub**
- ✅ Editas código directo en el navegador
- ✅ Deploy instantáneo

### Pasos:

1. Ve a: https://replit.com
2. Crea una cuenta
3. **"+ Create Repl"** → **"Import from GitHub"** o sube archivos
4. Selecciona **"Node.js"** como lenguaje
5. Replit detecta automáticamente `server.js`
6. Haz clic en **"Run"**
7. Te da un link público automáticamente

Link: `https://pulsera-inteligente.TU-USUARIO.repl.co`

**Ventaja:** No necesitas configurar nada, solo pegar tu código.

**Desventaja:** En plan gratuito, el servidor se apaga si no hay visitas por 1 hora.

---

## 📝 Archivos necesarios para el despliegue

Ya están creados, pero asegúrate de tener:

### 1. `package.json` ✅
```json
{
  "name": "smart-bracelet-tracker",
  "scripts": {
    "start": "node server.js"
  }
}
```

### 2. `.gitignore` ✅
```
node_modules/
*.db
logs/
.env
```

### 3. `server.js` ✅
Asegúrate de que escucha en el puerto correcto:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## 🔧 Modificaciones necesarias para producción

### 1. Usar variables de entorno para el email

Actualiza `server.js` líneas 14-17:

```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu-contraseña'
    }
});
```

Y línea 24:
```javascript
from: `Pulsera Inteligente <${process.env.EMAIL_USER || 'tu-email@gmail.com'}>`,
```

### 2. Puerto dinámico

Ya está configurado, pero verifica:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## 🎯 Recomendación Final

Para tu proyecto universitario:

### **Usa Render.com**

**Por qué:**
1. ✅ **Completamente gratis** (sin tarjeta de crédito)
2. ✅ Te da un **link HTTPS** profesional
3. ✅ Fácil de mostrar al profesor
4. ✅ Soporta Node.js + SQLite + Email
5. ✅ Deploy automático desde GitHub

**Link final:**
```
https://pulsera-inteligente-xyz.onrender.com
```

Ese link lo puedes abrir desde cualquier celular en el mundo. ¡Perfecto para tu presentación! 🎓

---

## 📱 Después del despliegue

1. **Prueba el link** desde tu celular
2. **Verifica que llegue el email** a shoncita1@gmail.com
3. **Abre el dashboard:** `https://tu-link.onrender.com/dashboard`
4. **Listo para presentar al profesor** 🎉

---

## ⚠️ Importante sobre GPS en producción

Los navegadores **solo permiten geolocalización en HTTPS** (conexiones seguras).

- ✅ **Render/Railway/Vercel:** Incluyen HTTPS automático
- ✅ **Replit:** Incluye HTTPS
- ❌ **localhost:** Funciona sin HTTPS solo en desarrollo

Por eso es importante desplegar en un servicio con HTTPS.

---

## 💡 Alternativa Simple (Sin desplegar)

Si solo necesitas probarlo para la presentación:

1. **Usa tu IP local** (como hasta ahora)
2. **Comparte la red WiFi** con el profesor
3. **Muestra el código** en tu computadora

Pero un **link público** es más impresionante para la nota. 😉
