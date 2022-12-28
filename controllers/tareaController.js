import mongoose from 'mongoose';
import Proyecto from '../models/Proyecto.js';
import Tarea from '../models/Tarea.js';

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  const validId = mongoose.Types.ObjectId.isValid(proyecto);

  if (validId) {
    const existProyecto = await Proyecto.findById(proyecto);

    if (!existProyecto) {
      const error = new Error('Proyecto no encontrado');
      return res.status(404).json({ msg: error.message });
    }

    if (existProyecto.creador.toString() !== req.usuario.id) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(403).json({ msg: error.message });
    }

    try {
      const tareaAlmacenada = await Tarea.create(req.body);
      // Almacenar el ID en el proyecto
      existProyecto.tareas.push(tareaAlmacenada._id);
      await existProyecto.save();
      res.json(tareaAlmacenada);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.Types.ObjectId.isValid(id);

  if (validId) {
    const tarea = await Tarea.findById(id).populate('proyecto');

    if (!tarea) {
      const error = new Error('Tarea no encontrada');
      return res.status(404).json({ msg: error.message });
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(403).json({ msg: error.message });
    }

    try {
      res.json(tarea);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.Types.ObjectId.isValid(id);

  if (validId) {
    const tarea = await Tarea.findById(id).populate('proyecto');
    // const { proyecto } = tarea;

    if (!tarea) {
      const error = new Error('Tarea no encontrada');
      return res.status(404).json({ msg: error.message });
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(403).json({ msg: error.message });
    }

    try {
      const tareaActualizada = await Tarea.findByIdAndUpdate(id, req.body, {
        new: true,
      }).populate('proyecto');

      // res.json({ ...tareaActualizada._doc, proyecto });
      res.json(tareaActualizada);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.Types.ObjectId.isValid(id);

  if (validId) {
    const tarea = await Tarea.findById(id).populate('proyecto');

    if (!tarea) {
      const error = new Error('Tarea no encontrada');
      return res.status(404).json({ msg: error.message });
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(403).json({ msg: error.message });
    }

    try {
      const proyecto = await Proyecto.findById(tarea.proyecto);
      proyecto.tareas.pull(tarea._id);
      await Promise.all([proyecto.save(), tarea.remove()]);
      res.json({ msg: 'La tarea ha sido eliminada correctamente' });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.Types.ObjectId.isValid(id);

  if (validId) {
    const tarea = await Tarea.findById(id).populate('proyecto');

    if (!tarea) {
      const error = new Error('Tarea no encontrada');
      return res.status(404).json({ msg: error.message });
    }

    if (
      tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
      !tarea.proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(403).json({ msg: error.message });
    }

    try {
      tarea.estado = !tarea.estado;
      tarea.completado = req.usuario._id;
      await tarea.save();

      const tareaAlmacenada = await Tarea.findById(id)
        .populate('proyecto')
        .populate('completado');

      res.json(tareaAlmacenada);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
