const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://orders-api-ly0t.onrender.com'] // Ajusta según tus URLs de frontend
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'uploads/' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deisyrestore@gmail.com',
    pass: 'dalrvzbqrqnotqfc' // contraseña de app
  }
});

app.post('/upload-pdf', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
  }

  const filePath = path.join(__dirname, req.file.path);

  const emailCliente = req.body.emailCliente;
  const nombreCliente = req.body.nombreCliente || "No especificado";
  const direccionEnvio = req.body.direccionEnvio || "No especificada";
  const nombreOrden = req.body.nombreOrden || req.file.originalname;

  if (!emailCliente) {
    return res.status(400).json({ success: false, message: 'No se recibió email del cliente' });
  }

  const mailOptions = {
    from: 'deisyrestore@gmail.com',
    to: ['jorgerensoraji@hotmail.com', emailCliente],
    subject: `Nueva Orden de Compra - ${nombreOrden}`,
    text: `Nueva orden de compra recibida.\n\nNombre del cliente: ${nombreCliente}\nCorreo: ${emailCliente}\nDirección de envío: ${direccionEnvio}\n\nAdjuntamos la orden de compra en PDF.`,
    attachments: [
      {
        filename: `${nombreOrden}.pdf`,
        path: filePath
      }
    ]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar correo:', error);
      return res.status(500).json({ success: false, message: 'Error al enviar correo' });
    }
    console.log('Correo enviado:', info.response);

    // Borrar archivo tras enviar
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error al borrar archivo:', err);
    });

    res.json({ success: true, message: 'Archivo recibido y correo enviado correctamente' });
  });
});

// Ruta para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
