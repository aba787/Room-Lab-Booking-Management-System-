
// بيانات القاعات والمعامل
const roomsData = {
  conference: [
    'قاعة الاجتماعات الكبرى',
    'قاعة الاجتماعات الصغرى',
    'قاعة المؤتمرات'
  ],
  training: [
    'قاعة التدريب أ',
    'قاعة التدريب ب',
    'قاعة التدريب الكبرى'
  ],
  lab: [
    'معمل الحاسوب 1',
    'معمل الحاسوب 2',
    'معمل البرمجة'
  ],
  workshop: [
    'ورشة العمل الأساسية',
    'ورشة العمل المتقدمة'
  ]
};

// تخزين الحجوزات
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// تحديث خيارات القاعات عند تغيير النوع
document.getElementById('roomType').addEventListener('change', function() {
  const roomType = this.value;
  const roomNameSelect = document.getElementById('roomName');
  
  roomNameSelect.innerHTML = '<option value="">اختر المكان</option>';
  
  if (roomType && roomsData[roomType]) {
    roomsData[roomType].forEach(room => {
      const option = document.createElement('option');
      option.value = room;
      option.textContent = room;
      roomNameSelect.appendChild(option);
    });
  }
});

// معالجة نموذج الحجز
document.getElementById('bookingForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = {
    id: Date.now(),
    roomType: document.getElementById('roomType').value,
    roomName: document.getElementById('roomName').value,
    bookerName: document.getElementById('bookerName').value,
    department: document.getElementById('department').value,
    bookingDate: document.getElementById('bookingDate').value,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    purpose: document.getElementById('purpose').value,
    createdAt: new Date().toLocaleString('ar-SA')
  };
  
  // التحقق من تضارب الأوقات
  if (checkTimeConflict(formData)) {
    alert('عذراً، هناك حجز آخر في نفس الوقت والمكان. يرجى اختيار وقت آخر.');
    return;
  }
  
  // التحقق من صحة الأوقات
  if (formData.startTime >= formData.endTime) {
    alert('وقت البداية يجب أن يكون قبل وقت النهاية');
    return;
  }
  
  // إضافة الحجز
  bookings.push(formData);
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  // عرض رسالة التأكيد
  showConfirmation(formData);
  
  // إعادة تعيين النموذج
  this.reset();
  document.getElementById('roomName').innerHTML = '<option value="">اختر المكان</option>';
  
  // تحديث عرض الحجوزات
  displayBookings();
});

// التحقق من تضارب الأوقات
function checkTimeConflict(newBooking) {
  return bookings.some(booking => 
    booking.roomName === newBooking.roomName &&
    booking.bookingDate === newBooking.bookingDate &&
    ((newBooking.startTime >= booking.startTime && newBooking.startTime < booking.endTime) ||
     (newBooking.endTime > booking.startTime && newBooking.endTime <= booking.endTime) ||
     (newBooking.startTime <= booking.startTime && newBooking.endTime >= booking.endTime))
  );
}

// عرض رسالة التأكيد
function showConfirmation(bookingData) {
  const modal = document.getElementById('confirmationModal');
  const message = document.getElementById('confirmationMessage');
  
  message.innerHTML = `
    <strong>تم تأكيد الحجز بنجاح!</strong><br><br>
    <strong>رقم الحجز:</strong> ${bookingData.id}<br>
    <strong>المكان:</strong> ${bookingData.roomName}<br>
    <strong>المحجوز:</strong> ${bookingData.bookerName}<br>
    <strong>التاريخ:</strong> ${bookingData.bookingDate}<br>
    <strong>الوقت:</strong> من ${bookingData.startTime} إلى ${bookingData.endTime}<br>
    <strong>الغرض:</strong> ${bookingData.purpose}
  `;
  
  modal.classList.remove('hidden');
}

// إغلاق النافذة المنبثقة
function closeModal() {
  document.getElementById('confirmationModal').classList.add('hidden');
}

// طباعة الحجز
function printBooking() {
  window.print();
}

// عرض جميع الحجوزات
function displayBookings(filteredBookings = null) {
  const bookingsList = document.getElementById('bookingsList');
  const bookingsToShow = filteredBookings || bookings;
  
  if (bookingsToShow.length === 0) {
    bookingsList.innerHTML = '<p style="text-align: center; color: #718096; padding: 20px;">لا توجد حجوزات</p>';
    return;
  }
  
  bookingsList.innerHTML = bookingsToShow
    .sort((a, b) => new Date(a.bookingDate + ' ' + a.startTime) - new Date(b.bookingDate + ' ' + b.startTime))
    .map(booking => {
      const now = new Date();
      const bookingDateTime = new Date(booking.bookingDate + ' ' + booking.endTime);
      const isExpired = bookingDateTime < now;
      const status = isExpired ? 'متاح' : 'محجوز';
      const statusClass = isExpired ? 'available' : 'occupied';
      const statusBadgeClass = isExpired ? 'status-available' : 'status-occupied';
      
      return `
        <div class="booking-item ${statusClass}">
          <div class="booking-header">
            <div class="booking-title">${booking.roomName}</div>
            <div class="booking-status ${statusBadgeClass}">${status}</div>
          </div>
          <div class="booking-details">
            <strong>المحجوز:</strong> ${booking.bookerName}<br>
            <strong>القسم:</strong> ${booking.department}<br>
            <strong>التاريخ:</strong> ${booking.bookingDate}<br>
            <strong>الوقت:</strong> من ${booking.startTime} إلى ${booking.endTime}<br>
            <strong>الغرض:</strong> ${booking.purpose}<br>
            <strong>تاريخ الحجز:</strong> ${booking.createdAt}
            <button class="delete-btn" onclick="deleteBooking(${booking.id})">حذف</button>
          </div>
        </div>
      `;
    })
    .join('');
}

// حذف حجز
function deleteBooking(bookingId) {
  if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
    bookings = bookings.filter(booking => booking.id !== bookingId);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    displayBookings();
  }
}

// تصفية الحجوزات حسب التاريخ
function filterBookings() {
  const filterDate = document.getElementById('filterDate').value;
  if (!filterDate) {
    alert('يرجى اختيار تاريخ للتصفية');
    return;
  }
  
  const filtered = bookings.filter(booking => booking.bookingDate === filterDate);
  displayBookings(filtered);
}

// عرض جميع الحجوزات
function showAllBookings() {
  document.getElementById('filterDate').value = '';
  displayBookings();
}

// تعيين الحد الأدنى لتاريخ الحجز (اليوم)
document.addEventListener('DOMContentLoaded', function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').min = today;
  document.getElementById('filterDate').min = today;
  
  // عرض الحجوزات عند تحميل الصفحة
  displayBookings();
});
