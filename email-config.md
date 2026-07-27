# 📧 Configuración de Email para Pulsera Inteligente

## 🔧 Paso 1: Activar en Gmail

Para que funcione el envío automático de emails a **shoncita1@gmail.com**, necesitas configurar tu cuenta de Gmail:

### Opción A: Usar Gmail (Recomendado)

1. **Crear una contraseña de aplicación de Gmail:**
   - Ve a: https://myaccount.google.com/security
   - Busca "Contraseñas de aplicaciones" o "App passwords"
   - Si no ves la opción, primero activa "Verificación en dos pasos"
   - Selecciona "Correo" y "Windows Computer"
   - Gmail te dará una contraseña de 16 caracteres como: `abcd efgh ijkl mnop`

2. **Actualizar server.js líneas 14-17:**
   ```javascript
   const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
           user: 'TU-EMAIL@gmail.com', // Tu email de Gmail
           pass: 'abcd efgh ijkl mnop'  // La contraseña de aplicación
       }
   });
   ```

3. **También actualiza la línea 24:**
   ```javascript
   from: 'Pulsera Inteligente <TU-EMAIL@gmail.com>',
   ```

### Opción B: Usar servicio SMTP gratuito (Alternativa)

Si no quieres usar Gmail, puedes usar servicios como:

#### SendGrid (Gratis hasta 100 emails/día)
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: 'TU_API_KEY_DE_SENDGRID'
    }
});
```

#### Mailgun (Gratis hasta 100 emails/día)
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: 'postmaster@tu-dominio.mailgun.org',
        pass: 'TU_PASSWORD_MAILGUN'
    }
});
```

## 📧 Qué recibirás en el email

Cuando alguien active la pulsera, recibirás un email con:

- ✅ Fecha y hora exacta
- ✅ Dirección IP del dispositivo
- ✅ Ubicación GPS (latitud y longitud)
- ✅ Precisión del GPS en metros
- ✅ Botón para abrir en Google Maps
- ✅ Información del dispositivo
- ✅ ID del registro en la base de datos

## 🧪 Probar el envío de email

Una vez configurado:

1. Reinicia el servidor: `npm start`
2. Abre el link desde tu celular
3. Revisa tu bandeja de entrada en **shoncita1@gmail.com**
4. Si no llega, revisa la carpeta de SPAM

## ⚠️ Solución de Problemas

**Error: "Invalid login"**
- Verifica que usaste la contraseña de aplicación, NO tu contraseña normal de Gmail
- Asegúrate de activar "Verificación en dos pasos" primero

**Error: "self signed certificate"**
- Agrega esta línea en la configuración del transporter:
  ```javascript
  tls: { rejectUnauthorized: false }
  ```

**Los emails no llegan:**
- Revisa la carpeta de SPAM
- Verifica que el email remitente sea válido
- Mira la consola del servidor para ver si hay errores

**Para modo desarrollo (sin email real):**
Si solo quieres probar sin configurar email, puedes usar Ethereal (emails falsos):
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal-password'
    }
});
```

## 📝 Ejemplo de Email Recibido

```
📍 Pulsera Inteligente
Nueva ubicación detectada

📊 Información Capturada

🕐 Fecha y Hora:
27/7/2026, 10:30:15

🌐 Dirección IP:
192.168.1.50

📍 Ubicación GPS:
Latitud: 40.416805
Longitud: -3.703825
Precisión: 20 metros

[🗺️ Ver en Google Maps] (botón clickeable)

📱 Dispositivo:
Mozilla/5.0 (iPhone; CPU iPhone OS...

🔢 ID de Registro: 1
```

## 🎓 Para tu Presentación

Muestra al profesor:
1. La configuración del email en `server.js`
2. Un email recibido en tiempo real
3. Cómo abre el link en Google Maps desde el email
4. El código de la función `sendLocationEmail()`

¡Impresionará mucho que envíe emails automáticamente! 📧🎉
