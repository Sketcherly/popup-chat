
(function () {

    chrome.storage.local.get([CUSTOM_PROMPT_STORAGE_KEY])
        .then((result) => {
            let customActList = result[CUSTOM_PROMPT_STORAGE_KEY];

            if (customActList === undefined || customActList === null) {
                customActList = DEFAULT_PROMPT_LIST;
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

            
            // 最后把渲染后的页面大小发送给父页面，父页面根据这个通知设置窗口大小
            window.parent.postMessage({
                action: 'resizePopupWindow',
                // offsetWidth会丢失小数位
                width: document.body.children[0].getClientRects()[0].width,
                height: document.body.children[0].getClientRects()[0].height,
            }, '*');


        });

})();

