const express = require('express');
const cors = require('cors');
const path = require('path');
const dns = require('dns');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const mongoose = require('mongoose');

// ===== DNS FIX: Use public DNS to resolve MongoDB Atlas SRV records =====
// Some ISP/network DNS servers (e.g. 192.168.1.1) block or refuse SRV lookups
// which causes `querySrv ECONNREFUSED` when connecting to MongoDB Atlas.
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ===== TELEGRAM CONFIG =====
const TELEGRAM_TOKEN = '8878277151:AAE6JybwCl6NZtsnoEAuG_909voiBzPiO4M';
const TELEGRAM_CHAT_ID = '5333127409';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MONGODB CONNECTION =====
const MONGODB_URI = 'mongodb+srv://admin:saloon1234@cluster0.riilmut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ===== BOOKING SCHEMA =====
const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  services: { type: [String], required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ===== SERVICES CONFIG =====
const SERVICES = {
  hair: { label: '💇 قص شعر', telegram: '💇 قص شعر' },
  hair_beard: { label: '💈 شعر وذقن', telegram: '💈 شعر وذقن' },
  skin_mask: { label: '🧖‍♂️ ماسك للبشرة', telegram: '🧖‍♂️ ماسك للبشرة' },
  groom_vip: { label: '👑 VIP للعريس', telegram: '👑 VIP للعريس' }
};

const Booking = mongoose.model('Booking', bookingSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// ===== VALIDATION =====

function validatePhone(phone) {
  const clean = phone.replace(/\s/g, '');
  return /^(09\d{8}|\+9639\d{8})$/.test(clean);
}

function getBookingDurationMinutes(services) {
  // Single service = 60 min, multiple services = 90 min
  const list = Array.isArray(services) ? services : (services ? [services] : []);
  return list.length > 1 ? 90 : 60;
}

function validateBooking(data) {
  const errors = [];
  const services = data.services;

  if (!data.name || data.name.trim().length < 2) {
    errors.push('الاسم غير صالح (يجب أن يكون حرفين على الأقل)');
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.push('رقم الهاتف غير صالح (يجب أن يبدأ بـ 09 أو +9639)');
  }

  if (!Array.isArray(services) || services.length === 0) {
    errors.push('الرجاء اختيار الخدمة المطلوبة');
  } else {
    services.forEach(s => {
      if (!SERVICES[s]) {
        errors.push(`الخدمة غير معروفة: ${s}`);
      }
    });
  }

  if (!data.date) {
    errors.push('التاريخ مطلوب');
  }

  if (!data.time) {
    errors.push('الوقت مطلوب');
  }

  if (data.date && data.time) {
    const selected = new Date(`${data.date}T${data.time}`);
    if (isNaN(selected.getTime())) {
      errors.push('التاريخ أو الوقت غير صالح');
    } else if (selected <= new Date()) {
      errors.push('يجب أن يكون الموعد في المستقبل');
    }

    const dayOfWeek = selected.getDay();
    if (dayOfWeek === 5) {
      errors.push('الصالون مغلق يوم الجمعة، الرجاء اختيار يوم آخر');
    }

    // Working hours: 10:00 AM - 10:00 PM
    // Single service (60 min): last booking at 21:00
    // Multiple services (90 min): last booking at 20:30
    const duration = getBookingDurationMinutes(services);
    const [hour, minute] = data.time.split(':').map(Number);
    const lastAllowedHour = duration > 60 ? 20 : 21;
    const lastAllowedMinute = duration > 60 ? 30 : 0;
    if (hour < 10 || hour > lastAllowedHour || (hour === lastAllowedHour && minute > lastAllowedMinute)) {
      errors.push(duration > 60
        ? 'ساعات العمل من 10 صباحاً حتى 10 مساءً، وآخر موعد لحجز خدمتين أو أكثر هو 8:30 مساءً'
        : 'ساعات العمل من 10 صباحاً حتى 10 مساءً، وآخر موعد للحجز 9 مساءً');
    }
  }

  return errors;
}

// ===== TELEGRAM NOTIFICATION =====

async function sendTelegramNotification(booking) {
  try {
    const dateObj = new Date(booking.date + 'T' + booking.time);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('ar-SA', options);
    const formattedTime = booking.time;

    const serviceList = (Array.isArray(booking.services) ? booking.services : [booking.service].filter(Boolean))
      .map(s => SERVICES[s] ? SERVICES[s].telegram : s);
    const serviceLabel = serviceList.length > 0 ? serviceList.join(' + ') : 'غير محدد';

    const message = `
🪒 *حجز جديد في صالون الأناقة!*

👤 *الاسم:* ${booking.name}
📞 *الهاتف:* ${booking.phone}
💈 *الخدمات:* ${serviceLabel}
📅 *التاريخ:* ${formattedDate}
⏰ *الوقت:* ${formattedTime}
🆔 *رقم الحجز:* \`${booking.id.slice(0, 8)}\`
📋 *تم الحجز في:* ${new Date(booking.createdAt).toLocaleString('ar-SA')}
    `.trim();

    const response = await axios.post(TELEGRAM_API, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log('📨 Telegram notification sent successfully');
    return true;
  } catch (err) {
    console.error('❌ Failed to send Telegram notification:', err.response?.data || err.message);
    return false;
  }
}

// ===== API ROUTES =====

// GET /api/bookings - Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

// GET /api/bookings/:id - Get single booking
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ id: req.params.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'الحجز غير موجود' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في جلب البيانات' });
  }
});

