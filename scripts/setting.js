
let bZYtqtP9 = (function () {

    function save() {
        let id = document.getElementById('bZYtqtP9__form--id').value;
        let name = document.getElementById('bZYtqtP9__form--name').value;
        let type = document.getElementById('bZYtqtP9__form--type').value;
        let key = document.getElementById('bZYtqtP9__form--key').value;
        let host = document.getElementById('bZYtqtP9__form--host').value;
        let modelName = document.getElementById('bZYtqtP9__form--modelName').value;
    
        let item = {
            name: name,
            type: type,
            key: key,
            host: host,
            modelName: modelName
        };
    
        let serviceList = [];
        chrome.storage.local.get(["serviceList"]).then((result) => {
            if (!result.serviceList) {
                // do nothing
            } else {
                serviceList = result.serviceList;
            }
    
    
            serviceList.push(item);
    
            chrome.storage.local.set({ 'serviceList': serviceList }).then(() => {
                console.log("Value is set");
            });
    
            reloadServiceList();
        });
    
    }


    (function init() {
        document.getElementById('bZYtqtP9__form--submit').addEventListener('click', save);
    
        // reloadServiceList();

        reloadServiceListTable();
    })();


    function serviceListDelete(index) {
        let serviceList = [];
        chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
            if (!result.serviceList) {
                // do nothing
            } else {
                serviceList = result.serviceList;
            }
    
            serviceList.splice(index, 1);
    
            chrome.storage.local.set({ 'serviceList': serviceList }).then(() => {
                // console.log("Value is set");
            });
    
            try {
                result.serviceDefault = parseInt(result.serviceDefault);
            } catch (error) {
                result.serviceDefault = null;
            }
    
            if (result.serviceDefault == index) {
                chrome.storage.local.set({ 'serviceDefault': null }).then(() => {
                    // console.log("Value is set");
                });
            }
            if (result.serviceDefault > index) {
                chrome.storage.local.set({ 'serviceDefault': result.serviceDefault - 1 }).then(() => {
                    // console.log("Value is set");
                });
            }
    
    
            reloadServiceList();
        });
    }
    
    function reloadServiceList() {
    
        let serviceList = [];
        chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
            if (!result.serviceList) {
                // do nothing
            } else {
                serviceList = result.serviceList;
            }
    
            // reloadServiceListHtml(serviceList);
            let serviceListObj = document.getElementById('bZYtqtP9__service-list');
            serviceListObj.innerHTML = '';
    
            for (let i = 0; i < serviceList.length; i++) {
                let item = serviceList[i];
                let serviceItem = document.createElement('li');
                serviceItem.setAttribute('class', 'list-group-item');
    
                let checked = '';
                if (result.serviceDefault == i) {
                    checked = ' checked';
                }
    
                let serviceItemHtml = '';
                serviceItemHtml += `<input class="form-check-input me-1" type="radio" name="bZYtqtP9__form--default" value="${i}" id="bZYtqtP9__form--default-${i}"${checked}>`;
                serviceItemHtml += `<label class="form-check-label" for="bZYtqtP9__form--default-${i}">${item.name}</label>`;
                serviceItemHtml += `<button type="button" class="btn btn-danger btn-del" value="${i}">移除</button>`;
                serviceItem.innerHTML = serviceItemHtml;
                serviceListObj.appendChild(serviceItem);
            }
    
            // console.log(serviceListObj);
    
            let redioList = document.querySelector('#bZYtqtP9__service-list').querySelectorAll('input[type="radio"]');
            // console.log(redioList);
            for (let i = 0; i < redioList.length; i++) {
                redioList[i].addEventListener('change', function (element) {
                    chrome.storage.local.set({ 'serviceDefault': element.target.value }).then(() => {
                    });
                });
            }
    
            let delList = document.querySelector('#bZYtqtP9__service-list').querySelectorAll('.btn-del');
            // console.log(delList);
            for (let i = 0; i < delList.length; i++) {
                delList[i].addEventListener('click', function (idx) {
                    serviceListDelete(i);
                });
            }
    
    
            // .forEach((element) => {
            //     element.addEventListener('click', function () {
            //         console.log('click');
            //         console.log(element.value);
            //     });
            // });
        });
    
    
    }

    function reloadServiceListTable() {
    
        let serviceList = [];
        chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
            if (!result.serviceList) {
                // do nothing
            } else {
                serviceList = result.serviceList;
            }
    
            // reloadServiceListHtml(serviceList);
            let serviceListObj = document.getElementById('bZYtqtP9__service-list-table');
            serviceListObj.innerHTML = '';
    
            for (let i = 0; i < serviceList.length; i++) {
                let item = serviceList[i];
                let serviceItem = document.createElement('tr');
    
                let checked = '';
                if (result.serviceDefault == i) {
                    checked = ' checked';
                }

    
                let serviceItemHtml = '';
                serviceItemHtml += `<td>
                    <input class="form-check-input me-1" type="radio" name="bZYtqtP9__form--default" value="${i}" id="bZYtqtP9__form--default-${i}"${checked}>
                    <label class="form-check-label" for="bZYtqtP9__form--default-${i}">选中设为默认</label>
                </td>`;
                serviceItemHtml += `<td><input type="text" class="form-control" id="bZYtqtP9__form--name" value="${item.name}"></td>`;
                serviceItemHtml += `<td><input type="text" class="form-control" id="bZYtqtP9__form--type" value="${item.type}"></td>`;
                serviceItemHtml += `<td><input type="text" class="form-control" id="bZYtqtP9__form--host" value="${item.host}"></td>`;
                serviceItemHtml += `<td><input type="password" class="form-control" id="bZYtqtP9__form--key" value="${item.key}"></td>`;
                serviceItemHtml += `<td><input type="text" class="form-control" id="bZYtqtP9__form--modelName" value="${item.modelName}"></td>`;
                serviceItemHtml += `<td>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-primary" id="btn--save">保存</button>
                        <button type="button" class="btn btn-primary" id="btn--view">查看</button>
                        <button type="button" class="btn btn-danger" id="btn--del">删除</button>
                    </div>
                </td>`;
                serviceItem.innerHTML = serviceItemHtml;
                serviceListObj.appendChild(serviceItem);
            }
    
            // console.log(serviceListObj);
    
            let redioList = document.querySelector('#bZYtqtP9__service-list-table').querySelectorAll('input[type="radio"]');
            // console.log(redioList);
            for (let i = 0; i < redioList.length; i++) {
                redioList[i].addEventListener('change', function (element) {
                    chrome.storage.local.set({ 'serviceDefault': element.target.value }).then(() => {
                    });
                });
            }
    
            let delList = document.querySelector('#bZYtqtP9__service-list-table').querySelectorAll('.btn-del');
            // console.log(delList);
            for (let i = 0; i < delList.length; i++) {
                delList[i].addEventListener('click', function (idx) {
                    serviceListDelete(i);
                });
            }
    
    
            // .forEach((element) => {
            //     element.addEventListener('click', function () {
            //         console.log('click');
            //         console.log(element.value);
            //     });
            // });
        });
    
    
    }

})();



