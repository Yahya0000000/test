const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();

app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/myth-portal', { useNewUrlParser: true, useUnifiedTopology: true });

// نموذج المستخدم
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', UserSchema);

// تسجيل مستخدم جديد
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.json({ success: false, error: 'جميع الحقول مطلوبة' });
  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.json({ success: false, error: 'اسم المستخدم أو البريد موجود مسبقاً' });
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashed });
  res.json({ success: true });
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, error: 'بيانات الدخول غير صحيحة' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ success: false, error: 'بيانات الدخول غير صحيحة' });
  res.json({ success: true, username: user.username });
});

// استعادة كلمة المرور (وهمية - ترسل رسالة فقط)
app.post('/api/forgot', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, error: 'البريد الإلكتروني غير مسجّل' });
  // في التطبيق الفعلي، ترسل بريدًا حقيقيًا هنا
  res.json({ success: true, message: 'تم إرسال رابط الاستعادة (وهميًا)' });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));