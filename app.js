const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3001;

const url = 'mongodb+srv://braulio:braulio08@cluster0.ery9khc.mongodb.net/?retryWrites=true&w=majority&appName=<APP_NAME>';
const dbName = 'Proyecto';
const collectionName = 'PAEC';

app.use(express.urlencoded({ extended: true }));

// ✅ Página principal con filtros
app.get('/', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // 👇 Filtros dinámicos
        const filtro = {};
        if (req.query.Id) filtro.Id = req.query.Id;
        if (req.query.Nombre) filtro.Nombre = { $regex: req.query.Nombre, $options: 'i' };
        if (req.query.Tipo) filtro.Tipo = req.query.Tipo;
        if (req.query.Correo) filtro.Correo = { $regex: req.query.Correo, $options: 'i' };
        if (req.query.Telefono) filtro.Telefono = req.query.Telefono;
        if (req.query.Kilos_reciclados) filtro.Kilos_reciclados = parseFloat(req.query.Kilos_reciclados);
        if (req.query.Lugar_de_recoleccion) filtro.Lugar_de_recoleccion = { $regex: req.query.Lugar_de_recoleccion, $options: 'i' };
        if (req.query.Fecha_de_entrega) filtro.Fecha_de_entrega = req.query.Fecha_de_entrega;
        if (req.query.Hora_de_entrega) filtro.Hora_de_entrega = req.query.Hora_de_entrega;

        const docs = await collection.find(filtro).sort({ Id: 1 }).toArray();

        let html = `
        <html>
        <head>
            <title>Participantes</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ccc; padding: 8px; }
                th { background: #f4f4f4; }
                a.button, button { padding: 6px 10px; margin: 2px; border-radius: 4px; text-decoration: none; border: none; color: white; cursor: pointer; }
                .edit { background: #ffc107; }
                .delete { background: #dc3545; }
                .add { background: #28a745; display: inline-block; margin-top: 20px; }
                .filter-form { margin-bottom: 20px; }
                .filter-form input, .filter-form select { margin-right: 10px; }
                .filter { background: #007bff; }
            </style>
        </head>
        <body>
            <h2>Lista de Participantes</h2>

            <form method="GET" class="filter-form">
                <input name="Id" placeholder="Id" value="${req.query.Id || ''}">
                <input name="Nombre" placeholder="Nombre" value="${req.query.Nombre || ''}">
                <select name="Tipo">
                    <option value="">Tipo</option>
                    <option value="Estudiante"${req.query.Tipo === 'Estudiante' ? ' selected' : ''}>Estudiante</option>
                    <option value="Docente"${req.query.Tipo === 'Docente' ? ' selected' : ''}>Docente</option>
                    <option value="Administrativo"${req.query.Tipo === 'Administrativo' ? ' selected' : ''}>Administrativo</option>
                    <option value="Directivo"${req.query.Tipo === 'Directivo' ? ' selected' : ''}>Directivo</option>
                </select>
                <input name="Correo" placeholder="Correo" value="${req.query.Correo || ''}">
                <input name="Telefono" placeholder="Teléfono" value="${req.query.Telefono || ''}">
                <input name="Kilos_reciclados" placeholder="Kilos" value="${req.query.Kilos_reciclados || ''}">
                <input name="Lugar_de_recoleccion" placeholder="Lugar" value="${req.query.Lugar_de_recoleccion || ''}">
                <input name="Fecha_de_entrega" type="date" value="${req.query.Fecha_de_entrega || ''}">
                <input name="Hora_de_entrega" placeholder="Hora" value="${req.query.Hora_de_entrega || ''}">
                <button class="filter" type="submit">Filtrar</button>
                <a href="/" class="button" style="background:#6c757d;">Limpiar</a>
            </form>

            <table>
                <tr>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Kilos reciclados</th>
                    <th>Lugar de recolección</th>
                    <th>Fecha de entrega</th>
                    <th>Hora de entrega</th>
                    <th>Acciones</th>
                </tr>`;

        docs.forEach(doc => {
            html += `
                <tr>
                    <td>${doc.Id}</td>
                    <td>${doc.Nombre}</td>
                    <td>${doc.Tipo}</td>
                    <td>${doc.Correo}</td>
                    <td>${doc.Telefono}</td>
                    <td>${doc.Kilos_reciclados}</td>
                    <td>${doc.Lugar_de_recoleccion}</td>
                    <td>${doc.Fecha_de_entrega}</td>
                    <td>${doc.Hora_de_entrega}</td>
                    <td>
                        <form method="POST" action="/delete/${doc._id}" onsubmit="return confirm('¿Eliminar a ${doc.Nombre}?');">
                            <button class="delete">Eliminar</button>
                        </form>
                        <a href="/edit/${doc._id}" class="button edit">Editar</a>
                    </td>
                </tr>`;
        });

        html += `
            </table>
            <a href="/form" class="button add">Agregar Participante</a>
        </body>
        </html>`;

        res.send(html);
    } finally {
        await client.close();
    }
});