// function bZYtqtP9__save() {
//     let id = document.getElementById('bZYtqtP9__form--id').value;
//     let name = document.getElementById('bZYtqtP9__form--name').value;
//     let type = document.getElementById('bZYtqtP9__form--type').value;
//     let key = document.getElementById('bZYtqtP9__form--key').value;
//     let host = document.getElementById('bZYtqtP9__form--host').value;
//     let modelName = document.getElementById('bZYtqtP9__form--modelName').value;

//     let item = {
//         name: name,
//         type: type,
//         key: key,
//         host: host,
//         modelName: modelName
//     };

//     let serviceList = [];
//     chrome.storage.local.get(["serviceList"]).then((result) => {
//         if (!result.serviceList) {
//             // do nothing
//         } else {
//             serviceList = JSON.parse(result.serviceList);
//         }


//         serviceList.push(item);

//         chrome.storage.local.set({ 'serviceList': JSON.stringify(serviceList) }).then(() => {
//             console.log("Value is set");
//         });

//         reloadServiceList();
//     });

// }

// function serviceListDelete(index) {
//     let serviceList = [];
//     chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
//         if (!result.serviceList) {
//             // do nothing
//         } else {
//             serviceList = JSON.parse(result.serviceList);
//         }

//         serviceList.splice(index, 1);

//         chrome.storage.local.set({ 'serviceList': JSON.stringify(serviceList) }).then(() => {
//             // console.log("Value is set");
//         });

//         try {
//             result.serviceDefault = parseInt(result.serviceDefault);
//         } catch (error) {
//             result.serviceDefault = null;
//         }

//         if (result.serviceDefault == index) {
//             chrome.storage.local.set({ 'serviceDefault': null }).then(() => {
//                 // console.log("Value is set");
//             });
//         }
//         if (result.serviceDefault > index) {
//             chrome.storage.local.set({ 'serviceDefault': result.serviceDefault - 1 }).then(() => {
//                 // console.log("Value is set");
//             });
//         }


//         reloadServiceList();
//     });
// }

// function reloadServiceList() {

//     let serviceList = [];
//     chrome.storage.local.get(["serviceList", 'serviceDefault']).then((result) => {
//         if (!result.serviceList) {
//             // do nothing
//         } else {
//             serviceList = JSON.parse(result.serviceList);
//         }

//         // reloadServiceListHtml(serviceList);
//         let serviceListObj = document.getElementById('bZYtqtP9__service-list');
//         serviceListObj.innerHTML = '';

//         for (let i = 0; i < serviceList.length; i++) {
//             let item = serviceList[i];
//             let serviceItem = document.createElement('li');
//             serviceItem.setAttribute('class', 'list-group-item');

//             let checked = '';
//             if (result.serviceDefault == i) {
//                 checked = ' checked';
//             }

//             let serviceItemHtml = '';
//             serviceItemHtml += `<input class="form-check-input me-1" type="radio" name="bZYtqtP9__form--default" value="${i}" id="bZYtqtP9__form--default-${i}"${checked}>`;
//             serviceItemHtml += `<label class="form-check-label" for="bZYtqtP9__form--default-${i}">${item.name}</label>`;
//             serviceItemHtml += `<button type="button" class="btn btn-danger btn-del" value="${i}">移除</button>`;
//             serviceItem.innerHTML = serviceItemHtml;
//             serviceListObj.appendChild(serviceItem);
//         }

//         // console.log(serviceListObj);

//         let redioList = document.querySelector('#bZYtqtP9__service-list').querySelectorAll('input[type="radio"]');
//         console.log(redioList);
//         for (let i = 0; i < redioList.length; i++) {
//             redioList[i].addEventListener('change', function (element) {
//                 chrome.storage.local.set({ 'serviceDefault': element.target.value }).then(() => {
//                 });
//             });
//         }

//         let delList = document.querySelector('#bZYtqtP9__service-list').querySelectorAll('.btn-del');
//         console.log(delList);
//         for (let i = 0; i < delList.length; i++) {
//             delList[i].addEventListener('click', function (idx) {
//                 serviceListDelete(i);
//             });
//         }


//         // .forEach((element) => {
//         //     element.addEventListener('click', function () {
//         //         console.log('click');
//         //         console.log(element.value);
//         //     });
//         // });
//     });


// }