import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transport.sendMail({
    from: '"UpTask" - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: 'UpTask - Confirma tu cuenta',
    text: 'Confirma tu cuenta en UpTask',
    html: `<p>Hola ${nombre} confirma tu cuenta en UpTask</p>
    <p>Para confirmar tu cuenta haz click en el siguiente enlace</p>
    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a>
    <p style="font-weight: bold;">Si no has creado una cuenta en UpTask, ignora este email</p>
    `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transport.sendMail({
    from: '"UpTask" - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: 'UpTask - Reestablece tu contraseña',
    text: 'Reestablece tu contraseña en UpTask',
    html: `<p>Hola ${nombre} reestablece tu contraseña en UpTask</p>
    <p>Para reestablecer tu contraseña haz click en el siguiente enlace</p>
    <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer contraseña</a>
    <p style="font-weight: bold;">Si tu no solicitaste este email, ignora este email</p>
    `,
  });
};
