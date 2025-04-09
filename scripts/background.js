// 允许在content.js中使用chrome.storage.session
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

chrome.runtime.onInstalled.addListener((_reason) => {
    chrome.tabs.create({
        url: 'pages/setting.html'
    });
});