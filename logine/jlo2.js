// انتظار تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على العناصر
    const shuffleBtn = document.getElementById('shuffleBtn');
    const securityKeys = document.getElementById('securityKeys');
    const verifyBtn = document.getElementById('verifyBtn');
    const forgotKeysBtn = document.getElementById('forgotKeysBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    const usernameInput = document.getElementById('username');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const progressBar = document.getElementById('progressBar');
    const steps = document.querySelectorAll('.step');
    
    // متغيرات لتتبع المحاولات الفاشلة
    let failedAttempts = 0;
    let blockedUntil = null;
    let isBlocked = false;
    
    // مفاتيح الأمان الوهمية (ستأتي من السيرفر لاحقاً)
    const securityKeysData = [
        'A1B2-C3D4-E5F6',
        'G7H8-I9J0-K1L2',
        'M3N4-O5P6-Q7R8',
        'S9T0-U1V2-W3X4'
    ];
    
    // طرق التحقق الثنائية (ستأتي من السيرفر لاحقاً)
    const verificationMethods = [
        { id: 'google', name: 'Google Authenticator', icon: 'fab fa-google' },
        { id: 'password', name: 'كلمة المرور', icon: 'fas fa-key' },
        { id: 'email', name: 'البريد الإلكتروني', icon: 'fas fa-envelope' },
        { id: 'sms', name: 'رسالة نصية', icon: 'fas fa-sms' }
    ];
    
    // وظيفة خلط مفاتيح الأمان
    function shuffleSecurityKeys() {
        // إضافة تأثير الخلط
        securityKeys.classList.add('shuffling');
        
        // إنشاء مفاتيح عشوائية
        let shuffledKeys = '';
        const keyLength = 12;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        for (let i = 0; i < keyLength; i++) {
            if (i > 0 && i % 4 === 0) {
                shuffledKeys += '-';
            }
            shuffledKeys += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // عرض المفاتيح بعد تأخير قصير
        setTimeout(() => {
            securityKeys.textContent = shuffledKeys;
            securityKeys.classList.remove('shuffling');
            
            // إخفاء المفاتيح بعد 3 ثواني
            setTimeout(() => {
                securityKeys.textContent = '•••• •••• ••••';
            }, 3000);
        }, 500);
    }
    
    // وظيفة التحقق من اسم المستخدم
    async function verifyUsername() {
        const username = usernameInput.value.trim();
        
        // التحقق من الحظر
        if (isBlocked) {
            const remainingTime = Math.ceil((blockedUntil - Date.now()) / 1000);
            alert(`تم حظر عنوان IP الخاص بك. حاول مرة أخرى بعد ${remainingTime} ثانية`);
            return;
        }
        
        // التحقق من أن الحقل ليس فارغاً
        if (!username) {
            alert('يرجى إدخال اسم المستخدم');
            usernameInput.classList.add('shake');
            setTimeout(() => usernameInput.classList.remove('shake'), 500);
            return;
        }
        
        // إظهار حالة التحميل
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
        verifyBtn.disabled = true;
        
        try {
            // محاكاة إرسال الطلب للسيرفر (سيتم استبداله بطلب حقيقي لاحقاً)
            const response = await mockServerRequest(username);
            
            if (response.success) {
                // تحديث شريط التقدم
                updateProgress(1);
                
                // الانتقال للخطوة الثانية (التحقق الثنائي)
                startTwoFactorVerification();
            } else {
                // زيادة عدد المحاولات الفاشلة
                failedAttempts++;
                
                // تطبيق إجراءات الأمان
                applySecurityMeasures();
                
                // إظهار رسالة الخطأ
                alert(response.message);
                
                // إعادة تعيين الحقول
                resetForm();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى');
        } finally {
            // إعادة تعيين زر التحقق
            verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> تحقق';
            verifyBtn.disabled = false;
        }
    }
    
    // وظيفة تطبيق إجراءات الأمان بعد الفشل
    function applySecurityMeasures() {
        // الحصول على عنوان IP الوهمي (سيتم استبداله بعنوان IP حقيقي لاحقاً)
        const ipAddress = '192.168.1.1';
        
        // حساب مدة الحظر
        let blockDuration = 0;
        
        if (failedAttempts === 2) {
            blockDuration = 60 * 1000; // 1 دقيقة
        } else if (failedAttempts === 4) {
            blockDuration = 5 * 60 * 1000; // 5 دقائق
        } else if (failedAttempts === 6) {
            blockDuration = 20 * 60 * 1000; // 20 دقيقة
        } else if (failedAttempts >= 8) {
            // حظر كلي
            blockDuration = Infinity;
            isBlocked = true;
            
            // هنا سيتم إرسال عنوان IP للسيرفر للحظر الكلي
            console.log(`تم حظر العنوان IP: ${ipAddress} بشكل كلي`);
            alert('تم حظر عنوان IP الخاص بك بشكل كلي بسبب المحاولات المتكررة');
            return;
        }
        
        if (blockDuration > 0) {
            blockedUntil = Date.now() + blockDuration;
            isBlocked = true;
            
            // هنا سيتم إرسال عنوان IP للسيرفر للحظر المؤقت
            console.log(`تم حظر العنوان IP: ${ipAddress} مؤقتاً لمدة ${blockDuration / 1000} ثانية`);
            
            // إلغاء الحظر بعد انتهاء المدة
            setTimeout(() => {
                isBlocked = false;
                blockedUntil = null;
                console.log('تم إلغاء حظر العنوان IP');
            }, blockDuration);
        }
    }
    
    // وظيفة بدء التحقق الثنائي
    function startTwoFactorVerification() {
        // إخفاء نموذج تسجيل الدخول الأولي
        document.getElementById('loginForm').style.display = 'none';
        
        // إنشاء قسم التحقق الثنائي
        const twoFactorSection = document.createElement('div');
        twoFactorSection.className = 'two-factor-section';
        twoFactorSection.innerHTML = `
            <h2>التحقق الثنائي</h2>
            <p>يرجى اختيار طريقة التحقق التي تفضلها:</p>
            <div class="verification-methods" id="verificationMethods">
                <!-- سيتم عرض طرق التحقق هنا -->
            </div>
            <div class="verification-input" id="verificationInput" style="display: none;">
                <label for="verificationCode">رمز التحقق</label>
                <input type="text" id="verificationCode" placeholder="أدخل الرمز">
                <button id="submitVerificationBtn" class="btn primary-btn">
                    <i class="fas fa-check"></i> تأكيد
                </button>
            </div>
        `;
        
        // إضافة القسم الجديد
        document.querySelector('.content-section').appendChild(twoFactorSection);
        
        // عرض طرق التحقق
        displayVerificationMethods();
    }
    
    // وظيفة عرض طرق التحقق
    function displayVerificationMethods() {
        const methodsContainer = document.getElementById('verificationMethods');
        
        verificationMethods.forEach(method => {
            const methodElement = document.createElement('div');
            methodElement.className = 'verification-method';
            methodElement.innerHTML = `
                <i class="${method.icon}"></i>
                <span>${method.name}</span>
            `;
            
            methodElement.addEventListener('click', () => selectVerificationMethod(method));
            methodsContainer.appendChild(methodElement);
        });
    }
    
    // وظيفة اختيار طريقة التحقق
    function selectVerificationMethod(method) {
        // إظهار حقل إدخال الرمز
        document.getElementById('verificationInput').style.display = 'block';
        
        // محاكاة إرسال رمز التحقق (سيتم استبداله بطلب حقيقي للسيرفر)
        console.log(`تم إرسال رمز التحقق عبر: ${method.name}`);
        alert(`تم إرسال رمز التحقق إلى ${method.name}`);
        
        // إعداد زر التأكيد
        document.getElementById('submitVerificationBtn').addEventListener('click', verifyCode);
    }
    
    // وظيفة التحقق من الرمز
    async function verifyCode() {
        const code = document.getElementById('verificationCode').value.trim();
        
        if (!code) {
            alert('يرجى إدخال رمز التحقق');
            return;
        }
        
        // إظهار حالة التحميل
        const submitBtn = document.getElementById('submitVerificationBtn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
        submitBtn.disabled = true;
        
        try {
            // محاكاة التحقق من الرمز (سيتم استبداله بطلب حقيقي للسيرفر)
            const response = await mockCodeVerification(code);
            
            if (response.success) {
                // تحديث شريط التقدم
                updateProgress(2);
                
                // الانتقال للخطوة الثالثة (الدخول الآمن)
                completeLogin();
            } else {
                alert('رمز التحقق غير صحيح');
                document.getElementById('verificationCode').value = '';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى');
        } finally {
            // إعادة تعيين الزر
            submitBtn.innerHTML = '<i class="fas fa-check"></i> تأكيد';
            submitBtn.disabled = false;
        }
    }
    
    // وظيفة إكمال تسجيل الدخول
    function completeLogin() {
        // تحديث شريط التقدم
        updateProgress(3);
        
        // إنشاء رسالة نجاح
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h2>تم تسجيل الدخول بنجاح!</h2>
            <p>جاري تحويلك إلى لوحة التحكم...</p>
        `;
        
        // إضافة الرسالة
        document.querySelector('.content-section').appendChild(successMessage);
        
        // محاكاة التحويل للوحة التحكم (سيتم استبداله بتحويل حقيقي لاحقاً)
        setTimeout(() => {
            console.log('التحويل إلى لوحة التحكم');
            // window.location.href = '/dashboard';
        }, 2000);
    }
    
    // وظيفة تحديث شريط التقدم
    function updateProgress(step) {
        const progressPercentage = (step / 3) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // تحديث الخطوات
        steps.forEach((s, index) => {
            if (index < step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }
    
    // وظيفة إعادة تعيين النموذج
    function resetForm() {
        usernameInput.value = '';
        rememberMeCheckbox.checked = false;
        securityKeys.textContent = '•••• •••• ••••';
    }
    
    // محاكاة طلب السيرفر للتحقق من اسم المستخدم
    function mockServerRequest(username) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة استجابة السيرفر
                if (username === 'admin') {
                    resolve({ success: true });
                } else {
                    resolve({ success: false, message: 'اسم المستخدم غير موجود' });
                }
            }, 1500);
        });
    }
    
    // محاكاة التحقق من رمز التحقق
    function mockCodeVerification(code) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // محاكاة استجابة السيرفر
                if (code === '123456') {
                    resolve({ success: true });
                } else {
                    resolve({ success: false, message: 'رمز التحقق غير صحيح' });
                }
            }, 1000);
        });
    }
    
    // معالجات الأحداث
    shuffleBtn.addEventListener('click', shuffleSecurityKeys);
    verifyBtn.addEventListener('click', verifyUsername);
    forgotKeysBtn.addEventListener('click', () => {
        alert('سيتم نقلك إلى صفحة استعادة المفاتيح');
        // هنا سيتم التحويل لصفحة استعادة المفاتيح لاحقاً
    });
    backToMainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
    
    // بدء دوران الأيقونات
    const icons = document.querySelectorAll('.security-icon, .control-icon, .privacy-icon');
    const iconArray = Array.from(icons);
    let currentIconIndex = 0;
    
    function rotateIcons() {
        iconArray[currentIconIndex].classList.remove('active');
        currentIconIndex = (currentIconIndex + 1) % iconArray.length;
        iconArray[currentIconIndex].classList.add('active');
    }
    
    setInterval(rotateIcons, 3000);
});
