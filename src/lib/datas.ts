export function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daquiADiasISO(dias: number) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}