// POST /api/bookings - Create new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const errors = validateBooking(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(' | '),
        errors
      });
    }

    // Check for booking conflicts, considering booking duration (60 min single / 90 min multiple)
    const dayBookings = await Booking.find({ date: req.body.date });
    const servicesList = Array.isArray(req.body.services) ? req.body.services : [];
    const requestedDuration = getBookingDurationMinutes(servicesList);
    const requestedTime = new Date(`${req.body.date}T${req.body.time}`).getTime();
    const conflict = dayBookings.find(b => {
      const bTime = new Date(`${b.date}T${b.time}`).getTime();
      const bDuration = getBookingDurationMinutes(b.services);
      // Overlap if requested booking starts before existing booking ends AND
      // existing booking starts before requested booking ends
      const requestedEnd = requestedTime + requestedDuration * 60 * 1000;
      const bEnd = bTime + bDuration * 60 * 1000;
      return requestedTime < bEnd && bTime < requestedEnd;
    });
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `هذا الموعد يتعارض مع حجز الساعة ${conflict.time}، يجب أن يكون بين كل حجز والحجز التالي ساعة على الأقل`
      });
    }

    const newBooking = new Booking({
      id: uuidv4(),
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      services: servicesList,
      date: req.body.date,
      time: req.body.time,
      createdAt: new Date()
    });

    await newBooking.save();

    const serviceLabel = servicesList.map(s => SERVICES[s] ? SERVICES[s].label : s).join(' + ');
    console.log(`✅ New booking: ${newBooking.name} - [${serviceLabel}] - ${newBooking.date} ${newBooking.time}`);

    // Send Telegram notification (non-blocking)
    sendTelegramNotification(newBooking);

    res.status(201).json({
      success: true,
      message: 'تم حجز الموعد بنجاح!',
      data: newBooking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في حفظ الحجز' });
  }
});

// DELETE /api/bookings/:id - Cancel a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ id: req.params.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'الحجز غير موجود' });
    }
    console.log(`❌ Booking cancelled: ${booking.name} - ${booking.date} ${booking.time}`);
    res.json({ success: true, message: 'تم إلغاء الحجز بنجاح', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في إلغاء الحجز' });
  }
});

