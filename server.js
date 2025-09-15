const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');

// Inicializa la aplicación de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Base de datos "simulada" en la memoria del servidor
const urlDatabase = {};

// Middleware para procesar los datos enviados en formato JSON
app.use(express.json());

// ******* CAMBIO AQUÍ *******
// Middleware para servir archivos estáticos desde la carpeta 'public'
// Si el usuario visita la raíz ('/'), Express servirá el archivo index.html por defecto
app.use(express.static(path.join(__dirname, 'public')));
// **************************

// API para acortar URLs
// Este endpoint recibe los datos del frontend (la URL larga y la personalizada)
app.post('/api/shorten', (req, res) => {
    const { longUrl, customSlug } = req.body;
    
    // Validar si la URL larga existe
    if (!longUrl) {
        return res.status(400).json({ error: 'Falta la URL larga.' });
    }
    
    let shortId;
    if (customSlug) {
        // Usar el nombre personalizado y verificar si ya existe
        if (urlDatabase[customSlug]) {
            return res.status(409).json({ error: 'Ese nombre personalizado ya está en uso.' });
        }
        shortId = customSlug;
    } else {
        // Generar un ID aleatorio si no hay nombre personalizado
        shortId = nanoid(8);
    }
    
    // Guardar el par de URLs en la base de datos simulada
    urlDatabase[shortId] = longUrl;
    
    // Construir el enlace corto completo
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
    res.status(200).json({ shortUrl });
});

// Redirección para los enlaces cortos
// Cuando alguien visita un enlace como https://mi-dominio.com/abcde, este código lo captura
app.get('/:shortId', (req, res) => {
    const { shortId } = req.params;
    const longUrl = urlDatabase[shortId];
    
    if (longUrl) {
        // Si el enlace existe, redirige al usuario a la URL original
        res.redirect(longUrl);
    } else {
        // Si no existe, muestra un mensaje de error 404
        res.status(404).send('URL no encontrada.');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});