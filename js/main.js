/**
 * KENTECH 전남광주지능화혁신연구센터 - JavaScript 기능 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  initBreadcrumbDropdowns();
  initModals();
  initBackToTop();
  initMobileDrawer();
  initCurriculumTabs();
  initPendingLinks();
  initVisualGlow();
});

/* ==========================================================================
   Main Visual Glow (메인 비주얼 문구를 글자 단위로 훑고 지나가는 빛 효과)
   ========================================================================== */
function initVisualGlow() {
  const lines = document.querySelectorAll('.visual-txt .txt01, .visual-txt .txt02, .visual-txt .txt03');
  if (!lines.length || !('animate' in Element.prototype)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 글자를 span 으로 분리 (<br> 등 요소는 유지, 공백은 일반 텍스트로 유지)
  const chars = [];
  lines.forEach((line) => {
    line.setAttribute('aria-label', line.textContent.replace(/\s+/g, ' ').trim());

    const split = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType !== Node.TEXT_NODE) return;
        const frag = document.createDocumentFragment();
        Array.from(child.textContent.replace(/\s*\n\s*/g, '')).forEach((ch) => {
          if (ch === ' ') {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const span = document.createElement('span');
          span.className = 'glow-char';
          span.setAttribute('aria-hidden', 'true');
          span.textContent = ch;
          frag.appendChild(span);
          chars.push(span);
        });
        node.replaceChild(frag, child);
      });
    };
    split(line);
  });

  const STEP = 70;     // 글자 사이 시간차(ms)
  const GLOW = 900;    // 한 글자가 빛나는 시간(ms)
  const PAUSE = 2200;  // 한 바퀴 끝난 뒤 쉬는 시간(ms)
  const cycle = chars.length * STEP + GLOW + PAUSE;
  const a = (GLOW * 0.35) / cycle;
  const b = GLOW / cycle;

  chars.forEach((el, i) => {
    const cs = getComputedStyle(el);
    const baseColor = cs.color;
    const baseShadow = cs.textShadow;
    el.animate(
      [
        { offset: 0, color: baseColor, textShadow: baseShadow, transform: 'translateY(0) scale(1)' },
        {
          offset: a,
          color: '#ffffff',
          textShadow: '0 0 6px #fff, 0 0 16px rgba(125, 211, 252, 0.95), 0 0 34px rgba(56, 189, 248, 0.8), 0 0 60px rgba(56, 189, 248, 0.5)',
          transform: 'translateY(-2px) scale(1.06)',
        },
        { offset: b, color: baseColor, textShadow: baseShadow, transform: 'translateY(0) scale(1)' },
        { offset: 1, color: baseColor, textShadow: baseShadow, transform: 'translateY(0) scale(1)' },
      ],
      { duration: cycle, delay: 800 + i * STEP, iterations: Infinity, easing: 'ease-in-out' }
    );
  });
}

/* ==========================================================================
   Pending Links (대상 페이지/섹션이 아직 없는 '#앵커' 링크)
   ========================================================================== */
function initPendingLinks() {
  const isPending = (a) => {
    const href = a.getAttribute('href');
    if (!href || href.length < 2 || href.charAt(0) !== '#') return false;
    return !document.getElementById(decodeURIComponent(href.slice(1)));
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (isPending(a)) a.classList.add('is-pending');
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.is-pending');
    if (!a) return;
    e.preventDefault();
    showToast('준비 중인 페이지입니다.');
  });
}

/* ==========================================================================
   Breadcrumb Dropdowns
   ========================================================================== */
