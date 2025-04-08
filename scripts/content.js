// 一个随机字符串当唯一标识符，防止与页面中的其他元素冲突
const popup_window_id = 'wUkq6dYT-l1FNJ3Ne';

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

// 临时记录鼠标的位置，这个随时跟随鼠标移动变化
let _mousePositionX = 0;
let _mousePositionY = 0;
// 记录一下划词的时候的鼠标的位置，跟上边的区别是划词结束之后就固定了，稍后使用最多的也是这个
let mousePositionX = 0;
let mousePositionY = 0;

document.addEventListener('mousemove', function (event) {
    // 获取光标的 X 和 Y 坐标  
    var x = event.clientX;
    var y = event.clientY;

    _mousePositionX = x;
    _mousePositionY = y;

});


function cleanPopup() {
    // 防止有bug导致的没有清除所以清除的时候循环一下删除所有的
    document.querySelectorAll(popup_window_id).forEach(function (popupObj) {
        popupObj.parentNode.removeChild(popupObj);
    });

}

let popupShadow = null;

window.addEventListener('message', function (event) {
    console.log(event);

    if (event.origin.indexOf(chrome.runtime.id) === -1) {
        return;
    }
    if (event.data.action === 'resizePopupWindow') {
        let popupObj = popupShadow.querySelector('#' + popup_window_id);
    
        // console.log(popupObj);
    
        let popupWidth = event.data.width;
        let popupHeight = event.data.height;
    
        popupObj.style.width = popupWidth + 'px';
        popupObj.style.height = popupHeight + 'px';
        
        
        popupObj.style.left = calcPopupPositionX(mousePositionX, popupWidth) + "px";
        popupObj.style.top = calcPopupPositionY(mousePositionY, popupHeight) + "px";
    
        popupObj.style.visibility = 'visible';
        return;
    }

    if (event.data.action === 'navTo') {
        let page = event.data.page;
        showPopup(mousePositionX, mousePositionY, page);
        return;
    }

});



function createPopupObj(x, y, src, init) {
    // 先搞一个根节点，这个元素因为是最后放的所以应该是在body的最上边，稍后根据这个元素来定位
    let popupParentObj = document.createElement(popup_window_id);
    popupParentObj.style.position = 'relative';


    let popupParentShadow = popupParentObj.attachShadow({ mode: 'closed' });
    popupShadow = popupParentShadow;

    const popupParentStyle = document.createElement('style');
    popupParentStyle.textContent = `
        :host {
          all: initial;
          contain: style layout size;
        }

        #wUkq6dYT-l1FNJ3Ne {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 9999;
            font-size: 16px;
            overflow: hidden;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
    `;

    popupParentShadow.appendChild(popupParentStyle);
    let popupObj = document.createElement('div');
    popupObj.setAttribute('id', popup_window_id);
    // 先设置为全屏大小，等渲染完获取到宽高后再重新设置大小
    popupObj.style.width = document.body.clientWidth + 'px';
    popupObj.style.height = document.body.clientHeight + 'px';
    popupObj.style.visibility = 'hidden';
    popupParentShadow.appendChild(popupObj);
    


    popupObj.innerHTML = `
<iframe id="${popup_window_id}" src="${chrome.runtime.getURL(src)}" style="width: 100%; height: 100%; border: none; overflow: hidden;"></iframe>
    `;

    // 添加到文档并保护它
    const root = document.documentElement;
    root.appendChild(popupParentObj);

    // 放在文档最前边吧，反正也不显示，比较容易计算弹窗位置
    root.insertBefore(popupParentObj, root.firstChild);

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
            let popupObj = showPopup(mousePositionX, mousePositionY, 'index.html');

            // 保存选中的文本，方便后续使用
            chrome.storage.session.set({ 'selected-text': selectedText }).then(() => {
                console.log("selectedText was set");
            });

            popupObj.addEventListener('mouseup', function (event) {
                event.stopPropagation(); //阻止冒泡
            })


        }
    });
}

document.addEventListener('mouseup', mouseUpEventHandle);
document.addEventListener('touchend', mouseUpEventHandle);

function showPopup(x, y, page, init) {

    cleanPopup();

    let popupObj = createPopupObj(x, y, page, init);

    // popupObj.querySelector('#chat-nav-close').addEventListener('click', function () {
    //     cleanPopup();
    // });
    popupObj.addEventListener('mouseup', function (event) {
        event.stopPropagation(); //阻止冒泡
    });

    return popupObj;
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

    // let popupParentObj = document.getElementsByTagName(popup_window_id)[0];
    // console.log("===>" + popupParentObj.offsetTop)
    // console.log("===>" + window.scrollY)

    // 可视区域上边缘在整个页面高度中的位置 = 整个页面高度 - 滚动高度
    let windowTop = window.scrollY;
    // 可视区域下边缘在整个页面高度中的位置 = 上边缘位置 + 可视区域高度
    let windowBottom = windowTop + window.innerHeight;
    

    // 先根据父容器计算计算位置，这个位置是接下来弹窗的上边缘的中心位置
    // 因为是相对相对于页面最下边的位置，所以应该是个负值
    let top = windowTop + y;

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

    // 计算的偏移量应该是负值
    return top;
}