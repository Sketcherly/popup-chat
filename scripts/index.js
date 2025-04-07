// chrome.storage.session.get(["selectedText"]).then((result) => {
//     console.log("selectedText Value is " + result.selectedText);
// });

// console.log(window.parent);


(function() {

    setTimeout(() => {
        window.parent.postMessage({
            action: 'resizePopupWindow',
            width: document.body.children[0].offsetWidth,
            height: document.body.children[0].offsetHeight,
        }, '*');
    }, 5);



})();


document.getElementById('btn--translate').addEventListener('click', function () {
    window.parent.postMessage({
        action: 'navTo',
        page: 'pages/chat.html?act=' + 'translate',
    }, '*');
});

document.getElementById('btn--summarize').addEventListener('click', function () {
    window.parent.postMessage({
        action: 'navTo',
        page: 'pages/chat.html?act=' + 'summarize',
    }, '*');
});

document.getElementById('btn--chat').addEventListener('click', function () {
    window.parent.postMessage({
        action: 'navTo',
        page: 'pages/chat.html?act=' + 'chat',
    }, '*');
});

document.getElementById('btn--setting').addEventListener('click', function () {
    window.open(chrome.runtime.getURL('../pages/setting.html'));
});