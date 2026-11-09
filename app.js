document.addEventListener('DOMContentLoaded', () => {
  const date = new Intl.DateTimeFormat('pt-BR').format(new Date());
  document.querySelector('#today').textContent = date;

  document.querySelectorAll('.checkout[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      link.classList.add('is-pending');
      link.textContent = 'CHECKOUT EM CONFIGURAÇÃO';
      window.setTimeout(() => {
        link.classList.remove('is-pending');
        link.textContent = link.closest('.complete') ? 'GARANTIR O PLANO COMPLETO' : 'GARANTIR O PLANO BÁSICO';
      }, 1800);
    });
  });
});