// ✅ Formulario nuevo participante
app.get('/form', (req, res) => {
    res.send(`
        <html>
        <head><title>Nuevo Participante</title></head>
        <body>
            <h2>Agregar Participante</h2>
            <form method="POST" action="/add">
                <label>Id: <input name="Id" required></label><br>
                <label>Nombre: <input name="Nombre" required></label><br>
                <label>Tipo: <input name="Tipo" required></label><br>
                <label>Correo: <input name="Correo" type="email" required></label><br>
                <label>Telefono: <input name="Telefono" required></label><br>
                <label>Kilos reciclados: <input name="Kilos_reciclados" type="number" required></label><br>
                <label>Lugar de recolección: <input name="Lugar_de_recoleccion" required></label><br>
                <label>Fecha de entrega: <input name="Fecha_de_entrega" type="date" required></label><br>
                <label>Hora de entrega: <input name="Hora_de_entrega" required></label><br>
                <button type="submit">Guardar</button>
            </form>
            <br><a href="/">← Volver</a>
        </body>
        </html>
    `);
});

// ✅ Insertar
app.post('/add', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const data = {
            Id: req.body.Id,
            Nombre: req.body.Nombre,
            Tipo: req.body.Tipo,
            Correo: req.body.Correo,
            Telefono: req.body.Telefono,
            Kilos_reciclados: parseFloat(req.body.Kilos_reciclados),
            Lugar_de_recoleccion: req.body.Lugar_de_recoleccion,
            Fecha_de_entrega: req.body.Fecha_de_entrega,
            Hora_de_entrega: req.body.Hora_de_entrega
        };
        await db.collection(collectionName).insertOne(data);
        res.redirect('/');
    } finally {
        await client.close();
    }
});

// ✅ Eliminar
app.post('/delete/:id', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        await db.collection(collectionName).deleteOne({ _id: new ObjectId(req.params.id) });
        res.redirect('/');
    } finally {
        await client.close();
    }
});

// ✅ Editar
app.get('/edit/:id', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const doc = await db.collection(collectionName).findOne({ _id: new ObjectId(req.params.id) });
        if (!doc) return res.status(404).send('Participante no encontrado.');

        res.send(`
            <html>
            <body>
                <h2>Editar Participante</h2>
                <form method="POST" action="/update/${doc._id}">
                    <label>Id: <input name="Id" value="${doc.Id}"></label><br>
                    <label>Nombre: <input name="Nombre" value="${doc.Nombre}"></label><br>
                    <label>Tipo: <input name="Tipo" value="${doc.Tipo}"></label><br>
                    <label>Correo: <input name="Correo" value="${doc.Correo}"></label><br>
                    <label>Telefono: <input name="Telefono" value="${doc.Telefono}"></label><br>
                    <label>Kilos reciclados: <input name="Kilos_reciclados" value="${doc.Kilos_reciclados}"></label><br>
                    <label>Lugar de recolección: <input name="Lugar_de_recoleccion" value="${doc.Lugar_de_recoleccion}"></label><br>
                    <label>Fecha de entrega: <input name="Fecha_de_entrega" value="${doc.Fecha_de_entrega}"></label><br>
                    <label>Hora de entrega: <input name="Hora_de_entrega" value="${doc.Hora_de_entrega}"></label><br>
                    <button type="submit">Actualizar</button>
                </form>
                <br><a href="/">← Volver</a>
            </body>
            </html>
        `);
    } finally {
        await client.close();
    }
});

// ✅ Actualizar
app.post('/update/:id', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const updated = {
            Id: req.body.Id,
            Nombre: req.body.Nombre,
            Tipo: req.body.Tipo,
            Correo: req.body.Correo,
            Telefono: req.body.Telefono,
            Kilos_reciclados: parseFloat(req.body.Kilos_reciclados),
            Lugar_de_recoleccion: req.body.Lugar_de_recoleccion,
            Fecha_de_entrega: req.body.Fecha_de_entrega,
            Hora_de_entrega: req.body.Hora_de_entrega
        };
        await db.collection(collectionName).updateOne({ _id: new ObjectId(req.params.id) }, { $set: updated });
        res.redirect('/');
    } finally {
        await client.close();
    }
});

// ✅ Ejecutar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});
