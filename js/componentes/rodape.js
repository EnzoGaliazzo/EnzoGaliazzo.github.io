// Rodapé: colunas abertas no computador; no celular viram acordeão (fechadas até tocar).
export default function ligar(listas) {
  const celular = matchMedia('(max-width: 733px)');
  const ajustar = () => listas.forEach((lista) => lista.querySelectorAll('details').forEach((d) => { d.open = !celular.matches; }));
  ajustar();
  celular.addEventListener('change', ajustar);
}