function initBreadcrumbDropdowns() {
  const dropdownItems = document.querySelectorAll('.bc-item-dropdown');

  dropdownItems.forEach((item) => {
    const trigger = item.querySelector('.bc-trigger');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other open dropdowns
      dropdownItems.forEach((other) => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', () => {
    dropdownItems.forEach((item) => item.classList.remove('active'));
  });
}

/* ==========================================================================
   Modals (QR Code & Application)
   ========================================================================== */
function initModals() {
  const qrModal = document.getElementById('qrModal');
  const enrollModal = document.getElementById('enrollModal');
  const btnQrTool = document.getElementById('btnQrTool');
  const btnEnrollHeader = document.getElementById('btnEnrollHeader');
  const btnEnrollBanner = document.getElementById('btnEnrollBanner');
  const btnDownloadQr = document.getElementById('btnDownloadQr');

  // Open QR modal (열 때마다 현재 페이지 주소로 QR 생성)
  if (btnQrTool && qrModal) {
    btnQrTool.addEventListener('click', () => {
      openModal(qrModal);
      renderQrCode(qrModal);
    });
  }

  // ESC 로 모달 / 모바일 드로어 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAllModals();
    const drawer = document.getElementById('mobileDrawer');
    if (drawer && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Open Enrollment modal
  // 본문 버튼은 data-open-enroll 속성만 달면 신청 창을 연다.
  const enrollTriggers = [btnEnrollHeader, btnEnrollBanner, ...document.querySelectorAll('[data-open-enroll]')];
  enrollTriggers.forEach((btn) => {
    if (btn && enrollModal) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(enrollModal);
      });
    }
  });

  // 주소 끝에 #apply 를 붙여 들어오면 신청 창을 바로 연다. (예: index.html#apply)
  if (enrollModal && location.hash === '#apply') openModal(enrollModal);

  // Close buttons inside modals
  document.querySelectorAll('.modal-close-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Click on background overlay to close
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // Download QR code action
  if (btnDownloadQr) {
    btnDownloadQr.addEventListener('click', () => {
      if (downloadQrImage(qrModal)) {
        showToast('QR 코드 이미지를 다운로드했습니다.');
        setTimeout(() => closeAllModals(), 800);
      } else {
        showToast('QR 코드를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    });
  }

  initEnrollForm();
}

/* ==========================================================================
   QR Code (qrcodejs 를 처음 필요할 때 CDN 에서 로드)
   ========================================================================== */
const QR_LIB_URL = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
let qrLibPromise = null;

function loadQrLib() {
  if (window.QRCode) return Promise.resolve();
  if (!qrLibPromise) {
    qrLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = QR_LIB_URL;
      s.onload = resolve;
      s.onerror = () => {
        qrLibPromise = null; // 다음 시도에서 재시도
        reject(new Error('QR library load failed'));
      };
      document.head.appendChild(s);
    });
  }
  return qrLibPromise;
}

function renderQrCode(qrModal) {
  const box = qrModal.querySelector('.qr-code-display');
  if (!box) return;

  loadQrLib()
    .then(() => {
      let target = box.querySelector('#qrCodeTarget');
      if (!target) {
        target = document.createElement('div');
        target.id = 'qrCodeTarget';
        box.querySelector('svg').style.display = 'none'; // 장식용 SVG 는 로드 실패 대비 예비로 유지
        box.appendChild(target);
      }
      target.innerHTML = '';
      new window.QRCode(target, {
        text: window.location.href.split('#')[0],
        width: 180,
        height: 180,
        colorDark: '#0f2d59',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    })
    .catch(() => {
      // 라이브러리를 못 불러오면 예비 SVG 를 그대로 보여준다.
    });
}

function downloadQrImage(qrModal) {
  const canvas = qrModal.querySelector('#qrCodeTarget canvas');
  if (!canvas) return false; // 실제 QR 이 생성되지 않았으면 (장식용 SVG 상태) 내려받지 않는다.

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'kentech-center-qr.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}

/* ==========================================================================
   설명회 참석 신청 Form
   - ENROLL_ENDPOINT 에 Google Apps Script 웹앱 URL(…/exec)을 넣으면 신청 내용이
     구글 시트에 저장된다. (설정 방법: server/README.md)
   - 비어 있으면 데모 모드로 동작한다. (실제 저장 없음)
   ========================================================================== */
const ENROLL_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyg1vhzzvIjNLYmPwgeKTuBkR3HylWw6UwyU7JN6I6a9TRiJsJhZggU5wtzQAIDhUiOsQ/exec';

function initEnrollForm() {
  const form = document.getElementById('enrollForm');
  if (!form) return;

  const errorEl = document.getElementById('enrollError');
  const submitBtn = document.getElementById('enrollSubmit');
  const fields = Array.from(form.querySelectorAll('input, select, textarea')).filter(
    (f) => f.type !== 'hidden' && !f.classList.contains('form-honeypot')
  );

  const showError = (msg) => {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  };

  fields.forEach((f) =>
    ['input', 'change'].forEach((type) =>
      f.addEventListener(type, () => {
        f.classList.remove('invalid');
        showError('');
      })
    )
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const invalid = fields.filter((f) => !f.checkValidity());
    fields.forEach((f) => f.classList.toggle('invalid', invalid.includes(f)));
    if (invalid.length) {
      const first = invalid[0];
      const label = form.querySelector(`label[for="${first.id}"]`);
      showError(
        first.dataset.error ||
          `${label ? label.textContent.replace('*', '').trim() : '입력값'} 항목을 올바르게 입력해 주세요.`
      );
      first.focus();
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    submitBtn.disabled = true;
    showError('');

    try {
      if (ENROLL_ENDPOINT) {
        // Apps Script 는 CORS 사전요청(preflight)을 지원하지 않으므로 text/plain 으로 보낸다.
        const res = await fetch(ENROLL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (!result.ok) {
          showError(result.message || '신청 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
      } else {
        console.warn('[enroll] ENROLL_ENDPOINT 가 비어 있어 저장하지 않았습니다. (데모 모드)', payload);
      }
      showToast('지능화혁신융합전공 설명회 참석신청이 완료되었습니다!');
      form.reset();
      setTimeout(() => closeAllModals(), 1200);
    } catch (err) {
      showError('신청 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function openModal(modalEl) {
  modalEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
}

/* ==========================================================================
   Back To Top Button
   ========================================================================== */
function initBackToTop() {
  const topBtn = document.getElementById('topBtn');
  if (!topBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  });

  topBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   Mobile Drawer & Accordion
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const navTitles = document.querySelectorAll('.drawer-nav-title');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Accordion inside mobile drawer
  navTitles.forEach((title) => {
    title.addEventListener('click', () => {
      const parent = title.closest('.drawer-nav-item');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });
}

/* ==========================================================================
   Curriculum Tabs
   ========================================================================== */
function initCurriculumTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.curriculum-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => (p.hidden = true));

      btn.classList.add('active');
      const targetPanel = document.getElementById(target);
      if (targetPanel) {
        targetPanel.hidden = false;
      }
    });
  });
}

/* ==========================================================================
   Simple Toast Feedback
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #0f2d59;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      border: 1px solid #38bdf8;
      font-size: 0.9375rem;
      font-weight: 600;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}
