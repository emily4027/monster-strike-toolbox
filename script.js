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
    // 2. 新增的 Firebase 邏輯
    // ------------------------------------------------
    const loginBtn = document.getElementById('google-login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfoDiv = document.getElementById('user-info');
    const userDisplayNameSpan = document.getElementById('user-display-name');

    // 等待 module script 載入完成
    setTimeout(() => {
        if (window.firebaseAuth) {
            
            // 監聽登入狀態
            window.onAuthStateChanged(window.firebaseAuth, (user) => {
                if (user) {
                    // 已登入
                    userDisplayNameSpan.textContent = user.displayName;
                    loginBtn.style.display = 'none';
                    userInfoDiv.style.display = 'flex';
                    
                    // 存入 sessionStorage (供其他頁面使用)
                    sessionStorage.setItem('ms_toolbox_isLoggedIn', 'true');
                    sessionStorage.setItem('ms_toolbox_uid', user.uid);
                } else {
                    // 未登入
                    loginBtn.style.display = 'inline-flex';
                    userInfoDiv.style.display = 'none';
                    
                    // 清除 sessionStorage
                    sessionStorage.removeItem('ms_toolbox_isLoggedIn');
                    sessionStorage.removeItem('ms_toolbox_uid');
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
                    // 🎯 新增：錯誤提示，幫助您除錯
                    alert(`登入失敗：\n${error.message}\n\n常見原因：\n1. index.html 中的 Firebase Config 未替換為真實資料。\n2. 直接使用檔案開啟 (file://)，請改用 Live Server (http://)。`);
                }
            });

            // 點擊登出
            logoutBtn.addEventListener('click', async () => {
                try {
                    await window.signOut(window.firebaseAuth);
                } catch (error) {
                    console.error("登出失敗", error);
                    alert(`登出失敗：${error.message}`);
                }
            });
            
        } else {
            console.log("Firebase 尚未初始化完成");
            // 顯示登入按鈕作為預設
            loginBtn.style.display = 'inline-flex';
        }
    }, 500);
});
