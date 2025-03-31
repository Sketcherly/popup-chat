const popup_window_id = 'bZYtqtP9';

function extensionFileRead(file, fun) {
    fetch(chrome.runtime.getURL(file))
        .then(response => response.text())
        .then(data => {
            fun(data);
        });
}

let menuBtnHtml = '';
extensionFileRead('../pages/btn.html', function (data) {
    menuBtnHtml = data;
});


let chatWindowHtml = '';
extensionFileRead('../pages/chat.html', function (data) {
    chatWindowHtml = data;
});

// 临时记录鼠标的位置
let _mousePositionX = 0;
let _mousePositionY = 0;
// 记录一下划词的时候的鼠标的位置
let mousePositionX = 0;
let mousePositionY = 0;

document.addEventListener('mousemove', function (event) {
    // 获取光标的 X 和 Y 坐标  
    var x = event.clientX;
    var y = event.clientY;

    _mousePositionX = x;
    _mousePositionY = y;

});

function createMessageItem(className, text) {
    let messageItem = document.createElement('div');
    messageItem.setAttribute('class', className);
    messageItem.innerHTML = `<div class="message-item-text">${text}</div>`;
    return messageItem;
}






function cleanPopup() {
    // 防止有bug导致的没有清除所以清除的时候循环一下删除所有的
    while (true) {
        let popupObj = document.getElementById(popup_window_id);
        if (popupObj) {
            popupObj.parentNode.removeChild(popupObj);
        } else {
            break;
        }
    }
}

function createPopupObj(x, y, innerHtml, init) {
    // 先搞一个根节点，这个元素因为是最后放的所以应该是在body的最下边，稍后根据这个元素来定位
    let popupParentObj = document.createElement('div');
    popupParentObj.setAttribute('id', popup_window_id);
    popupParentObj.style.position = 'relative';
    document.body.appendChild(popupParentObj);

    let popupParentShadow = popupParentObj.attachShadow({ mode: 'closed' });

    popupParentShadow.innerHTML = `
<style>
:root {
    --bs-border-radius: 0.375rem;
    --bs-border-radius-sm: 0.25rem;
}
</style>
<link rel="stylesheet" href="${chrome.runtime.getURL('../css/style.css')}">
<link rel="stylesheet" href="${chrome.runtime.getURL('../bootstrap-5.3.3/css/bootstrap.min.css')}">
<${popup_window_id}>
</${popup_window_id}>
<script src="${chrome.runtime.getURL('../bootstrap-5.3.3/js/bootstrap.bundle.min.js')}"></script>`


    let popupObj = popupParentShadow.querySelector(popup_window_id);
    popupObj.style.visibility = 'hidden';
    popupObj.innerHTML = innerHtml;


    if (init) {
        init(popupObj);
    }

    setTimeout(() => {
        let popupWidth = popupObj.offsetWidth;
        let popupHeight = popupObj.offsetHeight;
        popupObj.style.left = calcPopupPositionX(x, popupWidth) + "px";
        popupObj.style.top = calcPopupPositionY(y, popupHeight, popupParentObj) + "px";
        popupObj.style.visibility = 'visible';
    }, 50);


    return popupParentShadow;
}

const mouseUpEventHandle = (event) => {

    cleanPopup();

    setTimeout(() => {
        var selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 0) {

            // 选中的是文本框中的内容的话不弹窗
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return
            }

            mousePositionX = _mousePositionX;
            mousePositionY = _mousePositionY;

            // 展示弹窗
            let popupObj = createPopupObj(mousePositionX, mousePositionY, menuBtnHtml);


            popupObj.querySelector('#btn--translate').addEventListener('click', function () {
                showTranslateModal(mousePositionX, mousePositionY, selectedText);
            });
            popupObj.querySelector('#btn--chat').addEventListener('click', function () {
                showChatModal(mousePositionX, mousePositionY, selectedText);
            });
            popupObj.querySelector('#btn--summarize').addEventListener('click', function () {
                showSummarizeModal(mousePositionX, mousePositionY, selectedText);
            });
            popupObj.querySelector('#btn--setting').addEventListener('click', function () {
                window.open(chrome.runtime.getURL('../pages/setting.html'));
            });

            popupObj.querySelector('#btn--setting').setAttribute('href', chrome.runtime.getURL('../pages/setting.html'));

            popupObj.addEventListener('mouseup', function (event) {
                event.stopPropagation(); //阻止冒泡
            })


        }
    });
}

document.addEventListener('mouseup', mouseUpEventHandle);
document.addEventListener('touchend', mouseUpEventHandle);

