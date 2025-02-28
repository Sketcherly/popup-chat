const popup_window_id = 'bZYtqtP9';
const popup_parent_window_id = 'bZYtqtP9__parent';

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
    messageItem.innerHTML = `<div class="bZYtqtP9__message-item-text">${text}</div>`;
    return messageItem;
}






function cleanPopup() {
    let popupParentObj = document.getElementsByTagName(popup_parent_window_id);
    if (popupParentObj.length > 0) {
        // 倒序循环删除
        for (let i = popupParentObj.length - 1; i >= 0; i--) {
            popupParentObj[i].parentNode.removeChild(popupParentObj[i]);
        }
    }
}

function createPopupObj(x, y, innerHtml) {
    let popupParentObj = document.createElement(popup_parent_window_id);
    popupParentObj.style.position = 'relative';
    document.body.appendChild(popupParentObj);

    let popupObj = document.createElement(popup_window_id);
    popupObj.innerHTML = innerHtml;
    popupParentObj.appendChild(popupObj);

    let popupWidth = popupObj.offsetWidth;
    let popupHeight = popupObj.offsetHeight;
    popupObj.style.left = calcPopupPositionX(x, popupWidth) + "px";
    popupObj.style.top = calcPopupPositionY(y, popupHeight) + "px";

    return popupObj;
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


            popupObj.querySelector('#bZYtqtP9__btn--translate').addEventListener('click', function () {
                showTranslateModal(mousePositionX, mousePositionY, selectedText);
            });
            popupObj.querySelector('#bZYtqtP9__btn--chat').addEventListener('click', function () {
                showChatModal(mousePositionX, mousePositionY, selectedText);
            });
            popupObj.querySelector('#bZYtqtP9__btn--summarize').addEventListener('click', function () {
                showSummarizeModal(mousePositionX, mousePositionY, selectedText);
            });

            popupObj.querySelector('#bZYtqtP9__btn--setting').setAttribute('href', chrome.runtime.getURL('../pages/setting.html'));

            popupObj.addEventListener('mouseup', function (event) {
                event.stopPropagation(); //阻止冒泡
            })


        }
    });
}

document.addEventListener('mouseup', mouseUpEventHandle);
document.addEventListener('touchend', mouseUpEventHandle);

function showPopup(x, y, selectedText) {
    cleanPopup();

    let popupObj = createPopupObj(x, y, chatWindowHtml);



    let selectedTextChatItemObj = createMessageItem('bZYtqtP9__message-item-right', selectedText);
    selectedTextChatItemObj.querySelector('.bZYtqtP9__message-item-text').setAttribute('style', 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;');
    popupObj.querySelector('#bZYtqtP9__message-list').appendChild(selectedTextChatItemObj);


    popupObj.querySelector('#bZYtqtP9__chat-nav-close').addEventListener('click', function () {
        cleanPopup();
    });
    popupObj.addEventListener('mouseup', function (event) {
        event.stopPropagation(); //阻止冒泡
    });

    return popupObj;
}

function showChatModal(x, y, selectedText) {

    let popupObj = showPopup(x, y, selectedText);
    popupObj.querySelector('#bZYtqtP9__chat-input-area').style.display = 'block';

    popupObj.querySelector('#bZYtqtP9__chat-input-textarea').addEventListener('keydown', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            popupObj.querySelector('#bZYtqtP9__chat-input-btn').click();
        }
    });

    popupObj.querySelector('#bZYtqtP9__chat-input-btn').addEventListener('click', function () {
        let inputText = popupObj.querySelector('#bZYtqtP9__chat-input-textarea').value;
        if (inputText.trim().length == 0) {
            return;
        }

        let messageListObj = popupObj.querySelector('#bZYtqtP9__message-list');

        let selectedTextChatItemObj = createMessageItem('bZYtqtP9__message-item-right', inputText);
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

            if (item.classList.contains('bZYtqtP9__message-item-right')) {
                messageItem.role = 'user';
            } else if (item.classList.contains('bZYtqtP9__message-item-left')) {
                messageItem.role = 'assistant';
            } else {
                messageItem.role = 'system';
            }

            messageItem.content = item.querySelector('.bZYtqtP9__message-item-text').innerText;

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



                    let messageItemTextLoadingHtml = '<span class="bZYtqtP9__message-item-text-loading">&nbsp;</span>';
                    let responseMessageDom = createMessageItem('bZYtqtP9__message-item-left', messageItemTextLoadingHtml);
                    popupObj.querySelector('#bZYtqtP9__message-list').appendChild(responseMessageDom);

                    // 清空输入框
                    popupObj.querySelector('#bZYtqtP9__chat-input-textarea').value = '';

                    scrollMessageList(popupObj);

                    fetchChatMessage(serviceParam_url, serviceParam_key, data, popupObj, responseMessageDom);
                }

            }
        });

    });





}

function showTranslateModal(x, y, selectedText) {
    let promptName = '翻译';
    let promptText = '"You are a highly skilled AI trained in language translation. I would like you to translate the text delimited by triple quotes into Simplified Chinese language. Only give me the output and nothing else. Do not wrap responses in quotes. """ ${input} """"';
    showPromptModal(x, y, selectedText, promptName, promptText);
}

function showSummarizeModal(x, y, selectedText) {

    let promptName = '总结';
    let promptText = 'You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the text delimited by triple quotes and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the Simplified Chinese language. """ ${input} """';

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

    popupObj.querySelector('#bZYtqtP9__chat-nav-title').innerHTML = `<span>${promptName}</span>`;

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
                            "role": "system",
                            "content": promptText
                        },
                        {
                            "role": "user",
                            "content": selectedText
                        }
                    ]
                };

                let messageItemTextLoadingHtml = '<span class="bZYtqtP9__message-item-text-loading">&nbsp;</span>';
                let responseMessageDom = createMessageItem('bZYtqtP9__message-item-left', messageItemTextLoadingHtml);
                popupObj.querySelector('#bZYtqtP9__message-list').appendChild(responseMessageDom);

                scrollMessageList(popupObj);

                fetchChatMessage(serviceParam_url, serviceParam_key, data, popupObj, responseMessageDom);
            }

        }
    });

}

function scrollMessageList(popupObj) {
    let messageListObj = popupObj.querySelector('#bZYtqtP9__message-list');
    messageListObj.scrollTo(0, messageListObj.scrollHeight);
}


function fetchChatMessage(url, key, data, popupObj, responseMessageDom) {
    let messageItemTextLoadingObj = responseMessageDom.querySelector('.bZYtqtP9__message-item-text-loading');

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
                        // responseMessageDom.querySelector('.bZYtqtP9__message-item-text').appendChild(document.createTextNode(content));
                        scrollMessageList(popupObj);

                        popupObj.querySelector('#bZYtqtP9__message-list').scrollTo(0, popupObj.querySelector('#bZYtqtP9__message-list').scrollHeight);

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

function calcPopupPositionY(y, popupHeight) {

    let popupParentObj = document.getElementsByTagName(popup_parent_window_id)[0];
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