// GET /api/check?date=YYYY-MM-DD&count=N - Check available times for a date
app.get('/api/check', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'التاريخ مطلوب' });
    }

    // Number of selected services determines the booking duration:
    // 1 service = 60 min, 2+ services = 90 min
    const count = parseInt(req.query.count, 10);
    const serviceCount = !isNaN(count) && count > 0 ? count : 1;
    const requestedDuration = serviceCount > 1 ? 90 : 60;

    const dayBookings = await Booking.find({ date }).select('time services -_id');

    // Working hours: 10:00 AM - 10:00 PM
    const allSlots = [];
    for (let h = 10; h <= 21; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 21 && m > 0) continue;
        const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        allSlots.push(slot);
      }
    }

    // A slot is unavailable if the requested booking would overlap any existing booking
    const unavailableSlots = allSlots.filter(slot => {
      const slotTime = new Date(`${date}T${slot}`).getTime();
      const slotEnd = slotTime + requestedDuration * 60 * 1000;
      return dayBookings.some(b => {
        const bTime = new Date(`${date}T${b.time}`).getTime();
        const bDuration = getBookingDurationMinutes(b.services);
        const bEnd = bTime + bDuration * 60 * 1000;
        return slotTime < bEnd && bTime < slotEnd;
      });
    });

    const availableSlots = allSlots.filter(slot => !unavailableSlots.includes(slot));

    // Check if the date is Friday
    const dateObj = new Date(date + 'T12:00:00');
    const isFriday = dateObj.getDay() === 5;

    res.json({
      success: true,
      data: {
        date,
        isFriday,
        booked: isFriday ? allSlots : unavailableSlots,
        available: isFriday ? [] : availableSlots
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في التحقق من المواعيد' });
  }
});

// ===== SERVE FRONTEND =====

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'project.html'));
});

// ===== HEALTH CHECK ENDPOINT (for UptimeRobot) =====
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== AUTO CLEANUP: Delete passed bookings every day at 11:00 PM =====

async function cleanupExpiredBookings() {
  try {
    const now = new Date();
    // Today's date as YYYY-MM-DD in server local time
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Delete bookings whose date is before today
    const result = await Booking.deleteMany({ date: { $lt: today } });

    // Delete today's bookings whose time has already passed
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayPassed = await Booking.deleteMany({
      date: today,
      time: { $lte: currentTime }
    });

    const totalDeleted = result.deletedCount + todayPassed.deletedCount;
    if (totalDeleted > 0) {
      console.log(`🧹 Auto cleanup: removed ${totalDeleted} expired booking(s)`);
    } else {
      console.log('🧹 Auto cleanup: no expired bookings to remove');
    }
  } catch (err) {
    console.error('❌ Auto cleanup error:', err.message);
  }
}

// Schedule cleanup every day at 11:00 PM (server local time)
function scheduleAutoCleanup() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(23, 0, 0, 0); // 11:00 PM

  let delay = target - now;
  if (delay < 0) {
    // Already past 11 PM today, schedule for tomorrow
    target.setDate(target.getDate() + 1);
    delay = target - now;
  }

  console.log(`🧹 Auto cleanup scheduled daily at 11:00 PM (first run in ${Math.round(delay / 60000)} minutes)`);

  setTimeout(async () => {
    await cleanupExpiredBookings();
    // Re-schedule for the next day
    scheduleAutoCleanup();
  }, delay);
}

// Run initial cleanup shortly after startup (after MongoDB connects)
setTimeout(() => {
  cleanupExpiredBookings();
}, 5000);

// ===== START SERVER =====

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════╗
║   🏪 صالون الأناقة - نظام الحجز ║
╠══════════════════════════════════╣
║  ✅ Server is running!           ║
║  📍 Port: ${PORT}                  ║
║  📋 API: /api                    ║
║  💾 MongoDB: Connected           ║
║  🧹 Auto cleanup: 11:00 PM      ║
╚══════════════════════════════════╝
  `);
});

// Start the daily auto cleanup scheduler
scheduleAutoCleanup();
