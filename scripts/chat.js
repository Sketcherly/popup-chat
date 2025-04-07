const translatePrompt = `# 精准网页翻译（仅输出目标语言）

## 您的身份与专长
您是一位跨文化交流专家级翻译大师，不仅精通多国语言的微妙表达，更深谙各语言文化背景和语境差异。您能在保留原文情感与意图的同时，创造如同目标语言母语者原创的流畅译文。

## 翻译核心任务
将待翻译内容转化为完全自然的{{to}}语言，确保译文既忠实原意，又完全符合目标语言的表达习惯、文化背景和语境要求。

## ⚠️ 输出规范（绝对遵守）
**只输出译文本身**，不添加任何说明、注释、标记或原文。译文应读起来毫无翻译痕迹，如同目标语言原生内容。

## 翻译质量标准
1. **极致地道化**：使用目标语言母语者日常真实使用的表达，完全消除翻译腔
2. **情感精准映射**：捕捉并完美重现原文的情感基调、语气变化和态度倾向
3. **文化本土适应**：灵活运用目标语言特有的俚语、成语和文化表达方式
4. **结构自然重组**：根据目标语言习惯重构句式和表达逻辑，而非生硬保留原文结构
5. **意图优先传递**：理解原文深层意图，用最自然的目标语言方式表达核心信息

## 针对中文翻译的精细指导
当目标语言为中文时：
- **口语化表达**：采用"爱不释手"、"压榨价值"等真实日常用语，避免书面化
- **情感真实性**：以略微非正式的语气，自然传递原文的热情和真诚赞赏之情
- **汉语特色修辞**：适当融入四字成语、歇后语和中文特有修辞手法
- **中式语序重构**：彻底调整为符合中文思维的表达顺序，消除外语句法痕迹
- **生活化措辞**：使用"真心好用"、"忍不住安利"等现代中国人日常社交表达

## 待翻译内容
{{text}}

【注意：请直接呈现完美译文，不要包含任何其他内容】`;





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

    setTimeout(() => {
        window.parent.postMessage({
            action: 'resizePopupWindow',
            width: document.body.children[0].offsetWidth,
            height: document.body.children[0].offsetHeight,
        }, '*');
    }, 2);

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
        let to = '简体中文';
        let translatePromptText = translatePrompt;
        translatePromptText = translatePromptText.replace('{{to}}', to);
        translatePromptText = translatePromptText.replace('{{text}}', selectedText);

        let messages = [
            {
                "role": "user",
                "content": translatePromptText
            }
        ];

        createAndResolveRequest(messages);
    }

    function resolveSummarizePrompt(selectedText) {
        const promptText = `You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the text delimited by triple quotes and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the Simplified Chinese language. """ ${selectedText} """`;


        let messages = [
            {
                "role": "user",
                "content": promptText
            }
        ];

        createAndResolveRequest(messages);
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
                    console.log(messageHistory);

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
