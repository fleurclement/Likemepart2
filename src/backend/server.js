import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const PORT = 3000;

// Habilitar CORS
app.use(cors());

// Configurar middleware para analizar JSON
app.use(express.json());

// Configuración de la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'likeme',
  password: 'lila',
  port: 5434,
});

// Probar conexión a la base de datos
pool.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos');
  }
});


// Ruta GET para obtener todos los posts

app.get('/posts', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM posts');
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener posts:', error);
      res.status(500).json({ error: 'Error al obtener posts' });
    }
  });

//  Ruta POST para agregar un nuevo post:

app.post('/posts', async (req, res) => {
    const { titulo, url, descripcion } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *',
        [titulo, url, descripcion, 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al agregar post:', error);
      res.status(500).json({ error: 'Error al agregar post' });
    }
  });
app.get('*', (req, res) => {
 res.status(404).send('esta ruta no existe');
});  
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
  
// Agregar  la Ruta PUT para registrar
  app.put('/posts/like/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al registrar like:', error);
      res.status(500).json({ error: 'Error al registrar like' });
    }
  });

//   Agregar la ruta Delete para eliminar post
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }
      res.json({ mensaje: 'Post eliminado', post: result.rows[0] });
    } catch (error) {
      console.error('Error al eliminar post:', error);
      res.status(500).json({ error: 'Error al eliminar post' });
    }
  });
  