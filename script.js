document.addEventListener('DOMContentLoaded', () => {
    
    const cards = document.querySelectorAll('.tool-card');

    cards.forEach(card => {
        // 1. 滑鼠移動時，計算傾斜角度
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // 計算滑鼠在卡片內的相對位置 (X, Y)
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 找出卡片中心點
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // 計算旋轉角度 (限制在 +/- 8度內，避免太暈)
            // 越靠近邊緣，旋轉角度越大
            const rotateX = ((y - centerY) / centerY) * -8; 
            const rotateY = ((x - centerX) / centerX) * 8;

            // 應用 3D 效果
            // perspective: 視角深度
            // translateY(-10px): 保持 CSS 原本的懸浮高度
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            
            // 讓裝飾圓圈也跟著移動 (視差效果)
            const decoration = card.querySelector('.card-decoration');
            if (decoration) {
                decoration.style.transform = `translateX(${rotateY * 1.5}px) translateY(${rotateX * 1.5}px) scale(1.1)`;
            }
        });

        // 2. 滑鼠離開時，復原卡片狀態
        card.addEventListener('mouseleave', () => {
            // 清除 inline style，讓它回到 CSS 定義的狀態 (transform: none 或 hover 狀態)
            card.style.transform = '';
            
            const decoration = card.querySelector('.card-decoration');
            if (decoration) {
                decoration.style.transform = '';
            }
        });
    });

    // 簡單的入場 Console 歡迎訊息
    console.log('%c 怪物彈珠工具箱 %c Ready ', 'background: #333; color: #fff; border-radius: 3px 0 0 3px; padding: 2px 5px;', 'background: #4caf50; color: #fff; border-radius: 0 3px 3px 0; padding: 2px 5px;');
});