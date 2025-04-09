(function () {

    const serviceListKey = 'service-list';
    const serviceDefaultKey = 'service-default';


    const serviceListParent = document.getElementById('service-list-parent');

    const addBtn = serviceListParent.querySelector('#btn--add');

    addBtn.addEventListener('click', showAddForm);

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

                chrome.storage.local.set({ [serviceListKey]: serviceList }).then(() => {
                    console.log("Value is set");
                    reloadServiceListTable();
                });

                // reloadServiceList();
            });

    }

    function change(idx, item) {
        getServiceList().then((result) => {
            let serviceList = [];
            if (!result[serviceListKey]) {
                // do nothing
            } else {
                serviceList = result[serviceListKey];
            }

            serviceList[idx] = item;

            chrome.storage.local.set({ [serviceListKey]: serviceList }).then(() => {
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

    function showAddForm() {
        const serviceListTable = document.getElementById('service-list-table');

        const html = `
        <tr>
            <td>
                <div class="form-check d-flex justify-content-center">
                </div>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm" name="name">
            </td>
            <td>
                <span class="badge bg-secondary">OpenAI</span>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm" name="host">
            </td>
            <td class="password-cell">
                <input type="password" class="form-control form-control-sm" name="key">
            </td>
            <td>
                <input type="text" class="form-control form-control-sm" name="modelName">
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group" aria-label="Row Actions">
                    <button type="button" class="btn btn-outline-primary" id="btn--save">
                        <i class="bi bi-save"></i> 保存 </button>
                    <button type="button" class="btn btn-outline-danger" id="btn--cancel">
                        <i class="bi bi-trash"></i> 取消 </button>
                </div>
            </td>
        </tr>`;
        let tr = document.createElement('tr');
        tr.innerHTML = html;

        serviceListTable.appendChild(tr);
        addBtn.style.visibility = 'hidden';

        tr.querySelector('#btn--save').addEventListener('click', serviceListSaveBtnClickHandler);

        tr.querySelector('#btn--cancel').addEventListener('click', function () {
            tr.remove();

            addBtn.style.visibility = 'visible';
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
                        checked = 'checked';
                    }

                    let serviceItemHtml = `
                    <td>
                        <div class="form-check d-flex justify-content-center">
                            <input class="form-check-input me-1" type="radio" name="default" value="${i}"${checked}
                                id="default-${i}">
                            <label class="form-check-label" for="default-${i}">设为默认</label>
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm" name="name" value="${item.name}">
                    </td>
                    <td>
                        <span class="badge bg-secondary">OpenAI</span>
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm" name="host" value="${item.host}">
                    </td>
                    <td class="password-cell">
                        <input type="password" class="form-control form-control-sm" name="key" value="${item.key}">
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm" name="modelName" value="${item.modelName}">
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group" aria-label="Row Actions">
                            <button type="button" class="btn btn-outline-primary" id="btn--save">
                                <i class="bi bi-save"></i> 保存 </button>
                            <button type="button" class="btn btn-outline-primary" id="btn--view">
                                <i class="bi bi-save"></i> 查看 </button>
                            <button type="button" class="btn btn-outline-danger" id="btn--del">
                                <i class="bi bi-trash"></i> 删除 </button>
                        </div>
                    </td>
                    `;

                    serviceItem.innerHTML = serviceItemHtml;
                    serviceListObj.appendChild(serviceItem);
                }

                // console.log(serviceListObj);

                let trs = serviceListObj.querySelectorAll('tr');
                for (let i = 0; i < trs.length; i++) {
                    let radio = trs[i].querySelector('input[type="radio"]');
                    if (radio) {
                        radio.addEventListener('change', function (element) {
                            chrome.storage.local.set({ [serviceDefaultKey]: element.target.value })
                                .then(() => {
                                    console.log("serviceDefault Value is set");
                                });
                        });
                    }

                    let saveBtn = trs[i].querySelector('#btn--save');
                    if (saveBtn) {
                        saveBtn.addEventListener('click', serviceListSaveBtnClickHandler);
                    }

                    let viewBtn = trs[i].querySelector('#btn--view');
                    if (viewBtn) {
                        viewBtn.addEventListener('click', function () {
                            let tr = this.parentNode.parentNode.parentNode;
                            let input = tr.querySelector('input[name="key"]');

                            if (input.type === 'password') {
                                input.type = 'text';
                                viewBtn.innerText = '隐藏';
                            }
                            else {
                                input.type = 'password';
                                viewBtn.innerText = '查看';
                            }
                        });
                    }

                    let delBtn = trs[i].querySelector('#btn--del');
                    if (delBtn) {
                        delBtn.addEventListener('click', function () {
                            serviceListDelete(i);
                        });
                    }
                }

                // showAddBtn();
                addBtn.style.visibility = 'visible';
            });


    }

})();



(function () {

    const customPromptListParent = document.getElementById('custom-prompt-list-parent');

    const customPromptListDiv = customPromptListParent.querySelector('#custom-prompt-list');
    const btnAddPrompt = customPromptListParent.querySelector('#btnAddPrompt');
    const btnSaveAll = customPromptListParent.querySelector('#btnSaveAll');

    let promptCounter = 2; // Start counting from the next available index (assuming 0 and 1 exist)

    // --- Function to create HTML for a new prompt card ---
    function createPromptCard(index) {
        const cardHtml = `
          <div class="card mb-4" id="custom-act-item-${index}">
              <div class="card-body">
                  <div class="mb-3">
                      <label for="promptName-${index}" class="form-label fw-bold">名称</label>
                      <input type="text" class="form-control" name="promptName" id="promptName-${index}" value="">
                  </div>
                  <div class="mb-3">
                      <label for="promptText-${index}" class="form-label fw-bold">提示词</label>
                      <textarea class="form-control" name="promptText" id="promptText-${index}" rows="5"></textarea>
                  </div>
                  <div class="text-end">
                      <button type="button" class="btn btn-outline-danger btn-sm btn-delete-prompt" data-card-id="custom-act-item-${index}">删除</button> </div>
              </div>
          </div>`;
        // Create a temporary div to hold the new HTML, then extract the card element
        const div = document.createElement('div');
        div.innerHTML = cardHtml.trim();
        return div.firstChild;
    }

    // --- Logic for the "Add" button ---
    btnAddPrompt.addEventListener('click', () => {

        // index的主要作用是点label的时候文本框能获取焦点
        // Find the highest current index to avoid ID conflicts if items were deleted
        const existingCardList = customPromptListDiv.querySelectorAll('.card');
        let maxIndex = -1;
        existingCardList.forEach(card => {
            const idParts = card.id.split('-');
            const index = parseInt(idParts[idParts.length - 1], 10);
            if (!isNaN(index) && index > maxIndex) {
                maxIndex = index;
            }
        });

        const card = createPromptCard(maxIndex + 1);
        customPromptListDiv.append(card);
    });

    // --- Logic for "Delete" buttons (using Event Delegation) ---
    customPromptListDiv.addEventListener('click', (event) => {
        // Check if the clicked element is a delete button (or inside one)
        const deleteButton = event.target.closest('.btn-delete-prompt');
        if (deleteButton) {
            // Find the closest parent card element and remove it
            const cardToRemove = deleteButton.closest('.card');
            if (cardToRemove) {
                // Optional: Add a confirmation dialog
                if (confirm('您确定要删除这个提示词吗？')) {
                    cardToRemove.remove();
                }
            }
        }
    });

    // --- Logic for the "Save" button ---
    btnSaveAll.addEventListener('click', () => {
        const customPromptList = [];
        const customPromptCardList = customPromptListDiv.querySelectorAll('.card'); // Select all card elements within the container

        customPromptCardList.forEach((card) => {
            const promptNameInput = card.querySelector('input[name="promptName"]');
            const promptTextInput = card.querySelector('textarea[name="promptText"]');

            if (promptNameInput && promptTextInput) {
                customPromptList.push({
                    title: promptNameInput.value.trim(),
                    promptText: promptTextInput.value.trim()
                });
            }
        });

        console.log("Saving data...");

        chrome.storage.local.set({ [CUSTOM_PROMPT_STORAGE_KEY]: customPromptList }).then(() => {
            console.log("customPromptList is set");
            alert('保存成功');
        });


    });

    function reload() {
        // 读取存储的提示词列表
        chrome.storage.local.get([CUSTOM_PROMPT_STORAGE_KEY])
            .then((result) => {
                let customPromptList = result[CUSTOM_PROMPT_STORAGE_KEY];

                if (customPromptList === undefined || customPromptList === null) {
                    customPromptList = DEFAULT_PROMPT_LIST;
                }

                customPromptListDiv.innerHTML = '';

                for (let i = 0; i < customPromptList.length; i++) {
                    let item = customPromptList[i];
                    const card = createPromptCard(i);
                    customPromptListDiv.appendChild(card);

                    card.querySelector('input[name="promptName"]').value = item.title;
                    card.querySelector('textarea[name="promptText"]').value = item.promptText;
                }
            });
    }

    reload();




})();
