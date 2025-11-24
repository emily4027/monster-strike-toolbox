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
    
    // ------------------------------------------------
    // 2. Firebase 邏輯 (優化版：優先讀取本地快取)
    // ------------------------------------------------
    const loginBtn = document.getElementById('google-login-btn');
    const userInfoDiv = document.getElementById('user-info');
    const userDisplayNameSpan = document.getElementById('user-display-name');
    const userPhotoImg = document.getElementById('user-photo'); 
    const privacyNote = document.getElementById('privacy-note');

    // 🟢 優化步驟 A：一載入頁面，先檢查 sessionStorage
    // 這樣使用者不用等 Firebase 初始化，就能馬上看到登入狀態，避免按鈕閃爍
    const cachedIsLoggedIn = sessionStorage.getItem('ms_toolbox_isLoggedIn') === 'true';
    
    if (cachedIsLoggedIn) {
        console.log("讀取 sessionStorage 快取：已登入");
        // 從快取讀取資料
        const cachedName = sessionStorage.getItem('ms_toolbox_displayName');
        const cachedPhoto = sessionStorage.getItem('ms_toolbox_photoURL');

        // 立即更新 UI
        userDisplayNameSpan.textContent = cachedName || '使用者';
        userPhotoImg.src = cachedPhoto || 'https://via.placeholder.com/32';
        
        loginBtn.style.display = 'none';
        privacyNote.style.display = 'none';
        userInfoDiv.style.display = 'flex';
    } else {
        // 若沒登入，顯示預設狀態
        loginBtn.style.display = 'inline-flex';
        privacyNote.style.display = 'flex';
        userInfoDiv.style.display = 'none';
    }

    // 🟢 優化步驟 B：Firebase 初始化與狀態同步
    // 這裡的 setTimeout 是為了等待 module script 載入 window.firebaseAuth
    setTimeout(() => {
        if (window.firebaseAuth) {
            
            // 監聽登入狀態 (這是最終的權威狀態)
            // 如果 SessionStorage 說已登入，但這裡發現 Token 過期，會自動修正 UI 回未登入
            window.onAuthStateChanged(window.firebaseAuth, (user) => {
                if (user) {
                    // Firebase 確認已登入 -> 更新 UI (確保資料是最新的)
                    userDisplayNameSpan.textContent = user.displayName;
                    userPhotoImg.src = user.photoURL || 'https://via.placeholder.com/32';
                    
                    loginBtn.style.display = 'none';
                    privacyNote.style.display = 'none';
                    userInfoDiv.style.display = 'flex';
                    
                    // 🟢 更新 sessionStorage (多存一個 displayName)
                    sessionStorage.setItem('ms_toolbox_isLoggedIn', 'true');
                    sessionStorage.setItem('ms_toolbox_uid', user.uid);
                    sessionStorage.setItem('ms_toolbox_photoURL', user.photoURL || '');
                    sessionStorage.setItem('ms_toolbox_displayName', user.displayName || ''); // 新增：儲存名字

                } else {
                    // Firebase 確認未登入 -> 清除 UI
                    loginBtn.style.display = 'inline-flex';
                    privacyNote.style.display = 'flex';
                    userInfoDiv.style.display = 'none';
                    
                    // 清除 sessionStorage
                    sessionStorage.removeItem('ms_toolbox_isLoggedIn');
                    sessionStorage.removeItem('ms_toolbox_uid');
                    sessionStorage.removeItem('ms_toolbox_photoURL');
                    sessionStorage.removeItem('ms_toolbox_displayName');
                }
            });

            // 點擊登入
            loginBtn.addEventListener('click', async () => {
                const provider = new window.GoogleAuthProvider();
                provider.setCustomParameters({ prompt: 'select_account' });
                try {
                    await window.signInWithPopup(window.firebaseAuth, provider);
                } catch (error) {
                    console.error("登入失敗", error);
                    alert(`登入失敗：\n${error.message}\n\n常見原因：\n1. index.html 中的 Firebase Config 未替換為真實資料。\n2. 直接使用檔案開啟 (file://)，請改用 Live Server (http://)。`);
                }
            });

            // 點擊使用者資訊區塊登出
            userInfoDiv.addEventListener('click', async () => {
                if (confirm("確定要登出嗎？")) {
                    try {
                        await window.signOut(window.firebaseAuth);
                        // 登出時，UI 更新會由上面的 onAuthStateChanged 自動觸發
                    } catch (error) {
                        console.error("登出失敗", error);
                        alert(`登出失敗：${error.message}`);
                    }
                }
            });
            
        } else {
            console.log("Firebase 尚未初始化完成");
            // 如果完全沒有 Firebase，且沒有快取，才顯示預設按鈕
            if (!cachedIsLoggedIn) {
                loginBtn.style.display = 'inline-flex';
                privacyNote.style.display = 'flex';
            }
        }
    }, 500);
});