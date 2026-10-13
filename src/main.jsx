import React from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  Check,
  Clock3,
  Crown,
  Camera,
  MapPin,
  Menu,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import './styles.css';

const services = [
  { id: 'hair', icon: Scissors, name: 'قصّة شعر', detail: 'قَصّة مصممة لتناسبك', time: '٦٠ دقيقة' },
  { id: 'hair_beard', icon: Sparkles, name: 'شعر وذقن', detail: 'إطلالة متكاملة بعناية', time: '٦٠ دقيقة' },
  { id: 'skin_mask', icon: ShieldCheck, name: 'عناية بالبشرة', detail: 'انتعاش يستحقه وجهك', time: '٦٠ دقيقة' },
  { id: 'groom_vip', icon: Crown, name: 'تجربة العريس', detail: 'تفاصيل يومك الكبير', time: '٦٠ دقيقة', featured: true },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function Spotlight() {
  const rawX = useMotionValue(-500);
  const rawY = useMotionValue(-500);
  const x = useSpring(rawX, { stiffness: 55, damping: 22 });
  const y = useSpring(rawY, { stiffness: 55, damping: 22 });
  const [touchInput, setTouchInput] = React.useState(false);

  React.useEffect(() => {
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    const move = event => {
      rawX.set(event.clientX - 220);
      rawY.set(event.clientY - 220);
    };
    const updateInputMode = () => {
      setTouchInput(touchQuery.matches);
      if (touchQuery.matches) window.removeEventListener('pointermove', move);
      else window.addEventListener('pointermove', move, { passive: true });
    };

    updateInputMode();
    touchQuery.addEventListener('change', updateInputMode);
    return () => {
      touchQuery.removeEventListener('change', updateInputMode);
      window.removeEventListener('pointermove', move);
    };
  }, [rawX, rawY]);

  if (touchInput) return <div className="pointer-glow pointer-glow-mobile" aria-hidden="true" />;

  return <motion.div className="pointer-glow" style={{ x, y }} aria-hidden="true" />;
}

function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const links = [
    ['الرئيسية', '#home'],
    ['الخدمات', '#services'],
    ['قصات الشعر', '#haircuts'],
    ['من نحن', '#story'],
  ];

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="ORO، إلى الرئيسية">
        <span className="brand-mark"><Scissors size={18} strokeWidth={1.6} /></span>
        <span className="brand-word">ORO<span className="brand-dot">.</span><small>GROOMING HOUSE</small></span>
      </a>
      <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="التنقل الرئيسي">
        {links.map(([label, href]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
      <button className="menu-toggle" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-wrap" id="home">
      <div className="hero-sticky">
        <div className="hero-copy">
          <motion.div className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <span className="eyebrow-line" /> صالون ORO للحلاقة الرجالية
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8 }}>
            <span>صالون ORO</span><span>لحلاقة رجالية راقية</span>
          </motion.h1>
          <motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            حلاقون محترفون وأفخم قصات الشعر الرجالي.<br className="desktop-break" /> عناية بالذقن وتجربة راقية في الروضة، دمشق.
          </motion.p>
        </div>

        <motion.div className="hero-visual" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <div className="visual-frame">
            <img src="/oro-barber.jpg" alt="حلاقة رجالية في أجواء صالون ORO" />
            <div className="image-shade" />
            <div className="frame-caption"><span>ORO · GROOMING HOUSE</span><strong>العناية التي تستحقها</strong></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div className="ticker" aria-label="حِرفة. حضور. ثقة.">
      <div className="ticker-track">
        {[0, 1].map(copy => <div className="ticker-group" key={copy} aria-hidden={copy === 1}>
          {['حِرفة', 'حضور', 'ثقة', 'تفاصيل', 'حِرفة', 'حضور', 'ثقة', 'تفاصيل'].map((word, i) => <React.Fragment key={`${copy}-${i}`}><span>{word}</span><i>✳</i></React.Fragment>)}
        </div>)}
      </div>
    </div>
  );
}

function Story() {
  return (
    <section className="story-section section-shell" id="story">
      <Reveal className="story-image-wrap">
        <div className="story-image"><img src="/oro-barber.jpg" alt="حلاقة رجالية في صالون ORO" loading="lazy" /><div className="story-image-label">A PLACE TO RESET</div></div>
        <div className="experience-stamp"><span>ORO</span><small>GROOMING<br />HOUSE</small></div>
      </Reveal>
      <div className="story-copy">
        <Reveal><span className="section-kicker">01 — الحكاية</span><h2>مساحتك.<br />وقتك.<br /><span className="gold-text">نسختك الأفضل.</span></h2></Reveal>
        <Reveal delay={0.1}><p>في ORO نؤمن أن الأناقة ليست تفصيلاً إضافياً؛ إنها شعورك وأنت تغادر. من أول استقبال إلى اللمسة الأخيرة، كل شيء هنا صُمّم ليكون على مقاسك.</p></Reveal>
        <Reveal delay={0.2}><a className="subtle-link" href="#services">اكتشف خدماتنا <ArrowLeft size={15} /></a></Reveal>
        <div className="story-aside">NOT JUST A HAIRCUT <span>—</span> IT’S YOUR MOMENT</div>
      </div>
    </section>
  );
}

