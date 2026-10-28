/**
 * KENTECH 전남광주지능화혁신연구센터 - 공통 레이아웃 컴포넌트
 *
 * 헤더 / 브레드크럼 / 푸터 / 모바일 드로어 / QR 모달을 한 곳에서 관리한다.
 * 페이지에는 아래 플레이스홀더만 두면 된다. (fetch 를 쓰지 않아 file:// 로도 동작)
 *
 *   <div id="site-header"></div>       상단 유틸바 + 메인 헤더
 *   <div id="site-breadcrumb"></div>   브레드크럼 (현재 페이지 기준으로 자동 생성)
 *   <div id="site-footer"></div>       푸터
 *   <div id="site-overlays"></div>     QR 모달 + 설명회 신청 모달 + 모바일 드로어
 *
 * <body data-qr-desc="..."> 로 QR 모달 안내 문구를 페이지별로 지정할 수 있다.
 * 메뉴 항목을 추가하려면 아래 MENU 만 수정하면 모든 페이지에 반영된다.
 */
(function () {
  const SITE = {
    university: 'KENTECH',
    center: '전남광주지능화혁신연구센터',
    home: 'index.html',
    address: '(58330) 전라남도 나주시 켄텍길 21 한국에너지공과대학교(KENTECH)',
    year: 2026,
  };

  /* 실제 페이지가 없는 항목은 '#앵커'로 두면 클릭 시 "준비 중" 안내가 표시된다. */
  const MENU = [
    {
      label: '센터소개',
      children: [
        { label: '센터장 인사말', href: 'greeting.html' },
        { label: '김종권 교수 소개', href: '#intro-faculty' },
        { label: '연구진 (Members)', href: '#intro-org' },
        { label: '오시는 길', href: '#intro-map' },
      ],
    },
    {
      label: '연구개발',
      children: [
        { label: '연구개발 개요', href: '#rd-overview' },
        { label: '산학협력', href: '#rd-coop' },
        { label: '기술지원', href: '#rd-support' },
        { label: '연구성과', href: '#rd-results' },
      ],
    },
    {
      label: '프로그램',
      children: [
        { label: '지능화혁신융합전공소개', href: '#prog-nondegree' },
        { label: '산학공동연구신청', href: '#prog-joint' },
        { label: '기업수요조사', href: '#prog-survey' },
      ],
    },
    {
      label: '참여기업',
      children: [
        { label: '참여기업 소개', href: '#partner-info' },
        { label: '참여기업신청', href: '#partner-apply' },
      ],
    },
    {
      label: '센터장비활용',
      children: [{ label: '공용장비신청', href: '#equipment-apply' }],
    },
    {
      label: '센터소식',
      children: [
        { label: '공지사항', href: '#notice' },
        { label: 'EVENT & SUPPORT', href: '#events' },
        { label: '자료실', href: '#archive' },
        { label: '뉴스레터', href: '#newsletter' },
        { label: '언론보도', href: '#press' },
        { label: '취업정보', href: '#careers' },
      ],
    },
  ];

  const FAMILY_SITES = [
    ['KENTECH (한국에너지공과대학교)', 'https://www.kentech.ac.kr'],
    ['KENTECH 에너지공학부', 'https://www.kentech.ac.kr'],
    ['과학기술정보통신부', 'https://www.msit.go.kr'],
    ['산업통상자원부', 'https://www.motie.go.kr'],
    ['한국전력공사 (KEPCO)', 'https://www.kepco.co.kr'],
  ];

  const FOOTER_LINKS = [
    ['개인정보처리방침', '#privacy', true],
    ['이용약관', '#terms'],
    ['이메일무단수집거부', '#email-refusal'],
    ['사이트맵', '#sitemap'],
    ['오시는길', '#intro-map'],
  ];

  /* ------------------------------------------------------------------ */
  /* Pending pages: '#앵커' 항목은 공용 "작성중" 페이지(page.html)로 연결 */
  /* ------------------------------------------------------------------ */
  const PENDING = {};
  // 내용이 작성된 페이지: '#앵커' id -> 실제 파일
  const READY = [
    'rd-overview', 'rd-coop', 'rd-support', 'rd-results',
    'intro-faculty', 'intro-org', 'intro-map',
    'prog-nondegree', 'prog-joint', 'prog-survey',
    'partner-info', 'equipment-apply', 'sitemap', 'notice',
  ].reduce((o, id) => ((o[id] = `${id}.html`), o), {});
  const pendingHref = (href) => {
    if (href.charAt(0) !== '#') return href;
    const id = href.slice(1);
    return READY[id] || `page.html?id=${id}`;
  };
  MENU.forEach((m) =>
    m.children.forEach((c) => {
      const id = c.href.charAt(0) === '#' ? c.href.slice(1) : null;
      if (id && !READY[id]) PENDING[id] = { label: c.label, category: m.label };
      c.href = pendingHref(c.href);
    })
  );
  FOOTER_LINKS.forEach((l) => {
    if (l[1].charAt(0) !== '#') return;
    const id = l[1].slice(1);
    if (!PENDING[id] && !READY[id]) PENDING[id] = { label: l[0], category: '' };
    l[1] = pendingHref(l[1]);
  });
  window.SITE_MENU = MENU;
  window.SITE_FOOTER_LINKS = FOOTER_LINKS.map(([label, href]) => ({ label, href }));
  window.SITE_PENDING = PENDING;

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */
  // 상세 페이지(예: 공지 글)는 <body data-menu-file="notice.html"> 로 소속 메뉴를 지정
  const currentFile = (
    document.body.dataset.menuFile ||
    (location.pathname.split('/').pop() || SITE.home) + (location.search || '')
  ).toLowerCase();

  // 각 메뉴의 대표 링크 = 첫 하위 메뉴 링크
  const menuHref = (item) => item.children[0].href;
  const isCurrent = (href) => href.toLowerCase() === currentFile;
  const activeMenu = MENU.find((m) => m.children.some((c) => isCurrent(c.href)));
  const activeSub = activeMenu && activeMenu.children.find((c) => isCurrent(c.href));
  const cls = (...names) => names.filter(Boolean).join(' ');
  const esc = (s) => s.replace(/&/g, '&amp;');
  const mount = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.outerHTML = html;
  };

  const chevronDown = (w, extra = '') =>
    `<svg ${w ? `width="${w}" height="${w}" ` : ''}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2${extra}"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

  /* ------------------------------------------------------------------ */
  /* Header                                                              */
  /* ------------------------------------------------------------------ */
  function renderHeader() {
    const ctaIcon = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>`;
    // 신청 창(enrollModal)은 renderOverlays 에서 모든 페이지에 넣으므로 현재 페이지에서 바로 연다.
    const cta = `<button type="button" class="btn-header-cta" id="btnEnrollHeader">${ctaIcon} <span class="cta-label-full">지능화혁신융합전공<br>설명회 참석신청</span><span class="cta-label-short">설명회 신청</span></button>`;

    const nav = MENU.map(
      (m) => `
          <li class="${cls('nav-item', m === activeMenu && 'active')}">
            <a href="${menuHref(m)}" class="nav-link">${m.label}</a>
            <div class="dropdown-menu">
              ${m.children
                .map(
                  (c) =>
                    `<a href="${c.href}" class="${cls('dropdown-link', isCurrent(c.href) && 'active')}">${esc(c.label)}</a>`
                )
                .join('\n              ')}
            </div>
          </li>`
    ).join('');

    mount(
      'site-header',
      `
  <div class="top-util-bar">
    <div class="container">
      <div class="top-util-left">
        <span class="util-badge">KENTECH AI INNOVATION</span>
        <span>${SITE.center}</span>
      </div>
      <div class="top-util-right">
        <a href="https://www.kentech.ac.kr/" target="_blank" rel="noopener noreferrer" class="util-link highlight">
          KENTECH (한국에너지공과대학교)
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  </div>

  <header class="site-header" id="siteHeader">
    <div class="container header-container">
      <a href="${SITE.home}" class="brand-logo" id="brandLogo" aria-label="${SITE.university} ${SITE.center} 홈으로 이동">
        <div class="brand-emblem">
          <img src="assets/images/kentech_symbol.svg" alt="" width="54" height="54">
        </div>
        <div class="brand-text">
          <span class="brand-university">${SITE.university}</span>
          <span class="brand-center">${SITE.center}</span>
        </div>
      </a>

      <nav class="main-nav" aria-label="메인 내비게이션">
        <ul class="nav-list">${nav}
        </ul>
      </nav>

      <div class="header-actions">
        ${cta}
        <button type="button" class="btn-mobile-toggle" id="mobileToggleBtn" aria-label="메뉴 열기">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>`
    );
  }

  /* ------------------------------------------------------------------ */
  /* Breadcrumb                                                          */
  /* ------------------------------------------------------------------ */
  function renderBreadcrumb() {
    const catList = MENU.map(
      (m) =>
        `<a href="${menuHref(m)}" class="${cls('bc-dropdown-item', m === activeMenu && 'active')}">${m.label}</a>`
    ).join('\n            ');

    const subList = activeMenu
      ? activeMenu.children
          .map(
            (c) =>
              `<a href="${c.href}" class="${cls('bc-dropdown-item', isCurrent(c.href) && 'active')}">${esc(c.label)}</a>`
          )
          .join('\n            ')
      : '';

    const trigger = (label) => `
          <button type="button" class="bc-trigger">
            <span>${esc(label)}</span>
            ${chevronDown('', '.5')}
          </button>`;

    mount(
      'site-breadcrumb',
      `
  <section class="breadcrumb-bar" aria-label="현재 위치 내비게이션">
    <div class="container breadcrumb-container">
      <div class="breadcrumb-nav">
        <a href="${SITE.home}" class="bc-home" title="홈으로 이동" aria-label="홈으로">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </a>

        <div class="bc-item-dropdown">${trigger(activeMenu ? activeMenu.label : '메뉴')}
          <div class="bc-dropdown-list">
            ${catList}
          </div>
        </div>
${
  activeMenu
    ? `
        <div class="bc-item-dropdown">${trigger(activeSub ? activeSub.label : '하위 메뉴')}
          <div class="bc-dropdown-list">
            ${subList}
          </div>
        </div>`
    : ''
}
      </div>

      <!-- QR 다운로드: 다시 보이게 하려면 hidden 속성만 지우면 된다. -->
      <div class="bc-actions" hidden>
        <button type="button" class="btn-qr-tool" id="btnQrTool" aria-label="QR 코드 보기 및 다운로드">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          QR 다운로드
        </button>
      </div>
    </div>
  </section>`
    );
  }

  /* ------------------------------------------------------------------ */
  /* Footer                                                              */
  /* ------------------------------------------------------------------ */
  function renderFooter() {
    const links = FOOTER_LINKS.map(
      ([label, href, highlight]) =>
        `<li class="${cls('footer-nav-item', highlight && 'highlight')}"><a href="${href}">${label}</a></li>`
    ).join('\n          ');
    const options = FAMILY_SITES.map(([label, url]) => `<option value="${url}">${label}</option>`).join(
      '\n            '
    );

    mount(
      'site-footer',
      `
  <footer class="site-footer">
    <div class="footer-top-bar">
      <div class="container">
        <ul class="footer-nav-list">
          ${links}
        </ul>
      </div>
    </div>

    <div class="footer-main">
      <div class="container footer-content-wrap">
        <div class="footer-info">
          <div class="footer-center-name">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
              <path d="M2 12h20"></path>
            </svg>
            ${SITE.university} ${SITE.center}
          </div>
          <div class="footer-info-meta">
            <p>${SITE.address}</p>
            <p class="footer-copyright">Copyright © ${SITE.year}. ${SITE.university} ${SITE.center}. All rights reserved.</p>
          </div>
        </div>

        <div class="footer-side-tools">
          <label for="familySites" class="footer-side-label">관련 기관 및 패밀리 사이트</label>
          <select id="familySites" class="family-site-select">
            <option value="">패밀리 사이트 바로가기</option>
            ${options}
          </select>
        </div>
      </div>
    </div>
  </footer>`
    );
  }

  /* ------------------------------------------------------------------ */
  /* Overlays: Back-to-top, QR modal, mobile drawer                      */
  /* ------------------------------------------------------------------ */
  function renderOverlays() {
    const qrDesc =
      document.body.dataset.qrDesc || '스마트폰 카메라로 스캔하여 현재 페이지를 바로 확인하세요.';

    const drawer = MENU.map((m) => {
      const open = m === activeMenu;
      return `
      <div class="${cls('drawer-nav-item', open && 'open')}">
        <div class="drawer-nav-title"${open ? ' style="color: #1a56db;"' : ''}>
          <span>${m.label}</span>
          ${chevronDown(14)}
        </div>
        <div class="drawer-sub-list">
          ${m.children
            .map(
              (c) =>
                `<a href="${c.href}" class="${cls('drawer-sub-link', isCurrent(c.href) && 'active')}">${esc(c.label)}</a>`
            )
            .join('\n          ')}
        </div>
      </div>`;
    }).join('');

    mount(
      'site-overlays',
      `
  <div class="floating-tools">
    <button type="button" class="tool-fab top-btn" id="topBtn" title="맨 위로 가기" aria-label="맨 위로 가기">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </div>

  <div class="modal-overlay" id="qrModal" role="dialog" aria-modal="true" aria-labelledby="qrModalTitle">
    <div class="modal-box">
      <button type="button" class="modal-close-btn" aria-label="팝업 닫기">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="modal-header">
        <h3 id="qrModalTitle">모바일 페이지 바로가기 QR 코드</h3>
        <p class="modal-desc">${qrDesc}</p>
      </div>

      <div class="qr-code-display">
        <svg viewBox="0 0 160 160" width="160" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="160" fill="white" rx="8"/>
          <rect x="16" y="16" width="36" height="36" rx="4" stroke="#0f2d59" stroke-width="6"/>
          <rect x="26" y="26" width="16" height="16" fill="#1a56db" rx="2"/>
          <rect x="108" y="16" width="36" height="36" rx="4" stroke="#0f2d59" stroke-width="6"/>
          <rect x="118" y="26" width="16" height="16" fill="#1a56db" rx="2"/>
          <rect x="16" y="108" width="36" height="36" rx="4" stroke="#0f2d59" stroke-width="6"/>
          <rect x="26" y="118" width="16" height="16" fill="#1a56db" rx="2"/>
          <rect x="62" y="16" width="8" height="8" fill="#1e40af"/>
          <rect x="76" y="24" width="8" height="8" fill="#0284c7"/>
          <rect x="88" y="16" width="8" height="8" fill="#1e40af"/>
          <rect x="62" y="36" width="8" height="8" fill="#0ea5e9"/>
          <rect x="80" y="44" width="8" height="8" fill="#1e40af"/>
          <rect x="16" y="62" width="8" height="8" fill="#1e40af"/>
          <rect x="30" y="70" width="8" height="8" fill="#0284c7"/>
          <rect x="44" y="62" width="8" height="8" fill="#1a56db"/>
          <rect x="62" y="62" width="12" height="12" fill="#0f2d59" rx="2"/>
          <rect x="84" y="66" width="8" height="8" fill="#1a56db"/>
          <rect x="104" y="62" width="8" height="8" fill="#0284c7"/>
          <rect x="120" y="70" width="8" height="8" fill="#0f2d59"/>
          <rect x="136" y="62" width="8" height="8" fill="#1a56db"/>
          <rect x="20" y="86" width="8" height="8" fill="#0284c7"/>
          <rect x="36" y="90" width="8" height="8" fill="#1e40af"/>
          <rect x="62" y="84" width="8" height="8" fill="#0ea5e9"/>
          <rect x="78" y="92" width="8" height="8" fill="#1a56db"/>
          <rect x="94" y="84" width="8" height="8" fill="#0f2d59"/>
          <rect x="110" y="90" width="8" height="8" fill="#0284c7"/>
          <rect x="130" y="86" width="8" height="8" fill="#1e40af"/>
          <rect x="62" y="110" width="8" height="8" fill="#1a56db"/>
          <rect x="76" y="120" width="8" height="8" fill="#0ea5e9"/>
          <rect x="90" y="108" width="8" height="8" fill="#1e40af"/>
          <rect x="108" y="116" width="8" height="8" fill="#0284c7"/>
          <rect x="124" y="126" width="8" height="8" fill="#0f2d59"/>
          <rect x="62" y="136" width="8" height="8" fill="#0284c7"/>
          <rect x="80" y="134" width="8" height="8" fill="#1a56db"/>
          <rect x="100" y="136" width="8" height="8" fill="#0ea5e9"/>
          <rect x="130" y="138" width="8" height="8" fill="#1e40af"/>
        </svg>
      </div>

      <button type="button" class="btn-primary-white btn-qr-download" id="btnDownloadQr">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        QR 이미지 다운로드
      </button>
    </div>
  </div>

  <!-- 설명회 참석 신청 (신청 내용은 구글 시트에 저장 - 설정 방법: server/README.md) -->
  <div class="modal-overlay" id="enrollModal" role="dialog" aria-modal="true" aria-labelledby="enrollModalTitle">
    <div class="modal-box modal-box-wide">
      <button type="button" class="modal-close-btn" aria-label="팝업 닫기">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="modal-header">
        <h3 id="enrollModalTitle">지능화혁신융합전공 설명회 참석신청</h3>
        <p class="modal-desc">KENTECH 전남광주지능화혁신연구센터</p>
      </div>

      <!-- ※ 설명회 일정이 확정되면 아래 내용을 수정하세요 -->
      <dl class="event-info">
        <dt>일시</dt><dd>2026년 11월 20일(금) 19:00</dd>
        <dt>장소</dt><dd>KENTECH 캠퍼스 (상세 장소 추후 공지)</dd>
        <dt>대상</dt><dd>지역 재직자, 입학 희망자</dd>
      </dl>

      <form id="enrollForm" class="form-stack" novalidate>
        <input type="hidden" name="event" value="지능화혁신융합전공 설명회">
        <!-- 스팸 방지용 (사람에게는 보이지 않음) -->
        <input type="text" name="website" class="form-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="form-field">
          <label for="userName">성명 *</label>
          <input type="text" id="userName" name="name" required autocomplete="name" placeholder="홍길동">
        </div>

        <div class="form-field">
          <label for="userAffiliation">소속 (기업체명) *</label>
          <input type="text" id="userAffiliation" name="affiliation" required autocomplete="organization" placeholder="예: (주)혁신기업">
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="userPhone">연락처 *</label>
            <input type="tel" id="userPhone" name="phone" required autocomplete="tel" inputmode="numeric" pattern="0\\d{1,2}-?\\d{3,4}-?\\d{4}" placeholder="010-0000-0000">
          </div>
          <div class="form-field">
            <label for="userEmail">이메일 *</label>
            <input type="email" id="userEmail" name="email" required autocomplete="email" placeholder="example@kentech.ac.kr">
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="userCount">참석 인원 *</label>
            <select id="userCount" name="attendees" required>
              <option value="1">1명</option>
              <option value="2">2명</option>
              <option value="3">3명</option>
              <option value="4">4명</option>
              <option value="5">5명</option>
            </select>
          </div>
          <div class="form-field">
            <label for="userMode">참석 방식 *</label>
            <select id="userMode" name="mode" required>
              <option value="">선택하세요</option>
              <option>직접 참석</option>
              <option>온라인 참석</option>
            </select>
          </div>
        </div>

        <div class="form-field">
          <label for="userMemo">문의사항 (선택)</label>
          <textarea id="userMemo" name="memo" rows="3" maxlength="500" placeholder="설명회에서 듣고 싶은 내용이나 문의사항을 적어 주세요."></textarea>
        </div>

        <div class="form-notice">
          <strong>개인정보 수집·이용 안내</strong><br>
          수집 항목: 성명, 소속, 연락처, 이메일 · 이용 목적: 설명회 참석 확인 및 안내 연락 · 보유 기간: 설명회 종료 후 1년<br>
          동의를 거부할 수 있으나, 거부 시 참석 신청이 제한됩니다.
        </div>

        <label class="form-check" for="userAgree">
          <input type="checkbox" id="userAgree" name="agree" value="Y" required data-error="개인정보 수집·이용에 동의해 주세요.">
          <span>개인정보 수집·이용에 동의합니다. *</span>
        </label>

        <p class="form-error" id="enrollError" role="alert" hidden></p>

        <button type="submit" class="btn-form-submit" id="enrollSubmit">참석 신청하기</button>
      </form>
    </div>
  </div>

  <aside class="mobile-drawer" id="mobileDrawer" aria-label="모바일 전체 메뉴">
    <div class="drawer-header">
      <div class="drawer-title">전체 메뉴</div>
      <button type="button" id="closeDrawerBtn" class="drawer-close-btn" aria-label="메뉴 닫기">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="drawer-nav">${drawer}
    </div>
  </aside>`
    );
  }

  renderHeader();
  renderBreadcrumb();
  renderFooter();
  renderOverlays();

  // 페이지 본문의 '#앵커' 링크 중 대상이 없는 것도 "작성중" 페이지로 연결
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    if ((PENDING[id] || READY[id]) && !document.getElementById(id)) a.setAttribute('href', pendingHref('#' + id));
  });

  // 패밀리 사이트 이동 (inline onchange 대체)
  const family = document.getElementById('familySites');
  if (family) {
    family.addEventListener('change', () => {
      if (family.value) window.open(family.value, '_blank', 'noopener');
      family.selectedIndex = 0;
    });
  }
})();
