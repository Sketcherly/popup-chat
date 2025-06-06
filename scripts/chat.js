class MessageHistoryStorage {

    constructor() {
        this.messageHistoryKey = 'message-history';
    }

    clear() {
        chrome.storage.session.set({ [this.messageHistoryKey]: [] });
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
                chrome.storage.session.set({ [this.messageHistoryKey]: messageHistory });
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

        // 等页面加载完之后通知父窗口弹窗的大小
        setTimeout(() => {
            // 一次可能会不保险
            setTimeout(() => {
                setTimeout(() => {
                    window.parent.postMessage({
                        action: 'resizePopupWindow',
                        width: document.body.children[0].getClientRects()[0].width,
                        height: document.body.children[0].getClientRects()[0].height,
                    }, '*');
                }, 10);
            }, 10);
        }, 10);
    });

    function scrollMessageList(messageListObj) {
        // 滚动到底部
        messageListObj.scrollTo(0, messageListObj.scrollHeight);
    }

    chrome.storage.session.get(['selected-text']).then((result) => {
        let selectedText = result['selected-text'];

        // console.log("selectedText Value is " + selectedText);

        let selectedTextChatItemObj = createMessageItem('message-item-text-right', selectedText);
        let messageListObj = document.querySelector('#message-list');
        messageListObj.appendChild(selectedTextChatItemObj);

        var query = window.location.search.substring(1);
        console.log("query Value is " + query);

        let messageHistoryStorage = new MessageHistoryStorage();
        messageHistoryStorage.clear();

        // if (query.indexOf('act=translate') == 0) {
        //     resolveTranslatePrompt(selectedText);
        // }
        // if (query.indexOf('act=summarize') == 0) {
        //     resolveSummarizePrompt(selectedText);
        // }
        if (query.indexOf('act=chat') == 0) {
            resolveChatPrompt(selectedText);
        }
        if (query.indexOf('act=idx_') == 0) {
            let idx = query.substring(8);
            // console.log(idx);
            chrome.storage.local.get([CUSTOM_PROMPT_STORAGE_KEY])
                .then((result) => {
                    let customActList = result[CUSTOM_PROMPT_STORAGE_KEY];

                    if (customActList === undefined || customActList === null) {
                        customActList = DEFAULT_PROMPT_LIST;
                    }

                    let promptOpt = customActList[idx];
                    // console.log(promptOpt);
                    resolveCustomPrompt(promptOpt, selectedText);
                });
        }

    });


    function createMessageItem(className, text) {
        // 兼容旧的类名，同时创建新的消息结构
        if (className === 'message-item-text-right') {
            return createNewMessageItem('sent', '我', text);
        } else if (className === 'message-item-text-left') {
            return createNewMessageItem('received', 'AI', text);
        } else {
            // 保持旧的结构以兼容现有代码
            let messageItem = document.createElement('div');
            messageItem.classList.add('message-item-text', className);
            messageItem.innerHTML = text;
            return messageItem;
        }
    }

    function createNewMessageItem(type, sender, text) {
        // 创建符合1.html样式的消息结构
        let messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);

        let senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = sender;

        let bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('message-bubble');
        bubbleDiv.innerHTML = text;

        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(bubbleDiv);

        return messageDiv;
    }


    function createAndResolveRequest(messages) {
        let messageListObj = document.querySelector('#message-list');

        let messageItemTextLoadingHtml = '<span class="message-item-text-loading">&nbsp;</span>';
        let responseMessageDom = createMessageItem('message-item-text-left', messageItemTextLoadingHtml);
        messageListObj.appendChild(responseMessageDom);

        scrollMessageList(messageListObj);

        let messageItemTextLoadingObj = responseMessageDom.querySelector('.message-item-text-loading');
        let messageBubble = responseMessageDom.querySelector('.message-bubble') || responseMessageDom;

        function resolveText(text) {
            if (messageItemTextLoadingObj) {
                messageBubble.insertBefore(document.createTextNode(text), messageItemTextLoadingObj);
            } else {
                messageBubble.appendChild(document.createTextNode(text));
            }

            // scrollMessageList(popupObj);

        }

        function resolveDone(responseBody) {
            if (messageItemTextLoadingObj) {
                messageItemTextLoadingObj.remove();
            }

            let messageHistoryStorage = new MessageHistoryStorage();
            messageHistoryStorage.append({
                "role": "assistant",
                "content": responseBody
            });

        }

        new ServiceFactory().createInstance()
            .then(instance => instance.fetch(messages, resolveText, resolveDone));

    }

    function resolveCustomPrompt(promptOpt, selectedText) {

        let promptText = promptOpt.promptText;
        promptText = promptText.replace('{{text}}', selectedText);

        let messages = [
            {
                "role": "user",
                "content": promptText
            }
        ];

        createAndResolveRequest(messages);


    }

    // function resolveTranslatePrompt(selectedText) {

    //     const translatePromptTextKey = 'translate-prompt-text';
    //     const translateToKey = 'translate-to';

    //     chrome.storage.local.get([translatePromptTextKey, translateToKey])
    //         .then((result) => {
    //             let promptText = result[translatePromptTextKey];
    //             let to = result[translateToKey];

    //             // console.log(promptText);

    //             promptText = promptText.replace('{{to}}', to);
    //             promptText = promptText.replace('{{text}}', selectedText);


    //             let messages = [
    //                 {
    //                     "role": "user",
    //                     "content": promptText
    //                 }
    //             ];

    //             createAndResolveRequest(messages);

    //         });

    // }

    // function resolveSummarizePrompt(selectedText) {
    //     const summarizePromptTextKey = 'summarize-prompt-text';

    //     chrome.storage.local.get([summarizePromptTextKey])
    //         .then((result) => {
    //             let promptText = result[summarizePromptTextKey];
    //             // console.log(promptText);
    //             promptText = promptText.replace('{{text}}', selectedText);

    //             let messages = [
    //                 {
    //                     "role": "user",
    //                     "content": promptText
    //                 }
    //             ];
        
    //             createAndResolveRequest(messages);
    //         });

    // }

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
        const inputElement = chatInputObj.querySelector('#chat-input-textarea');

        setTimeout(() => {
            // 不延时的话页面会跳到顶部
            inputElement.value = '';
            inputElement.focus();
        }, 50);

        // 普通input不需要高度自适应逻辑

        function sendChatMessage() {
            let inputText = inputElement.value;
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
            inputElement.value = '';
            inputElement.focus();

        }


        // 发送事件绑定
        inputElement.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendChatMessage();
            }
        });
        chatInputObj.querySelector('#chat-input-send-btn').addEventListener('click', sendChatMessage);

    }

})();
