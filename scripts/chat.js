class MessageHistoryStorage {

    constructor() {

        this.messageHistoryKey = 'message-history';
        // this.storageInstance = chrome.storage.session.get(['message-history']);
    }

    clear() {
        let obj = {};
        obj[this.messageHistoryKey] = [];
        chrome.storage.session.set(obj);
    }

    /**
     * 
     * @param {*} messageItem {'role': '', 'content': ''}
     */
    append(messageItem) {

        this.getList()
            .then((messageHistory) => {
                messageHistory.push(messageItem);
                return messageHistory;
            })
            .then((messageHistory) => {
                const obj = {};
                obj[this.messageHistoryKey] = messageHistory;
                chrome.storage.session.set(obj);
            });;
    }

    getList() {

        return chrome.storage.session.get([this.messageHistoryKey])
            .then((result) => {
                let messageHistory = result[this.messageHistoryKey];
                if (messageHistory == null) {
                    messageHistory = [];
                }
                return messageHistory;
            });
    }
}




(function () {

    // var query = window.location.search.substring(1);

    document.addEventListener("DOMContentLoaded", function() {
        window.parent.postMessage({
            action: 'resizePopupWindow',
            width: document.body.children[0].offsetWidth,
            height: document.body.children[0].offsetHeight,
        }, '*');
    });

    function scrollMessageList(messageListObj) {
        // 滚动到底部
        messageListObj.scrollTo(0, messageListObj.scrollHeight);
    }

    chrome.storage.session.get(['selected-text']).then((result) => {
        let selectedText = result['selected-text'];

        console.log("selectedText Value is " + selectedText);

        let selectedTextChatItemObj = createMessageItem('message-item-text-right', selectedText);
        let messageListObj = document.querySelector('#message-list');
        messageListObj.appendChild(selectedTextChatItemObj);

        var query = window.location.search.substring(1);
        console.log("query Value is " + query);

        let messageHistoryStorage = new MessageHistoryStorage();
        messageHistoryStorage.clear();

        if (query.indexOf('act=translate') == 0) {
            resolveTranslatePrompt(selectedText);
        }
        if (query.indexOf('act=summarize') == 0) {
            resolveSummarizePrompt(selectedText);
        }
        if (query.indexOf('act=chat') == 0) {
            resolveChatPrompt(selectedText);
        }

    });


    function createMessageItem(className, text) {
        let messageItem = document.createElement('div');
        messageItem.classList.add('message-item-text', className);
        messageItem.innerHTML = text;
        return messageItem;
    }


    function createAndResolveRequest(messages) {
        let messageListObj = document.querySelector('#message-list');

        let messageItemTextLoadingHtml = '<span class="message-item-text-loading">&nbsp;</span>';
        let responseMessageDom = createMessageItem('message-item-text-left', messageItemTextLoadingHtml);
        messageListObj.appendChild(responseMessageDom);

        scrollMessageList(messageListObj);

        let messageItemTextLoadingObj = responseMessageDom.querySelector('.message-item-text-loading');

        function resolveText(text) {
            messageItemTextLoadingObj.parentElement.insertBefore(document.createTextNode(text), messageItemTextLoadingObj);

            // scrollMessageList(popupObj);

        }

        function resolveDone(responseBody) {
            messageItemTextLoadingObj.remove();

            let messageHistoryStorage = new MessageHistoryStorage();
            messageHistoryStorage.append({
                "role": "assistant",
                "content": responseBody
            });

        }

        new ServiceFactory().createInstance()
            .then(instance => instance.fetch(messages, resolveText, resolveDone));

    }

    function resolveTranslatePrompt(selectedText) {

        const translatePromptTextKey = 'translate-prompt-text';
        const translateToKey = 'translate-to';

        chrome.storage.local.get([translatePromptTextKey, translateToKey])
            .then((result) => {
                let promptText = result[translatePromptTextKey];
                let to = result[translateToKey];

                // console.log(promptText);

                promptText = promptText.replace('{{to}}', to);
                promptText = promptText.replace('{{text}}', selectedText);


                let messages = [
                    {
                        "role": "user",
                        "content": promptText
                    }
                ];

                createAndResolveRequest(messages);

            });

    }

    function resolveSummarizePrompt(selectedText) {
        const summarizePromptTextKey = 'summarize-prompt-text';

        chrome.storage.local.get([summarizePromptTextKey])
            .then((result) => {
                let promptText = result[summarizePromptTextKey];
                // console.log(promptText);
                promptText = promptText.replace('{{text}}', selectedText);

                let messages = [
                    {
                        "role": "user",
                        "content": promptText
                    }
                ];
        
                createAndResolveRequest(messages);
            });

    }

    function resolveChatPrompt(selectedText) {
        const systemPromptText = `You are a helpful assistant...`;


        let messages = [
            {
                "role": "system",
                "content": systemPromptText
            },
            {
                "role": "user",
                "content": selectedText
            }
        ];

        // createAndResolveRequest(message);
        initChatPopup(messages);
    }

    function initChatPopup(messages) {
        // 展示输入框
        let chatInputObj = document.querySelector('#chat-input');
        chatInputObj.style = '';

        // 让输入框获取焦点
        const textarea = chatInputObj.querySelector('#chat-input-textarea');

        setTimeout(() => {
            // 不延时的话页面会跳到顶部
            textarea.value = '';
            textarea.focus();
        }, 50);

        // 让输入框高度自适应
        textarea.addEventListener('input', function () {
            textarea.style.height = 'auto'; // Reset height to shrink if text is deleted
            let newHeight = textarea.scrollHeight;
            const maxHeight = 48; // Must match CSS max-height

            if (newHeight > maxHeight) {
                newHeight = maxHeight;
                textarea.style.overflowY = 'auto'; // Ensure scrollbar appears if needed
            } else {
                textarea.style.overflowY = 'hidden'; // Hide scrollbar if below max height
            }
            // Only set height if it's different from initial to prevent jumpiness
            if (textarea.value === '') {
                textarea.style.height = 'auto'; // Let CSS min-height take over
            } else {
                textarea.style.height = `${newHeight}px`;
            }

        });

        function sendChatMessage() {
            let inputText = textarea.value;
            if (inputText.trim().length == 0) {
                return;
            }

            // 获取历史记录中的消息
            let messageHistoryStorage = new MessageHistoryStorage();
            messageHistoryStorage.getList()
                .then((messageHistory) => {
                    // 先获取历史消息
                    // console.log(messageHistory);

                    // 添加到请求体中
                    for (let i = 0; i < messageHistory.length; i++) {
                        let messageItem = messageHistory[i];
                        messages.push(messageItem);
                    }

                    const messageItem = {
                        "role": "user",
                        "content": inputText
                    };

                    messages.push(messageItem);
                    // 保存消息到历史记录
                    messageHistoryStorage.append(messageItem);

                    // 发送请求
                    createAndResolveRequest(messages);


                });



            let userInputMessageItem = createMessageItem('message-item-text-right', inputText);
            let messageListObj = document.querySelector('#message-list');
            messageListObj.appendChild(userInputMessageItem);

            scrollMessageList(messageListObj);



            // 清空输入框
            textarea.value = '';
            textarea.focus();

        }


        // 发送事件绑定
        textarea.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendChatMessage();
            }
        });
        chatInputObj.querySelector('#chat-input-send-btn').addEventListener('click', sendChatMessage);

    }

})();