function showPopup(x, y, selectedText, init) {

    cleanPopup();

    let popupObj = createPopupObj(x, y, chatWindowHtml, init);



    let selectedTextChatItemObj = createMessageItem('message-item-right', selectedText);
    selectedTextChatItemObj.querySelector('.message-item-text').setAttribute('style', 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;');
    popupObj.querySelector('#message-list').appendChild(selectedTextChatItemObj);


    popupObj.querySelector('#chat-nav-close').addEventListener('click', function () {
        cleanPopup();
    });
    popupObj.addEventListener('mouseup', function (event) {
        event.stopPropagation(); //阻止冒泡
    });

    return popupObj;
}

function showChatModal(x, y, selectedText) {
    let promptName = '聊天';

    let popupObj = showPopup(x, y, selectedText, function (_popupObj) {
        _popupObj.querySelector('#chat-input-area').style.display = 'block';
        _popupObj.querySelector('#chat-nav-title').innerHTML = `<span>${promptName}</span>`;
    });

    popupObj.querySelector('#chat-input-textarea').addEventListener('keydown', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            popupObj.querySelector('#chat-input-btn').click();
        }
    });

    popupObj.querySelector('#chat-input-btn').addEventListener('click', function () {
        let inputText = popupObj.querySelector('#chat-input-textarea').value;
        if (inputText.trim().length == 0) {
            return;
        }

        let messageListObj = popupObj.querySelector('#message-list');

        let selectedTextChatItemObj = createMessageItem('message-item-right', inputText);
        messageListObj.appendChild(selectedTextChatItemObj);

        let messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant..."
            }
        ];

        for (let i = 0; i < messageListObj.children.length; i++) {
            let item = messageListObj.children[i];
            console.log(item);

            let messageItem = {
                "role": "",
                "content": ""
            }

            if (item.classList.contains('message-item-right')) {
                messageItem.role = 'user';
            } else if (item.classList.contains('message-item-left')) {
                messageItem.role = 'assistant';
            } else {
                messageItem.role = 'system';
            }

            messageItem.content = item.querySelector('.message-item-text').innerText;

            messages.push(messageItem);
        }

        chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
            if (!result.serviceList) {
                // do nothing
            } else {
                serviceList = JSON.parse(result.serviceList);
            }

            try {
                result.serviceDefault = parseInt(result.serviceDefault);
            } catch (error) {
                result.serviceDefault = null;
            }

            if (serviceList.length > 0 && result.serviceDefault !== null && result.serviceDefault < serviceList.length) {
                let serviceDefaultItem = serviceList[result.serviceDefault];
                if (serviceDefaultItem) {

                    let serviceParam_url = serviceDefaultItem.host + '/v1/chat/completions';
                    let serviceParam_key = serviceDefaultItem.key;
                    let serviceParam_model = serviceDefaultItem.modelName;



                    // const url = 'https://openai-api-proxy.dongpo.li/v1/chat/completions';
                    // const url = 'https://xai-api-proxy.dongpo.li/v1/chat/completions';

                    let data = {
                        // "model": "gpt-4o",
                        // "model": "grok-2",
                        "model": serviceParam_model,
                        "stream": true,
                        "messages": messages
                    };



                    let messageItemTextLoadingHtml = '<span class="message-item-text-loading">&nbsp;</span>';
                    let responseMessageDom = createMessageItem('message-item-left', messageItemTextLoadingHtml);
                    popupObj.querySelector('#message-list').appendChild(responseMessageDom);

                    // 清空输入框
                    popupObj.querySelector('#chat-input-textarea').value = '';

                    scrollMessageList(popupObj);

                    fetchChatMessage(serviceParam_url, serviceParam_key, data, popupObj, responseMessageDom);
                }

            }
        });

    });





}

