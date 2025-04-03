const translatePrompt = `# 精准网页翻译（仅输出目标语言）

## 您的身份与专长
您是一位跨文化交流专家级翻译大师，不仅精通多国语言的微妙表达，更深谙各语言文化背景和语境差异。您能在保留原文情感与意图的同时，创造如同目标语言母语者原创的流畅译文。

## 翻译核心任务
将{{from}}语言网页内容转化为完全自然的{{to}}语言，确保译文既忠实原意，又完全符合目标语言的表达习惯、文化背景和语境要求。

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





(function () {

    var query = window.location.search.substring(1);

    setTimeout(() => {
        window.parent.postMessage({
            action: 'resizePopupWindow',
            width: document.body.children[0].offsetWidth,
            height: document.body.children[0].offsetHeight,
        }, '*');
    }, 2);

    chrome.storage.session.get(["selectedText"]).then((result) => {
        console.log("selectedText Value is " + result.selectedText);

        let selectedTextChatItemObj = createMessageItem('message-item-text-right', result.selectedText);
        let messageListObj = document.querySelector('#message-list');
        messageListObj.appendChild(selectedTextChatItemObj);


        sendTranslatePrompt(result.selectedText);

    });


    // console.log(axios);


    // document.querySelector('')

    // 处理文本框自动增高
    document.querySelector('#chat-input-textarea').addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            document.querySelector('#chat-input-send-btn').click();
        }
    });

    function createMessageItem(className, text) {
        let messageItem = document.createElement('div');
        messageItem.classList.add('message-item-text', className);
        messageItem.innerHTML = text;
        return messageItem;
    }

    function sendTranslatePrompt(selectedText) {

        // scrollMessageList(popupObj);
        let from = '英文';
        let to = '简体中文';
        // let text = selectedText;
        let translatePromptText = translatePrompt;
        translatePromptText = translatePromptText.replace('{{from}}', from);
        translatePromptText = translatePromptText.replace('{{to}}', to);
        translatePromptText = translatePromptText.replace('{{text}}', selectedText);


        sendChatMessage('翻译', translatePromptText, null);

    }


    function sendChatMessage(promptName, promptText, systemPromptText) {
        // const inputTextObj = document.querySelector('#chat-input-textarea');

        // let inputText = inputTextObj.value;
        // if (inputText.trim().length == 0) {
        //     return;
        // }

        let messageListObj = document.querySelector('#message-list');

        // let selectedTextChatItemObj = createMessageItem('message-item-text-right', inputText);
        // messageListObj.appendChild(selectedTextChatItemObj);

        let messages = [];

        if (systemPromptText !== null) {
            messages.push({
                "role": "system",
                "content": systemPromptText
            });
        }

        let startIdx = 0;

        if (promptText !== null) {
            messages.push({
                "role": "user",
                "content": promptText
            });
            startIdx = 1;
        }

        for (let i = startIdx; i < messageListObj.children.length; i++) {
            let item = messageListObj.children[i];
            // console.log(item);

            let messageItem = {
                "role": "",
                "content": ""
            }

            if (item.classList.contains('message-item-text-right')) {
                messageItem.role = 'user';
            } else if (item.classList.contains('message-item-text-left')) {
                messageItem.role = 'assistant';
            } else {
                messageItem.role = 'system';
            }

            messageItem.content = item.innerText;

            messages.push(messageItem);
        }

        let messageItemTextLoadingHtml = '<span class="message-item-text-loading">&nbsp;</span>';
        let responseMessageDom = createMessageItem('message-item-text-left', messageItemTextLoadingHtml);
        messageListObj.appendChild(responseMessageDom);

        // 清空输入框
        // inputTextObj.value = '';
        // inputTextObj.style.height = '48px';

        let messageItemTextLoadingObj = responseMessageDom.querySelector('.message-item-text-loading');

        function resolveText(text) {
            messageItemTextLoadingObj.parentElement.insertBefore(document.createTextNode(text), messageItemTextLoadingObj);

            // scrollMessageList(popupObj);

        }

        function resolveDone() {
            messageItemTextLoadingObj.remove();
        }

        new ServiceFactory().createInstance()
            .then(instance => instance.fetch(messages, resolveText, resolveDone));

        // API_PROVIDERS['0'].fetch(messages, resolveText, resolveDone);

        // chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
        //     if (!result.serviceList) {
        //         // do nothing
        //     } else {
        //         serviceList = result.serviceList;
        //     }

        //     try {
        //         result.serviceDefault = parseInt(result.serviceDefault);
        //     } catch (error) {
        //         result.serviceDefault = null;
        //     }

        //     if (serviceList.length > 0 && result.serviceDefault !== null && result.serviceDefault < serviceList.length) {
        //         let serviceDefaultItem = serviceList[result.serviceDefault];
        //         if (serviceDefaultItem) {

        //             let serviceParam_url = serviceDefaultItem.host + '/chat/completions';
        //             let serviceParam_key = serviceDefaultItem.key;
        //             let serviceParam_model = serviceDefaultItem.modelName;



        //             // const url = 'https://openai-api-proxy.dongpo.li/v1/chat/completions';
        //             // const url = 'https://xai-api-proxy.dongpo.li/v1/chat/completions';

        //             let data = {
        //                 // "model": "gpt-4o",
        //                 // "model": "grok-2",
        //                 "model": serviceParam_model,
        //                 "stream": true,
        //                 "messages": messages
        //             };



        //             let messageItemTextLoadingHtml = '<span class="message-item-text-loading">&nbsp;</span>';
        //             let responseMessageDom = createMessageItem('message-item-text-left', messageItemTextLoadingHtml);
        //             messageListObj.appendChild(responseMessageDom);

        //             // 清空输入框
        //             // let inputTextObj = document.querySelector('#chat-input-textarea');
        //             inputTextObj.value = '';
        //             inputTextObj.style.height = '48px';

        //             // scrollMessageList(popupObj);

        //             fetch(serviceParam_url, {
        //                 method: "POST",
        //                 body: JSON.stringify(data),
        //                 headers: {
        //                     "Content-Type": "application/json",
        //                     'Authorization': 'Bearer ' + serviceParam_key,
        //                 }
        //             }).then((response) => {
        //                 const reader = response.body.getReader();
        //                 const decoder = new TextDecoder();

        //                 let responseStreamDone = false;

        //                 while (responseStreamDone) {
        //                     console.log("***********************");
        //                     reader.read().then(({ done, value }) => {

        //                         console.log("***********************", done);
        //                         let responseMessageData = decoder.decode(value);
        //                         console.log(responseMessageData);

        //                         let responseMessageStart = 'data: ';
        //                         let responseMessageEnd = '[DONE]';

        //                         let responseMessageLines = responseMessageData.split('\n');

        //                         for (let i = 0; i < responseMessageLines.length; i++) {
        //                             let responseMessageLine = responseMessageLines[i];

        //                             console.log(responseMessageLine);

        //                             let responseMessage = responseMessageLine.substring(responseMessageStart.length);

        //                             if (responseMessage.startsWith(responseMessageEnd)) {
        //                                 // messageItemTextLoadingObj.remove();
        //                                 console.log("***********************done");
        //                                 responseStreamDone = true;
        //                                 // break;
        //                             }

        //                             if (responseMessage.trim().length === 0) {
        //                                 // messageItemTextLoadingObj.parentElement.insertBefore(document.createTextNode('\n'), messageItemTextLoadingObj);
        //                                 continue;
        //                             }

        //                             // console.log(responseMessage);

        //                             let responseDataObj = JSON.parse(responseMessage);
        //                             // console.log(responseDataObj);

        //                             let content = responseDataObj.choices[0].delta.content;
        //                             if (!!content) {
        //                                 // content = content.replace(/(?:\r\n|\r|\n)/g, '<br>');
        //                                 // messageItemTextLoadingObj.parentElement.insertBefore(document.createTextNode(content), messageItemTextLoadingObj);
        //                                 // responseMessageDom.querySelector('.message-item-text').appendChild(document.createTextNode(content));
        //                                 // scrollMessageList(popupObj);

        //                                 // popupObj.querySelector('#message-list').scrollTo(0, popupObj.querySelector('#message-list').scrollHeight);
        //                                 console.log(content);

        //                             }


        //                         }
        //                     });
        //                     // if (done) {
        //                     //     console.log("***********************done");
        //                     //     console.log(value);
        //                     //     break;
        //                     // }
        //                     // console.log("--------------------value");
        //                     // console.log(value);


        //                 }

        //             });

        //             // const reader = response.body.getReader();
        //             // while (true) {
        //             //     const { done, value } = reader.read();
        //             //     if (done) {
        //             //         console.log("***********************done");
        //             //         console.log(value);
        //             //         break;
        //             //     }
        //             //     console.log("--------------------value");
        //             //     console.log(value);
        //             // }

        //             // fetchChatMessage(serviceParam_url, serviceParam_key, data, popupObj, responseMessageDom);
        //         }

        //     }
        // });
    }


    document.querySelector('#chat-input-send-btn').addEventListener('click', sendChatMessage);
    // document.querySelector('#chat-input-textarea').addEventListener('keydown', function (event) {
    //     if (event.key === 'Enter' && !event.shiftKey) {
    //         event.preventDefault();
    //         sendChatMessage();
    //     }
    // });





})();
