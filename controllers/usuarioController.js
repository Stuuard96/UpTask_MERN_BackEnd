import {
  emailOlvidePassword,
  emailRegistro,
  generarID,
  generarJWT,
} from '../helpers/index.js';
import Usuario from '../models/Usuario.js';

const registrar = async (req, res) => {
  // Evitar registros duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email });

  if (existeUsuario) {
    const error = new Error('Este usuario ya está registrado');
    return res.status(400).json({ msg: error.message });
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarID();
    await usuario.save();
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({
      msg: 'Usuario registrado correctamente, revisa tu correo para activar tu cuenta',
    });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ email });

  // Comprobar si el usuario existe
  if (!usuario) {
    const error = new Error('Este usuario no existe');
    return res.status(404).json({ msg: error.message });
  }

  // Comprobar si el password es correcto
  const passwordCorrecto = await usuario.comprobarPassword(password);
  if (!passwordCorrecto) {
    const error = new Error('El password es incorrecto');
    return res.status(403).json({ msg: error.message });
  }

  // Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error('Tu cuenta no ha sido confirmada');
    return res.status(403).json({ msg: error.message });
  }

  try {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } catch (error) {
    console.log(error);
  }
};

const confirmar = async (req, res) => {
  const { token } = req.params;
  const usuarioConfirmar = await Usuario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error('Token no válido');
    return res.status(403).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = '';
    await usuarioConfirmar.save();
    res.json({ msg: 'Usuario confirmado correctamente' });
  } catch (error) {
    console.log(error);
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    const error = new Error('El usuario no existe');
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuario.token = generarID();
    await usuario.save();

    // Enviar el email con el token
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({ msg: 'Hemos enviado un email con las instrucciones' });
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const TokenValido = await Usuario.findOne({ token });

  if (!TokenValido) {
    const error = new Error('Token no válido');
    return res.status(404).json({ msg: error.message });
  }

  try {
    res.json({ msg: 'Token válido y el Usuario existe' });
  } catch (error) {
    console.log(error);
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const usuario = await Usuario.findOne({ token });

  if (!usuario) {
    const error = new Error('Token no válido');
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuario.password = password;
    usuario.token = '';
    await usuario.save();
    res.json({ msg: 'Password actualizado correctamente' });
  } catch (error) {
    console.log(error);
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json({ usuario });
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
