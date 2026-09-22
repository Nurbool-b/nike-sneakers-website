const shoeImg = document.getElementById('shoeImg');
  const shoeWrap = document.getElementById('shoeWrap');
  const shoeShadowEl = document.getElementById('shoeShadow');
  const hero = document.getElementById('hero');
  const words = [document.getElementById('w0'),document.getElementById('w1'),document.getElementById('w2')];
  const dots = Array.from(document.querySelectorAll('.dot'));
  const colorNameEl = document.getElementById('colorName');
  const splatsWrap = document.getElementById('splats');

  const THEMES = [
    { name:'Court Purple', img:'assets/shoe-purple.png',
      bg:['#7c4fd9','#5a2fb0','#3c1a7d','#2a0f5e'], price:'62 000 ₸' },
    { name:'Varsity Red', img:'assets/shoe-red.png',
      bg:['#e2536b','#c22a44','#7f1a2c','#5c101f'], price:'64 500 ₸' },
    { name:'Total Orange', img:'assets/shoe-orange.png',
      bg:['#f5a95a','#e07a1f','#9c4f10','#6e350a'], price:'59 900 ₸' }
  ];

  let idx = 0;
  let animating = false;

  function buildSplats(){
    splatsWrap.innerHTML = '';
    let seed = 42;
    function rnd(){ seed = (seed*9301+49297)%233280; return seed/233280; }
    for(let i=0;i<18;i++){
      const angle = rnd()*Math.PI*0.9 + Math.PI*0.15;
      const dist = 40 + rnd()*140;
      const cx = 60 + Math.cos(angle)*dist*0.9;
      const cy = 60 + Math.sin(angle)*dist*0.5;
      const size = 2 + rnd()*6;
      const el = document.createElement('div');
      el.className='splat';
      el.style.width = size+'px';
      el.style.height = size+'px';
      el.style.left = 'calc(50% + '+cx+'px)';
      el.style.top = 'calc(50% + '+cy+'px)';
      splatsWrap.appendChild(el);
    }
  }
  buildSplats();
  const splatEls = () => Array.from(document.querySelectorAll('.splat'));

  function popSplats(){
    const els = splatEls();
    els.forEach(el=>{ el.style.transition='none'; el.style.opacity=0; el.style.transform='scale(0)'; });
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        els.forEach((el,i)=>{
          el.style.transition = `opacity .3s ease ${i*0.012}s, transform .4s cubic-bezier(.34,1.56,.64,1) ${i*0.012}s`;
          el.style.opacity=0.85; el.style.transform='scale(1)';
        });
      });
    });
    setTimeout(()=>{ els.forEach(el=>{ el.style.transition='opacity .4s'; el.style.opacity=0; }); }, 900);
  }

  function setThemeChrome(i){
    const t = THEMES[i];
    hero.style.setProperty('--c1', t.bg[0]);
    hero.style.setProperty('--c2', t.bg[1]);
    hero.style.setProperty('--c3', t.bg[2]);
    hero.style.setProperty('--c4', t.bg[3]);
    colorNameEl.textContent = t.name;
    dots.forEach((d,k)=> d.classList.toggle('selected', k===i));
    words.forEach((w,k)=> w.classList.toggle('show', k===i));
    updateOrderPreview(i);
  }

  function updateOrderPreview(i){
    const t = THEMES[i];
    const orderImg = document.getElementById('orderShoeImg');
    const orderName = document.getElementById('orderColorName');
    const orderPreview = document.getElementById('orderPreview');
    const orderPrice = orderPreview ? orderPreview.querySelector('.opPrice') : null;
    if(orderImg) orderImg.src = t.img;
    if(orderName) orderName.textContent = t.name;
    if(orderPrice) orderPrice.textContent = t.price;
    if(orderPreview){
      orderPreview.style.background = `radial-gradient(circle at 35% 30%, ${t.bg[0]}, ${t.bg[3]})`;
    }
  }

  function easeOutBack(t){
    const c1=1.70158, c3=c1+1;
    return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2);
  }
  function easeInCubic(t){ return t*t*t; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function clamp01(x){ return Math.max(0,Math.min(1,x)); }

  // Video-style switch animation: shoe flies up & fades out,
  // new colorway drops in from above with a bouncy settle (matches hero video entrance)
  function switchTo(newIdx){
    if(animating || newIdx===idx) return;
    animating = true;
    shoeWrap.classList.remove('floating');
    shoeWrap.style.transformOrigin = '50% 50%';

    const EXIT = 240;
    const ENTER = 620;
    const TOTAL = EXIT + ENTER;
    let swapped = false;
    const start = performance.now();

    function frame(now){
      const t = now - start;

      if(t < EXIT){
        const p = easeInCubic(t/EXIT);
        const y = lerp(0, -90, p);
        const rot = lerp(-18, -2, p);
        const scale = lerp(1, 0.72, p);
        shoeWrap.style.transform = `translateY(${y}px) rotate(${rot}deg) scale(${scale})`;
        shoeImg.style.opacity = 1 - p;
        shoeShadowEl.style.opacity = 0.55*(1-p);
      } else if(t < TOTAL){
        if(!swapped){
          swapped = true;
          shoeImg.src = THEMES[newIdx].img;
          setThemeChrome(newIdx);
          popSplats();
        }
        const p = clamp01((t-EXIT)/ENTER);
        const e = easeOutBack(p);
        const y = lerp(-260, 0, e);
        const rot = lerp(-70, -18, e);
        const scale = lerp(0.6, 1, clamp01(p*1.3));
        shoeWrap.style.transform = `translateY(${y}px) rotate(${rot}deg) scale(${scale})`;
        shoeImg.style.opacity = clamp01((t-EXIT)/220);
        shoeShadowEl.style.opacity = 0.55*clamp01((p-0.35)/0.4);
        const shadowScale = lerp(0.4,1,e);
        shoeShadowEl.style.transform = `translateX(-50%) scaleX(${shadowScale}) scaleY(${shadowScale*0.7})`;
      } else {
        idx = newIdx;
        shoeWrap.style.transform = '';
        shoeShadowEl.style.transform = 'translateX(-50%)';
        shoeShadowEl.style.opacity = '';
        shoeImg.style.opacity = '';
        shoeWrap.classList.add('floating');
        animating = false;
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  shoeWrap.addEventListener('click', ()=>{
    switchTo((idx+1)%THEMES.length);
  });
  dots.forEach(d=>{
    d.addEventListener('click', ()=> switchTo(parseInt(d.dataset.idx)));
  });

  // init
  setThemeChrome(0);

  // ---------- Оформить заказ button (nav) scrolls to order section ----------
  const orderBtn = document.getElementById('orderBtn');
  if(orderBtn){
    orderBtn.addEventListener('click', ()=>{
      document.getElementById('order').scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  // ---------- Trending pills ----------
  document.querySelectorAll('.trendPill').forEach(pill=>{
    pill.addEventListener('click', ()=>{
      document.querySelectorAll('.trendPill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active');
      const target = document.getElementById(pill.dataset.target);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // ---------- Order form: size picker ----------
  let selectedSize = '43';
  const sizeButtons = document.querySelectorAll('#orderSizePicker button');
  sizeButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      sizeButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    });
  });

  // ---------- Order form: quantity picker ----------
  let qty = 1;
  const qtyValueEl = document.getElementById('qtyValue');
  document.getElementById('qtyMinus').addEventListener('click', ()=>{
    qty = Math.max(1, qty-1);
    qtyValueEl.textContent = qty;
  });
  document.getElementById('qtyPlus').addEventListener('click', ()=>{
    qty = Math.min(9, qty+1);
    qtyValueEl.textContent = qty;
  });

  // ---------- Order form: submit ----------
  const orderForm = document.getElementById('orderForm');
  const orderSubmitBtn = document.getElementById('orderSubmitBtn');
  const orderSuccess = document.getElementById('orderSuccess');

  function validateField(input, errId, validatorFn){
    const errEl = document.getElementById(errId);
    const ok = validatorFn(input.value.trim());
    input.classList.toggle('invalid', !ok);
    errEl.style.display = ok ? 'none' : 'block';
    return ok;
  }

  orderForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nameInput = document.getElementById('orderName');
    const phoneInput = document.getElementById('orderPhone');
    const addressInput = document.getElementById('orderAddress');

    const nameOk = validateField(nameInput, 'errName', v => v.length >= 2);
    const phoneOk = validateField(phoneInput, 'errPhone', v => v.replace(/[^0-9]/g,'').length >= 10);
    const addressOk = validateField(addressInput, 'errAddress', v => v.length >= 5);

    if(!(nameOk && phoneOk && addressOk)) return;

    const orderNumber = 'PLN-' + Math.floor(100000 + Math.random()*899999);
    const themeName = THEMES[idx].name;

    orderSubmitBtn.disabled = true;
    orderSubmitBtn.textContent = 'Заказ оформлен ✓';

    orderSuccess.hidden = false;
    orderSuccess.innerHTML =
      `Спасибо, ${nameInput.value.trim()}! Ваш заказ <strong>№${orderNumber}</strong> оформлен.<br>` +
      `Air Jordan 1 «${themeName}», размер ${selectedSize}, ${qty} ${qty===1?'пара':'пары'}.<br>` +
      `Мы свяжемся с вами по номеру ${phoneInput.value.trim()} для подтверждения доставки на адрес: ${addressInput.value.trim()}.`;

    orderSuccess.scrollIntoView({behavior:'smooth', block:'nearest'});
  });

  [document.getElementById('orderName'), document.getElementById('orderPhone'), document.getElementById('orderAddress')]
    .forEach(inp=> inp.addEventListener('input', ()=>{ inp.classList.remove('invalid'); }));

  // ---------- Membership CTA ----------
  document.getElementById('joinBtn').addEventListener('click', ()=>{
    document.getElementById('order').scrollIntoView({behavior:'smooth', block:'start'});
  });
  document.getElementById('learnMoreBtn').addEventListener('click', ()=>{
    window.open('https://www.nike.com/membership', '_blank');
  });

  // ---------- Product info modal ----------
  const collectionImgs = Array.from(document.querySelectorAll('#collection .card .imgWrap img'));
  // order in DOM: 0 purple, 1 red, 2 orange, 3 blue, 4 black
  const IMG = {
    purple: collectionImgs[0] ? collectionImgs[0].src : THEMES[0].img,
    red: collectionImgs[1] ? collectionImgs[1].src : THEMES[1].img,
    orange: collectionImgs[2] ? collectionImgs[2].src : THEMES[2].img,
    blue: collectionImgs[3] ? collectionImgs[3].src : '',
    black: collectionImgs[4] ? collectionImgs[4].src : ''
  };

  // Simple original flat-icon sneaker illustrations for models we don't have real photos of.
  function badgeSVG(label, accentColor){
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="118" r="98" fill="rgba(255,255,255,0.08)"/>
      <g transform="translate(78,88) scale(2.05)">
        <path fill="${accentColor}" d="M108.6 3.2c-4.7 2-9.2 3.9-13.9 5.8L10.3 42.6c-3.5 1.4-7 2.8-7.7 3-1.8.5-2.6-.6-2.1-2.2.3-1 1-2 2.4-3.4 2.6-2.7 5.7-4.7 21.8-14 13.4-7.8 30.6-16.5 41.6-21.1C74.9 1.4 82.6-.5 87.9.1c3.5.4 6.8 1.8 9.6 4 3.9 2.9 7.5 5.8 11.1-.9z"/>
      </g>
      <text x="200" y="258" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="27" font-weight="900" font-style="italic" fill="#ffffff" letter-spacing="0.5">${label}</text>
    </svg>`;
  }

  const PRODUCT_INFO = {
    jordan1: {
      tag:'Air Jordan · с 1985 года', title:'Air Jordan 1',
      img: IMG.purple, bg:['#7c4fd9','#2a0f5e'],
      desc:'Первая именная модель Майкла Джордана, представленная в 1985 году дизайнером Питером Муром. Именно с неё началась культура коллекционирования кроссовок: сочетание чёрного и красного цветов нарушало дресс-код НБА, и лигу пугали штрафом в 5000 долларов за каждую игру в этих кроссовках. Nike превратила это в легендарную рекламную кампанию «запрещённых» кроссовок.',
      meta:['Год: 1985','Дизайнер: Питер Мур','Оригинальные цвета: Chicago, Bred, Royal, Shadow'],
      link:'https://www.nike.com/jordan/air-jordan-1'
    },
    jordanRetro: {
      tag:'Air Jordan · Retro', title:'Air Jordan 1 Retro',
      img: IMG.purple, bg:['#7c4fd9','#2a0f5e'],
      desc:'Ретро-версии Air Jordan 1 повторяют силуэт и легендарные расцветки оригинала 1985 года, но с современными материалами. Retro High OG считается эталоном для коллекционеров: именно эти пары чаще всего становятся объектом коллабораций и лимитированных релизов Jordan Brand.',
      meta:['Линейка: Retro High OG','Материал: премиальная кожа','Значок: Wings на щиколотке'],
      link:'https://www.nike.com/jordan/air-jordan-1'
    },
    totalOrange: {
      tag:'Air Jordan 1 · Colorway', title:'Air Jordan 1 «Total Orange»',
      img: IMG.orange, bg:['#f5a95a','#6e350a'],
      desc:'Энергичная и заметная расцветка культового силуэта Air Jordan 1. Яркий оранжевый акцент на белой кожаной базе делает пару одной из самых узнаваемых в уличном стиле — смелый выбор для тех, кто не боится выделяться.',
      meta:['Модель: Air Jordan 1 High OG','Цвет: Total Orange/White','С 1985 года'],
      link:'https://www.nike.com/w?q=air%20jordan%201%20orange'
    },
    courtPurple: {
      tag:'Air Jordan 1 · Colorway', title:'Air Jordan 1 «Court Purple»',
      img: IMG.purple, bg:['#7c4fd9','#2a0f5e'],
      desc:'Классический силуэт Air Jordan 1 High OG в бело-фиолетовой гамме. Глубокий пурпурный тон на панелях и подошве в сочетании с премиальной белой кожей — один из самых сдержанных и стильных вариантов модели.',
      meta:['Модель: Air Jordan 1 High OG','Цвет: Court Purple/White','С 1985 года'],
      link:'https://www.nike.com/w?q=air%20jordan%201%20court%20purple'
    },
    varsityRed: {
      tag:'Air Jordan 1 · Colorway', title:'Air Jordan 1 «Varsity Red»',
      img: IMG.red, bg:['#e2536b','#5c101f'],
      desc:'Дерзкое сочетание красного, чёрного и белого — палитра, вдохновлённая формой Chicago Bulls и легендарной историей Майкла Джордана. Один из самых узнаваемых образов во всей линейке Air Jordan.',
      meta:['Модель: Air Jordan 1 High OG','Цвет: Varsity Red/White','С 1985 года'],
      link:'https://www.nike.com/w?q=air%20jordan%201%20varsity%20red'
    },
    royalBlue: {
      tag:'Air Jordan 1 · Colorway', title:'Air Jordan 1 «Royal Blue»',
      img: IMG.blue, bg:['#2c5aa0','#0d1f3d'],
      desc:'Глубокий синий тон на чистой белой базе — один из четырёх оригинальных цветов Air Jordan 1 1985 года, наряду с Chicago, Bred и Shadow. Сдержанная классика, которая подходит под любой образ.',
      meta:['Модель: Air Jordan 1 High OG','Цвет: Royal/White','Один из 4 OG-цветов 1985 года'],
      link:'https://www.nike.com/w?q=air%20jordan%201%20royal%20blue'
    },
    blackToe: {
      tag:'Air Jordan 1 · Colorway', title:'Air Jordan 1 «Black»',
      img: IMG.black, bg:['#3a3a3a','#0a0a0a'],
      desc:'Монохромная версия Air Jordan 1 — минималистичная и универсальная пара, которая легко сочетается с любым стилем одежды, от уличного до делового кэжуал.',
      meta:['Модель: Air Jordan 1 High OG','Цвет: Black/White','С 1985 года'],
      link:'https://www.nike.com/w?q=air%20jordan%201%20black'
    },
    dunk: {
      tag:'Nike Dunk · с 1985 года', title:'Nike Dunk Low',
      img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Panda_Nike_Dunk.jpg?width=700', fallback:'assets/silhouette-dunk.png', bg:['#2d5f3e','#0f1f14'],
      desc:'Nike Dunk появился в 1985 году как баскетбольная модель для студенческих команд США в рамках программы College Colors — «Будь верен своей школе». Дизайнер Питер Мур, автор Air Jordan 1, взял за основу силуэт Air Force 1 и добавил яркие цвета университетских команд. В 2000-х Dunk Low получил вторую жизнь как культовая модель скейтбординга благодаря линейке Nike SB.',
      meta:['Год: 1985','Дизайнер: Питер Мур','Изначально: College Colors, позже — Nike SB','Фото: Wikimedia Commons'],
      link:'https://www.nike.com/a/dunk-history'
    },
    af1: {
      tag:'Air Force 1 · с 1982 года', title:'Nike Air Force 1',
      img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nike_AF1.JPG?width=700', fallback:'assets/silhouette-af1.png', bg:['#3a3a3a','#0a0a0a'],
      desc:'Первая баскетбольная модель с технологией амортизации Nike Air, выпущенная в 1982 году дизайнером Брюсом Килгором. Название отсылает к самолёту президента США. В 1980-х шесть игроков НБА — «Original Six» — стали лицом рекламной кампании. Позже Air Force 1 вышел за пределы баскетбола и стал одной из самых продаваемых моделей Nike за всю историю.',
      meta:['Год: 1982','Дизайнер: Брюс Килгор','Первая модель с технологией Nike Air','Фото: Wikimedia Commons'],
      link:'https://www.nike.com/air-force-1'
    },
    airmax: {
      tag:'Air Max · с 1987 года', title:'Nike Air Max',
      img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Nike_Air_Max_180.jpg?width=700', fallback:'assets/silhouette-airmax.png', bg:['#c22a44','#3a0f1a'],
      desc:'В 1987 году дизайнер Тинкер Хэтфилд представил Air Max 1 — первую модель с видимой воздушной подушкой в подошве. Идея пришла к нему после посещения центра Помпиду в Париже, где вся инженерная структура здания вынесена наружу. Внутри Nike в успех идеи поначалу не верили, но именно эта модель определила будущее целой линейки кроссовок Air Max.',
      meta:['Год: 1987','Дизайнер: Тинкер Хэтфилд','Первая видимая амортизация Nike Air','Фото: Wikimedia Commons'],
      link:'https://www.nike.com/a/air-max-1-history'
    }
  };

  const infoModalOverlay = document.getElementById('infoModalOverlay');
  const modalImgWrap = document.getElementById('modalImgWrap');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalMeta = document.getElementById('modalMeta');
  const modalLink = document.getElementById('modalLink');

  function openProductModal(key){
    const p = PRODUCT_INFO[key];
    if(!p) return;
    modalTag.textContent = p.tag;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalMeta.innerHTML = p.meta.map(m=>`<span>${m}</span>`).join('');
    modalLink.href = p.link;
    modalImgWrap.style.background = `radial-gradient(circle at 35% 30%, ${p.bg[0]}, ${p.bg[1]})`;
    if(p.img){
      const fallback = p.fallback || '';
      modalImgWrap.innerHTML = `<img src="${p.img}" alt="${p.title}" ${fallback ? `onerror="this.onerror=null;this.src='${fallback}';"` : ''}>`;
    } else {
      modalImgWrap.innerHTML = p.svg;
    }
    infoModalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal(){
    infoModalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-product]').forEach(el=>{
    el.addEventListener('click', ()=> openProductModal(el.dataset.product));
  });
  document.getElementById('modalCloseBtn').addEventListener('click', closeProductModal);
  infoModalOverlay.addEventListener('click', (e)=>{
    if(e.target === infoModalOverlay) closeProductModal();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeProductModal();
  });
