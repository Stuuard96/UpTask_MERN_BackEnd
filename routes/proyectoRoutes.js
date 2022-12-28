import express from 'express';
import {
  buscarColaborador,
  agregarColaborador,
  editarProyecto,
  eliminarColaborador,
  eliminarProyecto,
  nuevoProyecto,
  obtenerProyecto,
  obtenerProyectos,
} from '../controllers/proyectoController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

router
  .route('/')
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto);

router
  .route('/:id')
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto);

router.post('/colaboradores', checkAuth, buscarColaborador);
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);

export default router;
