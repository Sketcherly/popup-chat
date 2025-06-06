
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
                btn.innerHTML = item.icon;

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
            chatBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat" viewBox="0 0 16 16">
  <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
</svg>`;
            chatBtn.addEventListener('click', function () {
                window.parent.postMessage({
                    action: 'navTo',
                    page: 'pages/chat.html?act=chat',
                }, '*');
            });
            document.body.children[0].appendChild(chatBtn);


            // 设置按钮
            let settingBtn = document.createElement('button');
            settingBtn.setAttribute('type', 'button');
            settingBtn.setAttribute('class', 'btn btn-primary');
            settingBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
</svg>`;
            settingBtn.addEventListener('click', function () {
                window.open(chrome.runtime.getURL('../pages/setting.html'));
            });
            document.body.children[0].appendChild(settingBtn);

            // 等页面加载完之后通知父窗口弹窗的大小
            setTimeout(() => {
                // 一次可能会不保险
                setTimeout(() => {
                    window.parent.postMessage({
                        action: 'resizePopupWindow',
                        // offsetWidth会丢失小数位
                        width: document.body.children[0].getClientRects()[0].width,
                        height: document.body.children[0].getClientRects()[0].height,
                    }, '*');
                }, 100);
            }, 0);

        });

})();

