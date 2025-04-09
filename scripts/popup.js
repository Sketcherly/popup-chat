(function() {
    document.getElementsByTagName('button')[0].addEventListener('click', function() {
        chrome.tabs.create({
            url: 'pages/setting.html'
        });
    });
})();