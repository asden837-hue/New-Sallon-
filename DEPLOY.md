# 🚀 دليل نشر موقع صالون الأناقة - مجاني ودائم 24/7

هذا الدليل يشرح كيفية نشر الموقع على الإنترنت مجاناً بحيث يعمل 24/7 بدون الحاجة لجهازك.

## 📋 المكونات المستخدمة

| الخدمة | الاستخدام | السعر |
|--------|-----------|-------|
| **Render.com** | استضافة السيرفر (Node.js) | مجاني |
| **MongoDB Atlas** | قاعدة بيانات في السحاب | مجاني (512MB) |
| **UptimeRobot** | إبقاء الموقع نشطاً 24/7 | مجاني |

## الخطوة 1: إنشاء قاعدة بيانات MongoDB Atlas (مجانية)

1. افتح https://www.mongodb.com/atlas
2. سجل حساب جديد (استخدم بريدك الإلكتروني)
3. اختر **FREE** (M0 Sandbox)
4. اختر أي منطقة قريبة مثلاً **Frankfurt** (Europe)
5. اضغط **Create Cluster** (يستغرق 1-3 دقائق)
6. في **Quickstart**:
   - أضف مستخدم: اسم المستخدم + كلمة سر (احفظها)
   - IP Address: اضغط **Add Your Current IP Address**
7. اضغط **Connect** → **Connect your application**
8. انسخ **Connection String** (يشبه: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/barbershop?retryWrites=true`)

> ⚠️ **مهم**: استبدل `<username>` و `<password>` ببيانات المستخدم اللي سجلته فوق

## الخطوة 2: رفع الكود على GitHub

1. افتح https://github.com (سجل حساب إذا ما عندك)
2. اضغط **New repository** (مستودع جديد)
3. سمّه: `barbershop-booking`
4. اختار **Public**
5. لا تضغط على أي شيء آخر، فقط **Create repository**
6. بعدها رح تشوف أوامر، ارجع للـ Terminal هنا واكتب:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<اسم-مستخدمك>/barbershop-booking.git
git push -u origin main
```

> استبدل `<اسم-مستخدمك>` باسم مستخدم GitHub الخاص بك

## الخطوة 3: النشر على Render.com

1. افتح https://render.com
2. سجل حساب (يمكنك استخدام حساب GitHub)
3. اضغط **New +** → **Web Service**
4. اختر **Build and deploy from a Git repository**
5. صل حساب GitHub واختر مستودع `barbershop-booking`
6. املأ المعلومات:

| الخانة | القيمة |
|--------|--------|
| **Name** | `barbershop-booking` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | **Free** |

7. تحت **Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | رابط MongoDB من الخطوة 1 (بدون علامات تنصيص) |

8. اضغط **Create Web Service**

⏳ الانتظار: 3-5 دقائق ورح يشتغل الموقع!

بعد ما يخلص، رح تحصل رابط مثل:
```
https://barbershop-booking.onrender.com
```

## الخطوة 4: إبقاء الموقع نشط 24/7 (UptimeRobot)

الخطة المجانية في Render توقف الموقع بعد 15 دقيقة من عدم الاستخدام.
UptimeRobot يرسل إشارة كل 5 دقائق → يبقيه نشطاً للأبد!

1. افتح https://uptimerobot.com
2. سجل حساب مجاني
3. اضغط **Add New Monitor**
4. املأ المعلومات:

| الخانة | القيمة |
|--------|--------|
| **Monitor Type** | `HTTP(s)` |
| **Friendly Name** | `صالون الأناقة` |
| **URL (or IP)** | رابط Render الخاص بك (مثل `https://barbershop-booking.onrender.com/health`) |
| **Monitoring Interval** | `5 minutes` |

5. اضغط **Create Monitor**

✅ **الآن موقعك يعمل 24/7 مجاناً!**

## 📝 ملاحظات مهمة

- **تحديث الموقع**: عدّل الكود محلياً ثم `git push` ورح يتم تحديثه تلقائياً
- **البيانات**: محفوظة في MongoDB Atlas، آمنة حتى لو حدث تحديث
- **الإشعارات**: التليجرام شغال كما هو
- **مشكلة؟**: راجع logs في Render Dashboard

## 🔧 أوامر مفيدة

```bash
# تشغيل محلياً (للتطوير)
npm start

# رفع التعديلات إلى GitHub
git add .
git commit -m "تحديث"
git push
```

## 🎯 الخلاصة

بعد تنفيذ الخطوات الأربع:
- ✅ موقعك على الإنترنت 24/7
- ✅ مجاني بالكامل
- ✅ بياناتك محفوظة في السحاب
- ✅ الإشعارات تصلك على تيليجرام
- ✅ الموقع محدث تلقائياً عند أي تعديل
