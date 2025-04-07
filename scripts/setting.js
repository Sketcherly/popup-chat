(function () {

    const serviceListKey = 'service-list';
    const serviceDefaultKey = 'service-default';

    function getServiceList() {
        return chrome.storage.local.get([serviceListKey, serviceDefaultKey]);
    }

    function append(item) {

        getServiceList()
            .then((result) => {
                let serviceList = [];
                if (!result[serviceListKey]) {
                    // do nothing
                } else {
                    serviceList = result[serviceListKey];
                }


                serviceList.push(item);

                let obj = {};
                obj[serviceListKey] = serviceList;

                chrome.storage.local.set(obj).then(() => {
                    console.log("Value is set");
                    reloadServiceListTable();
                });

                // reloadServiceList();
            });

    }

    function change(idx, item) {
        createStorageGetInstance().then((result) => {
            let serviceList = [];
            if (!result[serviceListKey]) {
                // do nothing
            } else {
                serviceList = result[serviceListKey];
            }

            serviceList[idx] = item;

            let obj = {};
            obj[serviceListKey] = serviceList;

            chrome.storage.local.set(obj).then(() => {
                console.log("Value is set");
                reloadServiceListTable();
            });

            // reloadServiceList();
        });

    }

    function serviceListSaveBtnClickHandler() {
        let tr = this.parentNode.parentNode.parentNode;

        let name = tr.querySelector('input[name="name"]').value;
        // let modelType = tr.querySelector('input[name="modelType"]').value;
        let host = tr.querySelector('input[name="host"]').value;
        let key = tr.querySelector('input[name="key"]').value;
        let modelName = tr.querySelector('input[name="modelName"]').value;
        let item = {
            name: name,
            type: '0',
            key: key,
            host: host,
            modelName: modelName
        };

        let radio = tr.querySelector('input[type="radio"]');
        if (radio) {
            // 修改
            let idx = radio.value;
            change(idx, item);
        } else {
            // 添加
            append(item);
        }

    }

    function showAddBtn() {
        const html = `
        <td colspan="7">
            <button type="button" class="btn btn-primary btn-sm" id="btn--add">添加</button>
        </td>
        `;
        const serviceListTable = document.getElementById('service-list-table');
        const tr = document.createElement('tr');
        tr.innerHTML = html;
        serviceListTable.appendChild(tr);

        const addBtn = tr.querySelector('#btn--add');
        addBtn.addEventListener('click', function () {
            // 添加之前先删除添加按钮
            tr.remove();
            showAddForm();
        });

    }

    function showAddForm() {
        const serviceListTable = document.getElementById('service-list-table');

        const html = `
        <th scope="row">
        </th>
        <td><input type="text" class="form-control" name="name" value=""></td>
        <td>OpenAI API</td>
        <td><input type="text" class="form-control" name="host" value=""></td>
        <td><input type="password" class="form-control" name="key" value=""></td>
        <td><input type="text" class="form-control" name="modelName" value=""></td>
        <td>
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-primary" id="btn--save">保存</button>
                <button type="button" class="btn btn-primary" id="btn--cancel">取消</button>
            </div>
        </td>
        `;
        let tr = document.createElement('tr');
        tr.innerHTML = html;

        serviceListTable.appendChild(tr);

        tr.querySelector('#btn--save').addEventListener('click', serviceListSaveBtnClickHandler);

        tr.querySelector('#btn--cancel').addEventListener('click', function () {
            tr.remove();
            showAddBtn();
        });

    }


    (function init() {
        reloadServiceListTable();
    })();


    function serviceListDelete(index) {

        let serviceList = [];
        chrome.storage.local.get([serviceListKey, serviceDefaultKey]).then((result) => {
            if (!result[serviceListKey]) {
                // do nothing
            } else {
                serviceList = result[serviceListKey];
            }

            serviceList.splice(index, 1);

            let obj = {};
            obj[serviceListKey] = serviceList;
            chrome.storage.local.set(obj).then(() => {
                // console.log("Value is set");
                reloadServiceListTable();
            });

            try {
                result[serviceDefaultKey] = parseInt(result[serviceDefaultKey]);
            } catch (error) {
                result[serviceDefaultKey] = null;
            }

            if (result[serviceDefaultKey] == index) {
                let obj = {};
                obj[serviceDefaultKey] = null;
                chrome.storage.local.set(obj).then(() => {
                    // console.log("Value is set");
                    reloadServiceListTable();
                });
            }
            if (result[serviceDefaultKey] > index) {
                let obj = {};
                obj[serviceDefaultKey] = result[serviceDefaultKey] - 1;
                chrome.storage.local.set(obj).then(() => {
                    // console.log("Value is set");
                    reloadServiceListTable();
                });
            }


            reloadServiceListTable();
        });
    }

    function reloadServiceListTable() {

        getServiceList()
        .then((result) => {
            let serviceList = [];
            if (!result[serviceListKey]) {
                    // do nothing
                } else {
                    serviceList = result[serviceListKey];
                }

                // reloadServiceListHtml(serviceList);
                let serviceListObj = document.getElementById('service-list-table');
                serviceListObj.innerHTML = '';

                for (let i = 0; i < serviceList.length; i++) {
                    let item = serviceList[i];
                    let serviceItem = document.createElement('tr');

                    let checked = '';
                    if (result[serviceDefaultKey] == i) {
                        checked = ' checked';
                    }


                    let serviceItemHtml = '';
                    serviceItemHtml += `<td>
                    <input class="form-check-input me-1" type="radio" name="form--default" value="${i}" id="form--default-${i}"${checked}>
                    <label class="form-check-label" for="form--default-${i}">选中设为默认</label>
                </td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" id="form--name" value="${item.name}"></td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" id="form--type" value="${item.type}"></td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" id="form--host" value="${item.host}"></td>`;
                    serviceItemHtml += `<td><input type="password" class="form-control" id="form--key" value="${item.key}"></td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" id="form--modelName" value="${item.modelName}"></td>`;
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

                let trs = serviceListObj.querySelectorAll('tr');
                for(let i = 0; i < trs.length; i++) {
                    let radio = trs[i].querySelector('input[type="radio"]');
                    if (radio) {
                        radio.addEventListener('change', function (element) {
                            let obj = {};
                            obj[serviceDefaultKey] = element.target.value;
                            chrome.storage.local.set(obj).then(() => {
                            });
                        });
                    }

                    let saveBtn = trs[i].querySelector('#btn--save');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', serviceListSaveBtnClickHandler);
                    }

                    let viewBtn = trs[i].querySelector('#btn--view');
                    // if (viewBtn) {
                    //     viewBtn.addEventListener('click', function () {
                    //         let item = serviceList[i];
                    //         alert(JSON.stringify(item));
                    //     });
                    // }

                    let delBtn = trs[i].querySelector('#btn--del');
                    if (delBtn) {
                        delBtn.addEventListener('click', function () {
                            serviceListDelete(i);
                        });
                    }
                }

                showAddBtn();
            });


    }

})();
