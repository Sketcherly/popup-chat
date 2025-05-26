
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

