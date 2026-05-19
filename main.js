const express = require('express');
const fs      = require('fs');
const path    = require('path');
const cors    = require('cors');

const app = express();
const PORT = 5000;
const DB   = path.join(__dirname, 'contacts.json');

// ── Middleware ──────────────────────────────────────────
app.use(cors());                          // autorise les requêtes depuis index.html
app.use(express.json());                  // parse le body JSON
app.use(express.static(__dirname));       // sert les fichiers statiques (index.html, images…)

// ── Helper : lire / écrire le fichier JSON ──────────────
const readDB  = () => JSON.parse(fs.readFileSync(DB, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2), 'utf-8');

// Crée contacts.json s'il n'existe pas encore
if (!fs.existsSync(DB)) {
    writeDB({ contacts: [] });
    console.log('📁 contacts.json créé.');
}

// ── POST /api/contact ───────────────────────────────────
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Validation basique
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Champs manquants.' });
    }

    try {
        const data  = readDB();
        const entry = {
            id:      Date.now(),
            name:    name.trim(),
            email:   email.trim().toLowerCase(),
            message: message.trim(),
            date:    new Date().toISOString(),
            read:    false,
        };

        data.contacts.push(entry);
        writeDB(data);

        console.log(`✅ Nouveau message de ${entry.name} <${entry.email}>`);
        res.json({ success: true, id: entry.id });
    } catch (err) {
        console.error('Erreur écriture JSON :', err);
        res.status(500).json({ success: false, error: 'Erreur serveur.' });
    }
});

// ── GET /api/contacts  (optionnel – pour consulter les messages) ──
app.get('/api/contacts', (req, res) => {
    try {
        const data = readDB();
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Erreur lecture.' });
    }
});

// ── Démarrage ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📬 API contact  : POST http://localhost:${PORT}/api/contact`);
    console.log(`📋 Voir messages: GET  http://localhost:${PORT}/api/contacts`);
});