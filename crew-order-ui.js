/* Presentation-only enhancement. The original form owns validation and ordering. */
(() => {
  'use strict';
  const app = document.getElementById('main_app');
  if (!app || app.classList.contains('ui-order')) return;
  // Only the two opted-in GroupBuy documents may receive this presentation layer.
  // SMALL's landing/order form, other crews and unknown hosts stay untouched.
  const routes = {
    '목마교': { session: 'mokmagyo_session', paths: ['/', '/index.html'] },
    '썬데이서울': { session: 'weecl_session', paths: ['/ssdayseoul/', '/ssdayseoul/index.html', '/ssdayseoul/index-opening.html'] }
  };
  const crew = typeof currentCrew === 'string' ? currentCrew : '';
  const route = routes[crew];
  if (!route || app.dataset.orderUiCrew !== crew
      || typeof SESSION_KEY !== 'string' || SESSION_KEY !== route.session
      || !['witee.co.kr', 'localhost', '127.0.0.1'].includes(location.hostname)
      || !route.paths.includes(location.pathname)
      || document.getElementById('public_landing')) return;
  const byId = id => document.getElementById(id);
  const buyer = byId('buyer_fieldset');
  const items = byId('items_fieldset');
  const reference = byId('check_fieldset');
  const result = byId('result');
  const reviewHeader = byId('reviewHeader');
  const action = byId('btn');
  const title = app.querySelector('h1');
  const navigation = byId('btnNotice')?.parentElement;
  const consent = byId('essential_consent')?.parentElement?.parentElement;
  if (![buyer, items, reference, result, reviewHeader, action, title, navigation, consent].every(Boolean)) return;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function setText(element, text) {
    if (element.textContent !== text) element.textContent = text;
  }
  const steps = [];
  const stages = node('div', 'ui-stages');
  function step(number, label) {
    const section = node('details', 'ui-step');
    section.open = true;
    section.dataset.uiStep = String(number);
    const heading = node('summary', 'ui-step-heading');
    const badge = node('span', 'ui-step-number', String(number));
    badge.setAttribute('aria-hidden', 'true');
    const name = node('span', 'ui-step-title', label);
    const status = node('span', 'ui-step-status');
    const preview = node('span', 'ui-step-preview');
    const chevron = node('span', 'ui-step-chevron', '⌄');
    chevron.setAttribute('aria-hidden', 'true');
    heading.append(badge, name, status, preview, chevron);
    const body = node('div', 'ui-step-body');
    section.append(heading, body);
    stages.append(section);
    const value = { section, heading, status, preview, body };
    steps.push(value);
    return value;
  }
  const buyerStep = step(1, '주문자 정보');
  const productStep = step(2, '상품 정보 입력');
  const reviewStep = step(3, '가격 확인 및 주문');

  const masthead = node('header', 'ui-masthead');
  const identity = node('div', 'ui-identity');
  identity.append(node('span', 'ui-wordmark', crew), title);
  navigation.classList.add('ui-navigation');
  masthead.append(identity, navigation);

  buyerStep.body.append(buyer);
  const productLayout = node('div', 'ui-product-layout');
  const productColumn = node('div', 'ui-product-column');
  const referencePanel = node('details', 'ui-reference');
  referencePanel.open = true;
  referencePanel.append(node('summary', '', '상품 사이트에서 재고 확인'), reference);
  productColumn.append(items);
  productLayout.append(productColumn, referencePanel);
  consent.classList.add('ui-consent');
  productStep.body.append(productLayout, consent);
  const waiting = node('p', 'ui-review-waiting', '주문 검토하기를 누르면 최종 상품 금액과 배송비가 표시됩니다. 내용을 확인한 뒤 주문을 접수해 주세요.');
  reviewStep.body.append(waiting, reviewHeader, result);

  const actionbar = node('div', 'ui-actionbar');
  const actionCopy = node('div', 'ui-action-copy');
  const actionTitle = node('strong', 'ui-action-title');
  const actionNote = node('span', 'ui-action-note');
  actionCopy.append(actionTitle, actionNote);
  const next = node('button', 'ui-next', '상품 정보 입력하기');
  next.type = 'button';
  const oldActionWrap = action.parentElement;
  const legacyNote = oldActionWrap.nextElementSibling;
  actionbar.append(actionCopy, next, action);
  oldActionWrap.remove();
  if (legacyNote?.classList.contains('note-text')) legacyNote.classList.add('ui-legacy-note');
  app.prepend(masthead, stages);
  app.append(actionbar);

  let activeStep = 0;
  let wasReview = false;
  let queued = false;
  const value = id => byId(id).value.trim();
  function buyerEntered() {
    return ['buyer_name', 'buyer_phone', 'buyer_email', 'buyer_addr', 'buyer_addr_detail'].every(id => value(id));
  }
  function isReview() {
    return reviewHeader.style.display !== 'none' && result.childElementCount > 0;
  }
  function openStep(index, focus) {
    activeStep = index;
    // Keep the original confirm button's ancestor open while inspecting locked
    // buyer/product fields. Its lifecycle must remain owned by #result.
    const reviewing = isReview();
    steps.forEach((entry, i) => { entry.section.open = i === index || (reviewing && i === 2); });
    app.dataset.uiActive = String(index + 1);
    if (focus && app.style.display !== 'none') {
      steps[index].heading.focus({ preventScroll: true });
      steps[index].section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    refresh();
  }
  function refresh() {
    const reviewing = isReview();
    const confirm = byId('confirmBtn');
    const completed = reviewing && reviewHeader.textContent === '주문 완료';
    app.dataset.uiPhase = reviewing ? (confirm ? 'review' : 'review-error') : 'edit';
    if (completed) app.dataset.uiPhase = 'complete';
    waiting.hidden = reviewing;
    next.hidden = reviewing || activeStep !== 0;
    action.hidden = !reviewing && activeStep === 0;
    const buyerReady = buyerEntered();
    setText(buyerStep.status, buyerReady ? '입력됨' : '입력 필요');
    buyerStep.section.classList.toggle('ui-entered', buyerReady);
    setText(buyerStep.preview, buyerReady
      ? `${value('buyer_name')} · ${value('buyer_phone')} · ${value('buyer_addr')}`
      : '이름, 연락처와 배송지를 입력해 주세요.');
    const rows = [...byId('items').querySelectorAll('.item-box')];
    const configured = rows.filter(row => {
      const manual = row.querySelector('input[type="radio"]:checked')?.value === 'manual';
      return (manual ? row.querySelector('[name="manual_keyword"]').value : row.querySelector('[name="product_url"]').value)
        && row.querySelector('[name="size"]').value && Number(row.querySelector('[name="qty"]').value) > 0;
    }).length;
    const quantity = rows.reduce((sum, row) => sum + Math.max(0, Number(row.querySelector('[name="qty"]').value) || 0), 0);
    const productsReady = configured === rows.length && rows.length > 0;
    const productSummary = `상품 ${rows.length}개 항목 · 총 수량 ${quantity}`;
    setText(productStep.status, productsReady ? '입력됨' : '입력 중');
    productStep.section.classList.toggle('ui-entered', productsReady);
    setText(productStep.preview, productSummary);
    setText(reviewStep.status, completed ? '접수 완료' : reviewing ? (confirm ? '금액 확인' : '확인 필요') : '대기 중');
    setText(reviewStep.preview, reviewing ? '아래 검토 결과를 확인해 주세요.' : '주문 검토 후 가격을 확인할 수 있습니다.');
    setText(actionTitle, completed ? '주문이 접수되었습니다.' : reviewing ? '주문 정보와 최종 금액을 확인해 주세요.' : activeStep === 0 ? '먼저 주문자 정보를 입력해 주세요.' : productSummary);
    setText(actionNote, reviewing ? '수정이 필요하면 주문 수정하기를 눌러 주세요.' : '최종 금액은 주문 검토 후 표시됩니다.');
    if (reviewing !== wasReview) {
      wasReview = reviewing;
      openStep(reviewing ? 2 : 1, true);
    }
  }
  function scheduleRefresh() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; refresh(); });
  }
  steps.forEach((entry, index) => {
    entry.heading.addEventListener('click', event => {
      event.preventDefault();
      openStep(index, false);
    });
  });
  next.addEventListener('click', () => openStep(1, true));
  // Reveal the original fields before their existing validation can focus them.
  // This does not block, forward or invoke a validation/order action.
  action.addEventListener('click', () => {
    if (isReview()) return;
    const missing = ['buyer_name', 'buyer_phone', 'buyer_email', 'buyer_addr', 'buyer_addr_detail'].find(id => !value(id));
    if (missing) {
      openStep(0, false);
      byId(missing).focus({ preventScroll: true });
    } else {
      openStep(1, false);
    }
  }, true);
  app.addEventListener('input', scheduleRefresh);
  app.addEventListener('change', scheduleRefresh);
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(result, { childList: true, subtree: true });
  observer.observe(reviewHeader, { attributes: true, attributeFilter: ['style'], childList: true });
  observer.observe(byId('items'), { childList: true });
  observer.observe(app, { attributes: true, attributeFilter: ['style'] });

  // Enable styling only after the original controls are safely in place.
  // Without this asset the original form and actions remain available.
  app.classList.add('ui-order');
  // Keep the existing support link above the new fixed order actions.
  // Its destination and click behavior remain owned by the original page.
  const support = document.querySelector('body > div > a[href="https://open.kakao.com/o/gpQL7W6h"], body > div > a[href="https://open.kakao.com/o/g7e6Vfii"]');
  support?.parentElement.classList.add('ui-crew-support');
  referencePanel.open = window.matchMedia('(min-width: 821px)').matches;
  openStep(0, false);
})();
