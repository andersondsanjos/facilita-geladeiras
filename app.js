document.addEventListener('DOMContentLoaded', () => {
  const date = new Intl.DateTimeFormat('pt-BR').format(new Date());
  document.querySelector('#today').textContent = date;

  const metaPixelId = '963654916471824';
  const sendMetaEvent = (eventName, customData = {}) => {
    const eventId = `fg_${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    if (typeof window.fbq === 'function') window.fbq('track', eventName, customData, { eventID: eventId });

    fetch('/api/meta-events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventId,
        customData,
        eventSourceUrl: window.location.href
      })
    }).catch(() => undefined);
  };

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', metaPixelId);
  sendMetaEvent('PageView');

  const checkoutUrls = {
    basic: 'https://pay.wiapy.com/mgfq6Sp5vppa',
    complete: 'https://pay.wiapy.com/ZP8ihH5w1rqg'
  };

  const trackingParams = new URLSearchParams(window.location.search);
  const passThroughParams = new URLSearchParams();
  for (const [key, value] of trackingParams.entries()) {
    if (key.startsWith('utm_') || key === 'fbclid') passThroughParams.set(key, value);
  }

  const addTrackingParams = (url) => {
    const destination = new URL(url);
    for (const [key, value] of passThroughParams.entries()) destination.searchParams.set(key, value);
    return destination.toString();
  };

  document.querySelectorAll('.checkout').forEach((link) => {
    const isComplete = link.closest('.complete');
    const plan = isComplete ? 'complete' : 'basic';
    link.href = addTrackingParams(checkoutUrls[plan]);
    link.removeAttribute('aria-label');
    link.addEventListener('click', () => {
      sendMetaEvent('InitiateCheckout', {
        content_name: plan === 'complete' ? 'Facilita Geladeiras - Plano Completo' : 'Facilita Geladeiras - Plano Básico',
        content_type: 'product',
        currency: 'BRL',
        value: plan === 'complete' ? 27.90 : 17.90
      });
    });
  });

  const cashflow = document.createElement('script');
  cashflow.src = 'https://cashflow.mentoriaprocesso.com/t/p.js?w=e794033d-a0f8-4191-97b6-7f4e9ee8020f&o=634a3ae5-b0a7-4a55-829f-21da3c3d7ed2';
  cashflow.dataset.offer = '634a3ae5-b0a7-4a55-829f-21da3c3d7ed2';
  cashflow.dataset.nowprocket = '';
  cashflow.dataset.noMinify = '1';
  cashflow.dataset.noOptimize = '1';
  cashflow.dataset.cfasync = 'false';
  cashflow.async = true;
  document.head.appendChild(cashflow);

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

});
