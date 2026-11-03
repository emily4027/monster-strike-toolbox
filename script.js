document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------------
    // 1. 原有的 3D 卡片特效 (保留不動)
    // ------------------------------------------------
    const cards = document.querySelectorAll('.tool-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;

            const decoration = card.querySelector('.card-decoration');
            if (decoration) {
                decoration.style.transform = `translateX(${rotateY * 1.5}px) translateY(${rotateX * 1.5}px) scale(1.1)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            const decoration = card.querySelector('.card-decoration');
            if (decoration) {
                decoration.style.transform = '';
            }
        });
    });

    console.log('%c 怪物彈珠工具箱 %c Ready ', 'background: #333; color: #fff; border-radius: 3px 0 0 3px; padding: 2px 5px;', 'background: #4caf50; color: #fff; border-radius: 0 3px 3px 0; padding: 2px 5px;');

    // 頁尾年份：2025 起算，自動帶入今年
    const copyrightYear = document.getElementById('copyright-year');
    const currentYear = new Date().getFullYear();
    if (copyrightYear && currentYear > 2025) {
        copyrightYear.textContent = `2025–${currentYear}`;
    }

    // ------------------------------------------------
    // 2. Firebase 邏輯 (優化版：優先讀取本地快取)
    // ------------------------------------------------
    const loginBtn = document.getElementById('google-login-btn');
    const userInfoBtn = document.getElementById('user-info');
    const userDisplayNameSpan = document.getElementById('user-display-name');
    const userPhotoImg = document.getElementById('user-photo');
    const userPhotoFallback = document.getElementById('user-photo-fallback');
    const privacyNote = document.getElementById('privacy-note');
    const privacyNoteIcon = document.getElementById('privacy-note-icon');
    const privacyNoteText = document.getElementById('privacy-note-text');

    const AUTH_UNAVAILABLE_MESSAGE = '登入服務暫時無法使用，請重新整理頁面。';

    // 登入服務狀態：'loading' 等待 SDK、'ready' 可使用、'failed' 載入超時
    let authStatus = 'loading';

    // 頭像：沒有照片網址或照片載入失敗時，改顯示預設的人像圖示
    function setAvatar(photoURL) {
        if (photoURL) {
            userPhotoImg.src = photoURL;
            userPhotoImg.hidden = false;
            userPhotoFallback.hidden = true;
        } else {
            userPhotoImg.removeAttribute('src');
            userPhotoImg.hidden = true;
            userPhotoFallback.hidden = false;
        }
    }
    userPhotoImg.addEventListener('error', () => setAvatar(''));

    function showLoggedIn(displayName, photoURL) {
        userDisplayNameSpan.textContent = displayName || '使用者';
        setAvatar(photoURL);
        loginBtn.style.display = 'none';
        privacyNote.style.display = 'none';
        userInfoBtn.style.display = 'flex';
    }

    function showLoggedOut() {
        loginBtn.style.display = 'inline-flex';
        privacyNote.style.display = 'flex';
        userInfoBtn.style.display = 'none';
    }

    // 把 Firebase 錯誤轉成給使用者看的訊息；回傳 null 代表不需要提示
    function getLoginErrorMessage(error) {
        switch (error && error.code) {
            case 'auth/popup-closed-by-user':
            case 'auth/cancelled-popup-request':
                return null; // 使用者自己關掉視窗，不打擾
            case 'auth/popup-blocked':
                return '登入視窗被瀏覽器擋下了，請允許此網站開啟彈出視窗後再試一次。';
            default:
                return `登入失敗，請稍後再試。\n（錯誤代碼：${(error && error.code) || 'unknown'}）`;
        }
    }

    // 🟢 優化步驟 A：一載入頁面，先檢查 sessionStorage
    // 這樣使用者不用等 Firebase 初始化，就能馬上看到登入狀態，避免按鈕閃爍
    const cachedIsLoggedIn = sessionStorage.getItem('ms_toolbox_isLoggedIn') === 'true';

    if (cachedIsLoggedIn) {
        console.log("讀取 sessionStorage 快取：已登入");
        showLoggedIn(
            sessionStorage.getItem('ms_toolbox_displayName'),
            sessionStorage.getItem('ms_toolbox_photoURL')
        );
    } else {
        showLoggedOut();
    }

    // 點擊登入
    loginBtn.addEventListener('click', async () => {
        if (authStatus !== 'ready') return; // SDK 還在載入就先忽略；載入失敗時按鈕會被停用
        const provider = new window.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            await window.signInWithPopup(window.firebaseAuth, provider);
        } catch (error) {
            console.error("登入失敗", error);
            console.info("開發提示：請確認 index.html 的 Firebase Config 正確，並以 http(s) 開啟頁面（不要用 file://）。");
            const message = getLoginErrorMessage(error);
            if (message) alert(message);
        }
    });

    // 點擊使用者資訊區塊登出
    userInfoBtn.addEventListener('click', async () => {
        if (authStatus === 'failed') {
            alert(AUTH_UNAVAILABLE_MESSAGE);
            return;
        }
        if (authStatus !== 'ready') return;
        if (confirm("確定要登出嗎？")) {
            try {
                await window.signOut(window.firebaseAuth);
                // 登出時，UI 更新會由下面的 onAuthStateChanged 自動觸發
            } catch (error) {
                console.error("登出失敗", error);
                alert(`登出失敗，請稍後再試。\n（錯誤代碼：${error.code || 'unknown'}）`);
            }
        }
    });

    // Firebase 載入超時：登入按鈕停用，並把隱私權提示換成錯誤訊息
    function showAuthUnavailable() {
        authStatus = 'failed';
        loginBtn.disabled = true;
        privacyNote.classList.add('is-error');
        privacyNoteIcon.className = 'bi bi-exclamation-triangle-fill';
        privacyNoteText.textContent = AUTH_UNAVAILABLE_MESSAGE;
    }

    // 🟢 優化步驟 B：Firebase 初始化與狀態同步
    // module script 載入 window.firebaseAuth 的時間不固定，每 100ms 檢查一次，最多等 5 秒
    function waitForFirebase(retries = 0) {
        if (window.firebaseAuth) {
            authStatus = 'ready';

            // 監聽登入狀態 (這是最終的權威狀態)
            // 如果 SessionStorage 說已登入，但這裡發現 Token 過期，會自動修正 UI 回未登入
            window.onAuthStateChanged(window.firebaseAuth, (user) => {
                if (user) {
                    // Firebase 確認已登入 -> 更新 UI (確保資料是最新的)
                    showLoggedIn(user.displayName, user.photoURL);

                    sessionStorage.setItem('ms_toolbox_isLoggedIn', 'true');
                    sessionStorage.setItem('ms_toolbox_uid', user.uid);
                    sessionStorage.setItem('ms_toolbox_photoURL', user.photoURL || '');
                    sessionStorage.setItem('ms_toolbox_displayName', user.displayName || '');

                } else {
                    // Firebase 確認未登入 -> 清除 UI
                    showLoggedOut();

                    sessionStorage.removeItem('ms_toolbox_isLoggedIn');
                    sessionStorage.removeItem('ms_toolbox_uid');
                    sessionStorage.removeItem('ms_toolbox_photoURL');
                    sessionStorage.removeItem('ms_toolbox_displayName');
                }
            });

        } else if (retries < 50) {
            setTimeout(() => waitForFirebase(retries + 1), 100);
        } else {
            console.warn("Firebase SDK 載入超時");
            showAuthUnavailable();
        }
    }
    waitForFirebase();
});
