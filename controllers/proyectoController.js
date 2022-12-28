import mongoose from 'mongoose';
import Proyecto from '../models/Proyecto.js';
import Usuario from '../models/Usuario.js';

const obtenerProyectos = async (req, res) => {
  //   const proyecto = await Proyecto.find().where('creador').equals(req.usuario._id);
  const proyectos = await Proyecto.find({
    $or: [
      { creador: { $in: req.usuario._id } },
      { colaboradores: { $in: req.usuario._id } },
    ],
  }).select('-tareas');
  res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.Types.ObjectId.isValid(id);

  if (validId) {
    const proyecto = await Proyecto.findById(id)
      .populate({
        path: 'tareas',
        populate: {
          path: 'completado',
          select: 'nombre',
        },
      })
      .populate('colaboradores', 'nombre email');

    if (!proyecto) {
      const error = new Error('El proyecto no existe');
      return res.status(404).json({ msg: error.message });
    }

    if (
      proyecto.creador.toString() !== req.usuario._id.toString() &&
      !proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(403).json({ msg: error.message });
    }

    try {
      res.json(proyecto);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.Types.ObjectId.isValid(id);

  if (validId) {
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      const error = new Error('El proyecto no existe');
      return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(403).json({ msg: error.message });
    }

    try {
      const proyectoEditado = await Proyecto.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(proyectoEditado);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  const validId = mongoose.Types.ObjectId.isValid(id);

  if (validId) {
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      const error = new Error('El proyecto no existe');
      return res.status(404).json({ msg: error.message });
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error('No tienes permisos para realizar esta acción');
      return res.status(401).json({ msg: error.message });
    }

    try {
      await Proyecto.findByIdAndDelete(id);
      res.json({ msg: 'El proyecto ha sido eliminado correctamente' });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    '-confirmado -password -__v -createdAt -updatedAt -token'
  );

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  try {
    res.json(usuario);
  } catch (error) {
    console.log(error);
  }
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos para realizar esta acción');
    return res.status(403).json({ msg: error.message });
  }

  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    '-confirmado -password -__v -createdAt -updatedAt -token'
  );

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  // El colaborador no es el admin del proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('No puedes agregar al creador del proyecto');
    return res.status(403).json({ msg: error.message });
  }

  // El colaborador no está ya en el proyecto
  if (proyecto.colaboradores.includes(usuario._id.toString())) {
    const error = new Error('El usuario ya está en el proyecto');
    return res.status(403).json({ msg: error.message });
  }

  try {
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({ msg: 'Colaborador agregado correctamente' });
  } catch (error) {
    console.log(error);
  }
};

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos para realizar esta acción');
    return res.status(403).json({ msg: error.message });
  }

  try {
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save();
    res.json({ msg: 'Colaborador eliminado correctamente' });
  } catch (error) {
    console.log(error);
  }
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
};
