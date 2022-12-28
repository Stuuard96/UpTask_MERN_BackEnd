export const generarID = () => {
  const random = Math.random().toString(36).slice(2);
  const fecha = new Date().getTime().toString(36);
  return random + fecha;
};
