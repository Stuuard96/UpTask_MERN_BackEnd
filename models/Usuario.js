import moongose from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = new moongose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    token: {
      type: String,
    },
    confirmado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encriptar el password antes de guardar
usuarioSchema.pre('save', async function (next) {
  // Si el password no ha sido modificado
  if (!this.isModified('password')) {
    return next();
  }

  // Encriptar el password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Usuario = moongose.model('Usuario', usuarioSchema);
export default Usuario;
