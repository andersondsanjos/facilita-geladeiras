document.addEventListener('DOMContentLoaded', () => {
  const date = new Intl.DateTimeFormat('pt-BR').format(new Date());
  document.querySelector('#today').textContent = date;

  const basicPlan = document.querySelector('.plan.basic');
  const completePlan = document.querySelector('.plan.complete');
  if (basicPlan && completePlan) {
    basicPlan.querySelector('.price').textContent = 'R$ 17,90';
    basicPlan.querySelector('.installments').textContent = 'ou em até 4x no cartão, conforme o checkout';
    completePlan.querySelector('.price').textContent = 'R$ 27,90';
    completePlan.querySelector('.installments').textContent = 'ou em até 6x no cartão, conforme o checkout';

    basicPlan.querySelector('.price-before').innerHTML = 'DE <s>R$ 27,90</s> POR';
    completePlan.querySelector('.price-before').innerHTML = 'DE <s>R$ 37,90</s> POR';

    basicPlan.querySelector('.plan-intro').textContent = 'A rota essencial para iniciar o diagnóstico.';
    basicPlan.querySelector('ul').innerHTML = `
      <li>Entrada por marca, família e modelo mapeado</li>
      <li>Autoteste e leitura de painel das famílias cobertas</li>
      <li>Fichas essenciais de sensor, degelo e ventilação</li>
      <li>Próximo teste para não começar desmontando</li>`;

    completePlan.querySelector('.twice').textContent = 'ATLAS COMPLETO + 4 BÔNUS DE BANCADA';
    completePlan.querySelector('ul').innerHTML = `
      <li><b>Índice mestre:</b> marca → linha → família → rota aplicável</li>
      <li><b>Biblioteca completa:</b> autoteste, pré-autoteste, display, LEDs e códigos</li>
      <li><b>Mapas de medição:</b> sensores, degelo, termofusível, fan, damper e conectores documentados</li>
      <li><b>Rota de pré-desmontagem:</b> o que confirmar antes de abrir evaporador, painel ou placa</li>
      <li><b>BÔNUS 01:</b> Plano B da Placa: TC-900E Power</li>
      <li><b>BÔNUS 02:</b> Atalho da Rota por Sintoma</li>
      <li><b>BÔNUS 03:</b> Cartões de Bancada Frost Free</li>
      <li><b>BÔNUS 04:</b> Placa ou Periférico?</li>`;
  }

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