function TiltCard({ children, className = '' }) {
  const ref = React.useRef(null);
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });

  function onMove(event) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = ref.current.getBoundingClientRect();
    setRotation({
      x: ((event.clientY - bounds.top) / bounds.height - 0.5) * -8,
      y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 8,
    });
  }

  return <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={() => setRotation({ x: 0, y: 0 })} style={{ transform: `perspective(850px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>{children}</div>;
}

function Services({ onBookService }) {
  return (
    <section className="services-section section-shell" id="services">
      <Reveal className="section-heading">
        <span className="section-kicker">02 — اختياراتك، بطريقتك</span>
        <div className="heading-row"><h2>كل تفصيل، <span className="gold-text">بإتقان.</span></h2><p>خدمات أساسية، تنفّذها أيدٍ تعرف أن الفرق<br />يكمُن دائماً في التفاصيل الصغيرة.</p></div>
      </Reveal>
      <motion.div className="services-grid" id="haircuts" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <TiltCard key={service.id} className={`tilt-shell ${service.featured ? 'service-featured' : ''}`}>
              <motion.a className="service-card" href="#booking" variants={fadeUp} onClick={() => onBookService(service.id)}>
                <div className="service-number">0{index + 1}</div>
                <span className="service-icon"><Icon size={21} strokeWidth={1.5} /></span>
                {service.featured && <span className="vip-tag">EXCLUSIVE</span>}
                <h3>{service.name}</h3><p>{service.detail}</p>
                <div className="service-bottom"><span>{service.time}</span><b>احجزها</b></div>
                <span className="card-arrow"><ArrowUpLeft size={16} /></span>
              </motion.a>
            </TiltCard>
          );
        })}
      </motion.div>
    </section>
  );
}

function Numbers() {
  const stats = [['٠٤', 'خدمات مصممة لك'], ['١٠—٢٢', 'ساعات العمل'], ['٦/٧', 'أيام نستقبلك']];
  return (
    <section className="numbers-section" id="experience">
      <div className="numbers-inner section-shell">
        <Reveal className="numbers-intro"><span className="section-kicker">03 — الثقة تُبنى بالتفاصيل</span><h2>أرقام وراءها<br /><span className="gold-text">حكايات حقيقية.</span></h2><p>كل زيارة هي بداية لعلاقة نعتزّ بها.</p></Reveal>
        <motion.div className="stats-grid" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {stats.map(([number, caption]) => <motion.div className="stat-item" key={caption} variants={fadeUp}><strong>{number}</strong><span>{caption}</span><i /></motion.div>)}
        </motion.div>
      </div>
    </section>
  );
}

function Booking({ selectedServices, setSelectedServices }) {
  const [form, setForm] = React.useState({ name: '', phone: '', date: '', time: '' });
  const [available, setAvailable] = React.useState([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [confetti, setConfetti] = React.useState(false);
  const timer = React.useRef(null);
  const minDate = React.useMemo(() => {
    const date = new Date();
    while (date.getDay() === 5) date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, []);
  const selectedService = services.find(service => service.id === selectedServices[0]);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  function showToast(message, type = 'success') {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 5000);
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function loadSlots(date, count = Math.max(1, selectedServices.length)) {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/check?date=${encodeURIComponent(date)}&count=${count}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'تعذّر تحميل المواعيد المتاحة.');
      const slots = result.data.available || [];
      setAvailable(slots);
      setForm(current => ({ ...current, time: slots.includes(current.time) ? current.time : (slots[0] || '') }));
      if (result.data.isFriday) showToast('الصالون مغلق يوم الجمعة، اختر يوماً آخر.', 'error');
      else if (slots.length === 0) showToast('لا توجد مواعيد متاحة في هذا اليوم.', 'error');
    } catch (error) {
      showToast(error.message || 'حدث خطأ أثناء التحقق من المواعيد.', 'error');
    } finally {
      setLoadingSlots(false);
    }
  }

  React.useEffect(() => {
    if (form.date && selectedServices.length) loadSlots(form.date);
  }, [selectedServices]);

  async function submitBooking(event) {
    event.preventDefault();
    if (!selectedServices.length) return showToast('الرجاء اختيار خدمة واحدة على الأقل.', 'error');
    const cleanPhone = form.phone.replace(/\s/g, '');
    if (!/^(09\d{8}|\+9639\d{8})$/.test(cleanPhone)) return showToast('أدخل رقم هاتف صالحاً (09xxxxxxxx أو +9639xxxxxxxx).', 'error');
    if (!form.date || !form.time) return showToast('اختر التاريخ والوقت المناسبين.', 'error');
    if (new Date(`${form.date}T${form.time}`) <= new Date()) return showToast('اختر موعداً في المستقبل.', 'error');
    if (form.date && new Date(`${form.date}T12:00:00`).getDay() === 5) return showToast('الصالون مغلق يوم الجمعة، اختر يوماً آخر.', 'error');
    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: form.name.trim(), phone: cleanPhone, services: selectedServices }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'تعذّر تأكيد الحجز.');
      showToast(result.message || 'تم حجز موعدك بنجاح!');
      setConfetti(true);
      window.setTimeout(() => setConfetti(false), 2200);
      setSelectedServices([]);
      setAvailable([]);
      setForm(current => ({ ...current, name: '', phone: '', time: '' }));
    } catch (error) {
      showToast(error.message || 'حدث خطأ في الاتصال بالخادم، حاول مرة أخرى.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="booking-section section-shell" id="booking">
      <Reveal className="booking-intro">
        <span className="section-kicker">04 — دورك الآن</span>
        <h2>لحظتك تبدأ<br /><span className="gold-text">من هنا.</span></h2>
        <p>اختر الخدمة والوقت الذي يناسبك.<br />نحن نهتمّ بالباقي.</p>
        <div className="booking-detail"><Clock3 size={17} /><span>يومياً من ١٠ صباحاً إلى ١٠ مساءً</span></div>
        <div className="booking-detail"><MapPin size={17} /><span>صالون ORO — الروضة، دمشق</span></div>
      </Reveal>
      <Reveal className="booking-panel" delay={0.12}>
        <div className="booking-panel-top"><div><span className="panel-kicker">ORO PRIVATE BOOKING</span><h3>احجز زيارتك القادمة</h3>{selectedService && <p className="booking-selected-service" aria-live="polite">الخدمة المختارة: {selectedService.name}</p>}</div><span className="panel-mark"><CalendarDays size={18} /></span></div>
        <form className="booking-form" onSubmit={submitBooking} noValidate>
          <div className="form-row">
            <label className="field"><span>الاسم الكامل</span><span className="input-shell"><UserRound size={16} /><input name="name" value={form.name} onChange={updateForm} placeholder="كيف نناديك؟" autoComplete="name" minLength="2" required /></span></label>
            <label className="field"><span>رقم الهاتف</span><span className="input-shell"><span className="phone-code">+٩٦٣</span><input name="phone" type="tel" value={form.phone} onChange={updateForm} placeholder="09xxxxxxxx" autoComplete="tel" required /></span></label>
          </div>
          <div className="form-row">
            <label className="field"><span>التاريخ</span><span className="input-shell"><CalendarDays size={16} /><input name="date" type="date" min={minDate} value={form.date} onChange={event => { updateForm(event); loadSlots(event.target.value); }} required /></span></label>
            <label className="field"><span>الوقت المتاح</span><span className="input-shell"><Clock3 size={16} /><select name="time" value={form.time} onChange={updateForm} required disabled={!available.length || loadingSlots}><option value="">{loadingSlots ? 'جارٍ تحميل المواعيد...' : !form.date ? 'اختر التاريخ أولاً' : available.length ? 'اختر الوقت' : 'لا توجد مواعيد'}</option>{available.map(slot => <option key={slot} value={slot}>{slot}</option>)}</select></span></label>
          </div>
          <InteractiveHoverButton className="button-primary booking-submit interactive-cta" type="submit" disabled={submitting}>{submitting ? 'جارٍ تأكيد حجزك...' : 'تأكيد الموعد'}</InteractiveHoverButton>
          <p className="privacy-note"><ShieldCheck size={13} /> بياناتك محفوظة بسرية تامة</p>
        </form>
      </Reveal>
      <AnimatePresence>{toast && <motion.div className={`toast toast-${toast.type}`} role="status" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><span>{toast.type === 'success' ? <Check size={18} /> : <X size={18} />}</span>{toast.message}<button type="button" aria-label="إغلاق" onClick={() => setToast(null)}><X size={16} /></button></motion.div>}</AnimatePresence>
      <AnimatePresence>{confetti && <div className="confetti-layer" aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <motion.i key={i} initial={{ opacity: 1, y: -30, x: 0, rotate: 0 }} animate={{ opacity: 0, y: 440 + Math.random() * 320, x: Math.random() * 360 - 180, rotate: Math.random() * 500 }} transition={{ duration: 1.8 + Math.random() * 1.2, delay: Math.random() * 0.3 }} />)}</div>}</AnimatePresence>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer section-shell">
      <a className="brand" href="#home"><span className="brand-mark"><Scissors size={18} strokeWidth={1.6} /></span><span className="brand-word">ORO<span className="brand-dot">.</span><small>GROOMING HOUSE</small></span></a>
      <span className="footer-note">تفاصيلك، حكايتنا.</span>
      <div className="footer-links"><a href="#services">الخدمات</a><a href="#booking">احجز موعدك</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={17} /></a></div>
      <span className="copyright">© {new Date().getFullYear()} ORO. صُنع بعناية.</span>
    </footer>
  );
}

function App() {
  const [selectedServices, setSelectedServices] = React.useState([]);

  function selectBookingService(id) {
    setSelectedServices([id]);
  }

  return (
    <>
      <Spotlight />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <Header />
      <main><Hero /><Ticker /><Story /><Services onBookService={selectBookingService} /><Numbers /><Booking selectedServices={selectedServices} setSelectedServices={setSelectedServices} /></main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
