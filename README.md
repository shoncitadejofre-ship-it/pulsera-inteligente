# 📍 Pulsera Inteligente - Proyecto Universitario

Sistema de geolocalización en tiempo real que simula el funcionamiento de una pulsera inteligente con GPS. Registra ubicación, IP, y capturas de pantalla en una base de datos SQLite.

## 📋 Características

- ✅ **Geolocalización GPS** - Captura ubicación exacta (latitud y longitud)
- ✅ **Google Maps integrado** - Muestra ubicación en mapa interactivo
- ✅ **Base de datos SQLite** - Almacenamiento persistente de datos
- ✅ **Registro de IP** - Dirección del dispositivo
- ✅ **Capturas automáticas** - Screenshots de cada activación
- ✅ **Dashboard en tiempo real** - Visualización de todas las ubicaciones
- ✅ **Precisión GPS** - Indica la exactitud de la ubicación

## 🚀 Instalación Rápida

### Paso 1: Instalar dependencias
```cmd
npm install
```

### Paso 2: Iniciar servidor
```cmd
npm start
```

## 📱 Cómo Usar (Simula tu Pulsera)

### Para activar desde tu celular:

1. **Encuentra tu IP local:**
   ```cmd
   ipconfig
   ```
   Busca "Dirección IPv4" (ej: 192.168.1.100)

2. **Abre en tu celular:**
   ```
   http://TU_IP:3000
   ```
   Ejemplo: `http://192.168.1.100:3000`

3. **Permite acceso a ubicación cuando te lo pida**

4. **Ver resultados en dashboard:**
   En tu computadora: `http://localhost:3000/dashboard`

## 🗺️ Funcionalidades del Sistema

### Lo que captura automáticamente:
- 📍 **Ubicación GPS precisa** (latitud y longitud)
- 📏 **Precisión** (en metros)
- 🌐 **Dirección IP**
- 📸 **Captura de pantalla**
- 🕐 **Fecha y hora exacta**
- 📱 **Información del dispositivo** (navegador, OS)

### Dashboard incluye:
- 🗺️ **Mapa interactivo de Google Maps** para cada ubicación
- 📊 **Estadísticas**: Total visitas, con GPS, IPs únicas
- 🔗 **Link directo a Google Maps** para cada registro
- 📸 **Capturas guardadas**
- ⚡ **Actualización automática** cada 10 segundos

## 💾 Base de Datos

Los datos se guardan en `bracelet_tracking.db` con esta estructura:

```sql
CREATE TABLE visits (
    id INTEGER PRIMARY KEY,
    timestamp TEXT,
    ip TEXT,
    latitude REAL,
    longitude REAL,
    accuracy REAL,
    user_agent TEXT,
    screenshot_file TEXT,
    created_at DATETIME
)
```

## 🎯 Para tu Presentación Universitaria

### Demuestra al profesor:

1. **Código del servidor** (`server.js`)
   - Muestra cómo captura GPS
   - Explica la integración con Google Maps
   - Muestra la base de datos SQLite

2. **Demo en vivo:**
   - Abre el link desde tu celular
   - Permite acceso a ubicación GPS
   - Muestra el dashboard con:
     - ✅ Tu ubicación en el mapa
     - ✅ Coordenadas exactas
     - ✅ Captura de pantalla
     - ✅ Precisión GPS

3. **Base de datos:**
   - Muestra la tabla con todos los datos
   - Explica cómo se almacena cada registro

## 📊 Ejemplo de Datos Capturados

```json
{
  "id": 1,
  "timestamp": "2026-07-27T10:30:00Z",
  "ip": "192.168.1.50",
  "latitude": 40.4168,
  "longitude": -3.7038,
  "accuracy": 20.5,
  "user_agent": "Mozilla/5.0 (iPhone...)",
  "screenshot_file": "screenshot_1722078600000.png"
}
```

## 🔧 Tecnologías Utilizadas

- **Node.js** - Servidor backend
- **Express** - Framework web
- **SQLite** (better-sqlite3) - Base de datos
- **Google Maps API** - Visualización de mapas
- **Geolocation API** - Captura GPS del navegador
- **html2canvas** - Capturas de pantalla

## 📁 Estructura del Proyecto

```
pulsera-inteligente/
├── server.js                  # Servidor con BD
├── package.json              # Dependencias
├── bracelet_tracking.db      # Base de datos SQLite
├── public/
│   ├── index.html           # Página que captura GPS
│   └── dashboard.html       # Panel con mapas
└── logs/
    └── screenshots/         # Capturas guardadas
```

## 🌍 Concepto de Pulsera Inteligente

Este proyecto simula una pulsera de seguridad que podría usarse para:
- Monitoreo de personas mayores
- Seguridad de niños
- Rastreo de personal en campo
- Sistemas de emergencia con geolocalización

Cuando alguien "activa" la pulsera (abre el link), el sistema registra automáticamente su ubicación exacta y datos relevantes.

## ⚠️ Permisos de Ubicación

**Importante:** El navegador pedirá permiso para acceder a la ubicación. Debes aceptar para que funcione el GPS.

Si no acepta:
- ✅ El sistema sigue funcionando
- ⚠️ Solo guarda IP y captura (sin GPS)
- ℹ️ Dashboard muestra "Sin ubicación GPS"

## 📞 Solución de Problemas

**No captura la ubicación:**
- Verifica que aceptaste los permisos de ubicación
- Usa HTTPS en producción (HTTP funciona en localhost)
- Algunos navegadores bloquean GPS en HTTP

**No puedo ver desde el celular:**
- Verifica estar en la misma WiFi
- Usa la IP correcta (no 127.0.0.1)
- Desactiva el firewall temporalmente

**Error de base de datos:**
- Elimina `bracelet_tracking.db` y reinicia
- Verifica que se instaló `better-sqlite3` correctamente

## 🎓 Aspectos Éticos del Proyecto

El sistema incluye:
- ✅ Aviso claro de que se capturará ubicación
- ✅ Solicitud de permisos GPS explícita
- ✅ Propósito educativo claramente identificado
- ✅ Transparencia en la información capturada

## 📝 Licencia

Proyecto educativo para fines universitarios - 2026
