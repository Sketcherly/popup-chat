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
        getServiceList().then((result) => {
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
                    <input class="form-check-input me-1" type="radio" name="default" value="${i}" id="default-${i}"${checked}>
                    <label class="form-check-label" for="default-${i}">选中设为默认</label>
                </td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" name="name" value="${item.name}"></td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" name="modelType" value="${item.type}"></td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" name="host" value="${item.host}"></td>`;
                    serviceItemHtml += `<td><input type="password" class="form-control" name="key" value="${item.key}"></td>`;
                    serviceItemHtml += `<td><input type="text" class="form-control" name="modelName" value="${item.modelName}"></td>`;
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
                for (let i = 0; i < trs.length; i++) {
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


// 翻译相关的设置
(function() {
    const translatePromptTextKey = 'translate-prompt-text';
    const translateToKey = 'translate-to';

    const translateToPromptTextDefault = `# 精准网页翻译（仅输出目标语言）

## 您的身份与专长
您是一位跨文化交流专家级翻译大师，不仅精通多国语言的微妙表达，更深谙各语言文化背景和语境差异。您能在保留原文情感与意图的同时，创造如同目标语言母语者原创的流畅译文。

## 翻译核心任务
将待翻译内容转化为完全自然的{{to}}语言，确保译文既忠实原意，又完全符合目标语言的表达习惯、文化背景和语境要求。

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


    function getTranslatePromptText() {
        return chrome.storage.local.get([translatePromptTextKey, translateToKey]);
    }

    function translatePromptTextSaveBtnClickHandler() {
        let tr = this.parentNode.parentNode.parentNode;

        let to = tr.querySelector('input[name="translate-to"]').value;
        if (!to || to === '') {
            to = '简体中文';
        }

        let promptText = tr.querySelector('textarea[name="translate-prompt-text"]').value;
        if (!promptText || promptText === '') {
            promptText = translateToPromptTextDefault;
        }

        chrome.storage.local.set({
            [translatePromptTextKey]: promptText,
            [translateToKey]: to
        }).then(() => {
            console.log("Value is set");
        });

    }

    (function() {
        let translatePromptObj = document.getElementById('translate-prompt-setting');

        getTranslatePromptText()
            .then((result) => {
                let promptText = result[translatePromptTextKey];
                let to = result[translateToKey];

                if (!promptText || promptText === '') {
                    promptText = translateToPromptTextDefault;
                }

                if (!to || to === '') {
                    to = '简体中文';
                }

                translatePromptObj.querySelector('input[name="translate-to"]').value = to;
                translatePromptObj.querySelector('textarea[name="translate-prompt-text"]').value = promptText;

            });

        let translatePromptSaveBtn = translatePromptObj.querySelector('#btn--save');
        if (translatePromptSaveBtn) {
            translatePromptSaveBtn.addEventListener('click', translatePromptTextSaveBtnClickHandler);
        }


    })();

})();


// 总结相关的设置
(function() {
    const summarizePromptTextKey = 'summarize-prompt-text';

    const summarizeToPromptTextDefault = `You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the text delimited by triple quotes and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the Simplified Chinese language. """ {{text}} """`;


    function getSummarizePromptText() {
        return chrome.storage.local.get([summarizePromptTextKey]);
    }

    function summarizePromptTextSaveBtnClickHandler() {
        let tr = this.parentNode.parentNode.parentNode;

        let promptText = tr.querySelector('textarea[name="summarize-prompt-text"]').value;
        if (!promptText || promptText === '') {
            promptText = summarizeToPromptTextDefault;
        }

        chrome.storage.local.set({
            [summarizePromptTextKey]: promptText
        }).then(() => {
            console.log("Value is set");
        });

    }

    (function() {
        let summarizePromptObj = document.getElementById('summarize-prompt-setting');

        getSummarizePromptText()
            .then((result) => {
                let promptText = result[summarizePromptTextKey];

                if (!promptText || promptText === '') {
                    promptText = summarizeToPromptTextDefault;
                }

                summarizePromptObj.querySelector('textarea[name="summarize-prompt-text"]').value = promptText;

            });

        let summarizePromptSaveBtn = summarizePromptObj.querySelector('#btn--save');
        if (summarizePromptSaveBtn) {
            summarizePromptSaveBtn.addEventListener('click', summarizePromptTextSaveBtnClickHandler);
        }


    })();

})();
