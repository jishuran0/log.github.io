// 从本地存储中获取用户数据
let user = new Map(JSON.parse(localStorage.getItem("users") || "[]"));

function createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
    return toast;
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = createToastElement();
    }
    toast.textContent = message;
    toast.style.opacity = 1;

    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 消息提示函数
const showMessage = (message) => {
    showToast(message);
};

// 验证手机号的有效性
const validatePhone = (phone) => {
    if (!phone) {
        showMessage("手机号不能为空");
        return false;
    }
    const phoneRegex = /^1[3456789]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        showMessage("请输入有效手机号，需以1开头，第二位是3 - 9，共11位数字");
        return false;
    }
    return true;
};

// 验证邮箱的有效性
const validateEmail = (email) => {
    if (!email) {
        showMessage("邮箱不能为空");
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("请输入有效邮箱地址");
        return false;
    }
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', '163.com', 'qq.com'];
    const domain = email.split('@')[1];
    if (!validDomains.includes(domain)) {
        showMessage("请使用常见有效的邮箱域名");
        return false;
    }
    return true;
};

// 验证密码的有效性及两次输入是否一致
const validatePassword = (password, confirmPassword) => {
    if (!password) {
        showMessage("密码不能为空");
        return false;
    }
    if (password.length!== 8) {
        showMessage("密码长度必须为8位");
        return false;
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;
    if (!passwordRegex.test(password)) {
        showMessage("密码必须包含字母和数字");
        return false;
    }
    if (password!== confirmPassword) {
        showMessage("两次输入密码不一致");
        return false;
    }
    return true;
};

// 保存用户数据到本地存储
const saveUserData = () => {
    localStorage.setItem("users", JSON.stringify(Array.from(user.entries())));
};

// 处理注册表单提交
const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const registerPhone = document.getElementById("registerPhoneInput").value.trim();
    const registerEmail = document.getElementById("registerEmailInput").value.trim();
    const registerPassword = document.getElementById("registerPasswordInput").value;
    const confirmPassword = document.getElementById("confirmPasswordInput").value;
    const agreeTerms = document.getElementById("agree-terms").checked;

    if (!validatePhone(registerPhone) ||!validateEmail(registerEmail) ||!validatePassword(registerPassword, confirmPassword)) {
        return;
    }

    if (!agreeTerms) {
        showMessage("请同意所有条款");
        return;
    }

    if (user.has(registerPhone)) {
        const confirmReset = confirm("一个手机号只能注册一次，该手机号已注册，是否要重置密码？");
        if (confirmReset) {
            window.location.href = "forgotPass.html";
        }
        return;
    }

    user.set(registerPhone, {
        email: registerEmail,
        password: registerPassword
    });
    saveUserData();
    showMessage("注册成功，请使用新账号登录。");
};

// 处理登录表单提交
const handleLoginSubmit = (e) => {
    e.preventDefault();
    try {
        const phoneInput = document.getElementById("phoneInput").value.trim();
        const passwordInput = document.getElementById("passwordInput").value;

        if (!phoneInput ||!passwordInput) {
            showMessage("手机号或密码不能为空");
            return;
        }

        const userInfo = user.get(phoneInput);

        if (userInfo && userInfo.password === passwordInput) {
            showMessage("登录成功！即将为您跳转页面...");
            setTimeout(() => {
                window.location.href = "l.html";
            }, 1000);
        } else {
            showMessage("用户名或密码错误");
        }
    } catch (error) {
        console.error("登录过程中出现错误:", error);
        showMessage("登录失败，请稍后重试。");
    }
};

// 验证码倒计时状态管理
const countdownState = {
    countdown: 60,
    timer: null,
    previousPhone: ''
};

// 开始倒计时函数
const startCountdown = (button) => {
    button.disabled = true;
    button.textContent = `请 ${countdownState.countdown} 秒后重试`;
    countdownState.timer = setInterval(() => {
        countdownState.countdown--;
        if (countdownState.countdown > 0) {
            button.textContent = `请 ${countdownState.countdown} 秒后重试`;
        } else {
            resetCountdown(button);
        }
    }, 1000);
};

// 重置倒计时状态函数
const resetCountdown = (button) => {
    if (countdownState.timer) {
        clearInterval(countdownState.timer);
    }
    button.disabled = false;
    button.innerHTML = '<span>获取</span><br><span>验证码</span>';
    countdownState.countdown = 60;
    countdownState.timer = null;
};

// 发送验证码
const sendVerificationCode = (phone) => {
    return new Promise((resolve, reject) => {
        if (!validatePhone(phone)) {
            reject(new Error("手机号无效"));
            return;
        }
        if (!user.has(phone)) {
            reject(new Error("该手机号未注册，请先注册。"));
            return;
        }
        // 实际项目中这里是向后端发送请求的代码
        setTimeout(() => {
            showMessage('验证码已发送，请查收。');
            resolve();
        }, 100);
    });
};

// 处理忘记密码表单提交
const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    const phone = document.getElementById("resetPhoneInput").value.trim();
    const verificationCode = document.getElementById("verificationCodeInput").value.trim();
    const newPassword = document.getElementById("newPasswordInput").value;
    const confirmNewPassword = document.getElementById("confirmNewPasswordInput").value;

    if (!validatePhone(phone)) {
        return;
    }
    if (!verificationCode) {
        showMessage('请输入验证码');
        return;
    }
    if (!validatePassword(newPassword, confirmNewPassword)) {
        return;
    }

    // 这里可以添加与后端交互验证验证码的逻辑
    // 假设验证码验证通过
    user.set(phone, {
        email: user.get(phone)?.email,
        password: newPassword
    });
    saveUserData();
    showMessage('密码重置成功，请使用新密码登录。');
};

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 注册表单
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegisterSubmit);
    }

    // 登录页面
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginSubmit);
    }

    // 忘记密码页面
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    if (resetPasswordForm) {
        const resetPhoneInput = document.getElementById("resetPhoneInput");
        const getVerificationCodeButton = document.getElementById("getVerificationCodeButton");

        // 获取验证码按钮点击事件
        getVerificationCodeButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const phone = resetPhoneInput.value.trim();
            try {
                await sendVerificationCode(phone);
                startCountdown(getVerificationCodeButton);
                countdownState.previousPhone = phone;
            } catch (error) {
                showMessage(error.message);
            }
        });

        // 监听手机号输入框的 blur 事件
        resetPhoneInput.addEventListener('blur', () => {
            const currentPhone = resetPhoneInput.value.trim();
            if (countdownState.timer && currentPhone!== countdownState.previousPhone) {
                showMessage('修改手机号将重新发送验证码');
                resetCountdown(getVerificationCodeButton);
                countdownState.previousPhone = currentPhone;
                getVerificationCodeButton.click();
            }
        });

        resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
    }
});