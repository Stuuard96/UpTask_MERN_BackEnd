// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL];
const corsOptions = {
  origin: function (origin, callback) {
    // Revisar si la peticion viene de un servidor que esta en whitelist
    const existe = whitelist.some((dominio) => dominio === origin);
    if (existe) {
      // Puede consultar la API
      callback(null, true);
    } else {
      // No esta permitido
      callback(new Error('Error de CORS'));
    }
  },
};

app.use(cors(corsOptions));

// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// SOCKET.IO
import { Server } from 'socket.io';

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on('connection', (socket) => {
  // console.log('Conectado a socket.io');

  //Definir los eventos del socket.io
  socket.on('abrirProyecto', (proyecto) => {
    socket.join(proyecto);
  });

  socket.on('nuevaTarea', (tarea) => {
    socket.to(tarea.proyecto).emit('tareaAgregada', tarea);
  });

  socket.on('eliminarTarea', (tarea) => {
    socket.to(tarea.proyecto).emit('tareaEliminada', tarea);
  });

  socket.on('editarTarea', (tarea) => {
    socket.to(tarea.proyecto._id).emit('tareaEditada', tarea);
  });

  socket.on('cambiarEstado', (tarea) => {
    socket.to(tarea.proyecto._id).emit('estadoCambiado', tarea);
  });
});
