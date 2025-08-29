// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على العناصر
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const icons = document.querySelectorAll('.security-icon, .control-icon, .privacy-icon');
    
    // مصفوفة الأيقونات للتبديل
    const iconArray = Array.from(icons);
    let currentIconIndex = 0;
    
    // وظيفة تبديل الأيقونات
    function rotateIcons() {
        // إخفاء الأيقونة الحالية
        iconArray[currentIconIndex].classList.remove('active');
        
        // الانتقال للأيقونة التالية
        currentIconIndex = (currentIconIndex + 1) % iconArray.length;
        
        // إظهار الأيقونة الجديدة
        iconArray[currentIconIndex].classList.add('active');
    }
    
    // بدء دوران الأيقونات كل 3 ثواني
    setInterval(rotateIcons, 3000);
    
    // معالج حدث زر تسجيل الدخول
    loginBtn.addEventListener('click', function() {
        // إضافة تأثير اهتزاز
        this.style.animation = 'shake 0.5s';
        
        // إزالة التأثير بعد الانتهاء
        setTimeout(() => {
            this.style.animation = '';
            // هنا يمكن إضافة منطق تسجيل الدخول
            console.log('تم النقر على زر تسجيل الدخول');
        }, 500);
    });
    
    // معالج حدث زر التسجيل الجديد
    registerBtn.addEventListener('click', function() {
        // إضافة تأثير اهتزاز
        this.style.animation = 'shake 0.5s';
        
        // إزالة التأثير بعد الانتهاء
        setTimeout(() => {
            this.style.animation = '';
            // هنا يمكن إضافة منطق التسجيل الجديد
            console.log('تم النقر على زر التسجيل الجديد');
        }, 500);
    });
    
    // إضافة تأثير الاهتزاز للتصميم
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
});
