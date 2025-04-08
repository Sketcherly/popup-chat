
(function () {

    chrome.storage.local.get([CUSTOM_ACT_STORAGE_KEY])
        .then((result) => {
            let customActList = result[CUSTOM_ACT_STORAGE_KEY];

            if (customActList === undefined || customActList === null) {
                customActList = DEFAULT_ACT_LIST;
            }

            for (let i = 0; i < customActList.length; i++) {
                let item = customActList[i];
                let btn = document.createElement('button');
                btn.setAttribute('type', 'button');
                btn.setAttribute('class', 'btn btn-primary');
                btn.innerText = item.title;
        
                btn.addEventListener('click', function () {
                    window.parent.postMessage({
                        action: 'navTo',
                        page: 'pages/chat.html?act=idx_' + i,
                    }, '*');
                });
        
                document.body.children[0].appendChild(btn);
            }

            // 对话按钮
            let chatBtn = document.createElement('button');
            chatBtn.setAttribute('type', 'button');
            chatBtn.setAttribute('class', 'btn btn-primary');
            chatBtn.innerText = '对话';
            chatBtn.addEventListener('click', function () {
                window.parent.postMessage({
                    action: 'navTo',
                    page: 'pages/chat.html?act=chat',
                }, '*');
            });
            document.body.children[0].appendChild(chatBtn);

            // 设置按钮单独加
            let settingBtn = document.createElement('button');
            settingBtn.setAttribute('type', 'button');
            settingBtn.setAttribute('class', 'btn btn-primary');
            settingBtn.innerText = '设置';
            settingBtn.addEventListener('click', function () {
                window.open(chrome.runtime.getURL('../pages/setting.html'));
            });
            document.body.children[0].appendChild(settingBtn);

            
            window.parent.postMessage({
                action: 'resizePopupWindow',
                // 有时候宽度实际是一个小数，但是这个方法只能得到整数宽度，小数部分丢失了，
                // 所以+1防止因为宽度不够导致的变形，变形非常明显但是加一像素不明显
                width: document.body.children[0].offsetWidth + 1,
                height: document.body.children[0].offsetHeight,
            }, '*');
            // setTimeout(() => {
                
            // }, 100000);


            // 最后把渲染后的页面大小发送给父页面，父页面根据这个通知设置窗口大小
        });

        // window.addEventListener('onsize', function () {
        //     console.log("resize");
        //     window.parent.postMessage({
        //         action: 'resizePopupWindow',
        //         width: document.body.children[0].offsetWidth,
        //         height: document.body.children[0].offsetHeight,
        //     }, '*');
        // });
        
        // document.addEventListener("DOMContentLoaded", function () {

        //     console.log("DOMContentLoaded");

        //     window.parent.postMessage({
        //         action: 'resizePopupWindow',
        //         width: document.body.children[0].offsetWidth,
        //         height: document.body.children[0].offsetHeight,
        //     }, '*');
        // });

})();