function showTranslateModal(x, y, selectedText) {
    let promptName = '翻译';
    // let promptText = '"You are a highly skilled AI trained in language translation. I would like you to translate the text delimited by triple quotes into Simplified Chinese language. Only give me the output and nothing else. Do not wrap responses in quotes. """ ${input} """"';

    /**
     * # 精准网页翻译（仅输出目标语言）

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

## 上下文智能应用
高效利用所提供的上下文信息：
- {{title_prompt}}：理解内容主题和写作意图
- {{summary_prompt}}：把握整体背景和核心信息
- {{terms_prompt}}：确保专业术语准确统一翻译

## 待翻译内容
{{text}}

【注意：请直接呈现完美译文，不要包含任何其他内容】
     */

    let promptText = `# 精准网页翻译（仅输出目标语言）

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

    let from = '英文';
    let to = '简体中文';
    let text = selectedText;
    promptText = promptText.replace('{{from}}', from);
    promptText = promptText.replace('{{to}}', to);
    promptText = promptText.replace('{{text}}', text);


    showPromptModal(x, y, selectedText, promptName, promptText);
}

function showSummarizeModal(x, y, selectedText) {

    let promptName = '总结';
    let promptText = `You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the text delimited by triple quotes and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the Simplified Chinese language. """ ${selectedText} """`;

    showPromptModal(x, y, selectedText, promptName, promptText);

}

/**
 * 
 * @param {*} x 选中的时候，鼠标的位置，x轴
 * @param {*} y 选中的时候，鼠标的位置，y轴
 * @param {*} selectedText 选中的文本
 * @param {*} promptName 提示词的名称，显示在弹窗左上角标题的位置
 * @param {*} promptText 提示词
 */
function showPromptModal(x, y, selectedText, promptName, promptText) {

    let popupObj = showPopup(x, y, selectedText);

    popupObj.querySelector('#chat-nav-title').innerHTML = `<span>${promptName}</span>`;

    chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
        if (!result.serviceList) {
            // do nothing
        } else {
            serviceList = JSON.parse(result.serviceList);
        }

        try {
            result.serviceDefault = parseInt(result.serviceDefault);
        } catch (error) {
            result.serviceDefault = null;
        }

        if (serviceList.length > 0 && result.serviceDefault !== null && result.serviceDefault < serviceList.length) {
            let serviceDefaultItem = serviceList[result.serviceDefault];
            if (serviceDefaultItem) {

                let serviceParam_url = serviceDefaultItem.host + '/v1/chat/completions';
                let serviceParam_key = serviceDefaultItem.key;
                let serviceParam_model = serviceDefaultItem.modelName;



                let data = {
                    "model": serviceParam_model,
                    "stream": true,
                    "messages": [
                        {
                            "role": "user",
                            "content": promptText
                        }
                    ]
                };

                let messageItemTextLoadingHtml = '<span class="message-item-text-loading">&nbsp;</span>';
                let responseMessageDom = createMessageItem('message-item-left', messageItemTextLoadingHtml);
                popupObj.querySelector('#message-list').appendChild(responseMessageDom);

                scrollMessageList(popupObj);

                fetchChatMessage(serviceParam_url, serviceParam_key, data, popupObj, responseMessageDom);
            }

        }
    });

}

function scrollMessageList(popupObj) {
    let messageListObj = popupObj.querySelector('#message-list');
    messageListObj.scrollTo(0, messageListObj.scrollHeight);
}


function fetchChatMessage(url, key, data, popupObj, responseMessageDom) {
    let messageItemTextLoadingObj = responseMessageDom.querySelector('.message-item-text-loading');

    // fetch(url, {
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + key,
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();


            // done 为数据是否接收完成 boolean 值
            // value 为接收到的数据, Uint8Array 格式
            return reader.read().then(function processMessage({ done, value }) {

                let responseMessageData = decoder.decode(value);

                let responseMessageStart = 'data: ';
                let responseMessageEnd = '[DONE]';

                let responseMessageLines = responseMessageData.split('\n');

                for (let i = 0; i < responseMessageLines.length; i++) {
                    let responseMessageLine = responseMessageLines[i];

                    let responseMessage = responseMessageLine.substring(responseMessageStart.length);

                    if (responseMessage.startsWith(responseMessageEnd)) {
                        messageItemTextLoadingObj.remove();
                        return;
                    }

                    if (responseMessage.trim().length === 0) {
                        // messageItemTextLoadingObj.parentElement.insertBefore(document.createTextNode('\n'), messageItemTextLoadingObj);
                        continue;
                    }

                    // console.log(responseMessage);

                    let responseDataObj = JSON.parse(responseMessage);
                    // console.log(responseDataObj);

                    let content = responseDataObj.choices[0].delta.content;
                    if (!!content) {
                        // content = content.replace(/(?:\r\n|\r|\n)/g, '<br>');
                        messageItemTextLoadingObj.parentElement.insertBefore(document.createTextNode(content), messageItemTextLoadingObj);
                        // responseMessageDom.querySelector('.message-item-text').appendChild(document.createTextNode(content));
                        scrollMessageList(popupObj);

                        popupObj.querySelector('#message-list').scrollTo(0, popupObj.querySelector('#message-list').scrollHeight);

                    }


                }

                return reader.read().then(processMessage);
            });
        });
}


function calcPopupPositionX(x, popupWidth) {

    // 可视区域左边缘
    let windowLeft = 0;
    // 可视区域右边缘
    let windowRight = window.innerWidth;

    // 如果是贴边的话，距离边缘一点距离
    let offsetX = 12;

    let left = x - popupWidth / 2;

    if (left + popupWidth > windowRight) {
        left = windowRight - popupWidth - offsetX;
    }
    if (left < 0) {
        left = windowLeft + offsetX;
    }

    return left;

}

function calcPopupPositionY(y, popupHeight, popupParentObj) {

    // let popupParentObj = document.getElementsByTagName(popup_window_id)[0];
    // console.log("===>" + popupParentObj.offsetTop)
    // console.log("===>" + window.scrollY)

    // 可视区域上边缘
    let windowTop = -popupParentObj.offsetTop + window.scrollY;
    // 可视区域下边缘
    let windowBottom = windowTop + window.innerHeight;
    

    // 先根据父容器计算计算位置，这个位置是接下来弹窗的上边缘的中心位置
    // 因为是相对相对于页面最下边的位置，所以应该是个负值
    let top = -popupParentObj.offsetTop + window.scrollY + y;

    // 窗口在纵向的时候，和鼠标的位置偏移一段距离，否则非常容易误操作到弹窗
    let offsetY = 12;
    // 先无脑往下移动20px，防止直接出现在光标下边可以直接点到
    top = top + offsetY;

    // 如果弹窗的下边缘超出了页面的最下边，在页面的最下边显示
    if (top + popupHeight > windowBottom) {
        top = windowBottom - popupHeight - offsetY;
    }
    // 如果弹窗的上边缘超出了页面的最上边，在页面的最上边显示
    if (top < windowTop) {
        top = windowTop + offsetY;
    }

    return top;
}