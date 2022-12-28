import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    const error = new Error('Token no valido');
    return res.status(401).json({ msg: error.message });
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = await Usuario.findById(decode.id).select(
        '-password -token -__v -confirmado -createdAt -updatedAt'
      );
      next();
    } catch (error) {
      return res.status(404).json({ msg: 'Hubo un error' });
    }
  }
};

export default checkAuth;
