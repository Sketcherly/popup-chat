class ServiceFactory {
    constructor() { }

    createInstance() {
        return chrome.storage.local.get(["serviceList", 'serviceDefault'])
            .then((result) => {

                try {
                    result.serviceDefault = parseInt(result.serviceDefault);
                } catch (error) {
                    result.serviceDefault = null;
                }

                let serviceDefault = parseInt(result.serviceDefault);
                if (result.serviceList.length > 0 && serviceDefault < result.serviceList.length) {
                    let serviceDefaultItem = result.serviceList[serviceDefault];
                    if (serviceDefaultItem) {
                        return new API_PROVIDERS[serviceDefaultItem.type](serviceDefaultItem);
                    }
                }
                return null;
            });
    }
}

class OpenAI {

    constructor(serviceOpt) {
        this.serviceOpt = serviceOpt;
    }

    // 暂时没用了，但是后续估计会有用
    // resolveServiceOptions(result) {
    // }

    fetch(messages, resolveText, resolveDone) {

        let serviceParam_url = this.serviceOpt.host + '/chat/completions';
        let serviceParam_key = this.serviceOpt.key;
        let serviceParam_model = this.serviceOpt.modelName;
        console.log(serviceParam_url, serviceParam_key, serviceParam_model);

        let data = {
            "model": serviceParam_model,
            "stream": true,
            "messages": messages
        };

        function resolveStreamData(value) {
            const decoder = new TextDecoder();
            let responseMessageData = decoder.decode(value);
            // console.log(responseMessageData);

            let responseMessageStart = 'data: ';
            let responseMessageEnd = '[DONE]';
            let responseMessageLines = responseMessageData.split('\n');
            for (let i = 0; i < responseMessageLines.length; i++) {
                let responseMessageLine = responseMessageLines[i];
                let responseMessage = responseMessageLine.substring(responseMessageStart.length);
                if (responseMessage.startsWith(responseMessageEnd)) {
                    continue;
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
                    // messageItemTextLoadingObj.parentElement.insertBefore(document.createTextNode(content), messageItemTextLoadingObj);
                    // responseMessageDom.querySelector('.message-item-text').appendChild(document.createTextNode(content));
                    // scrollMessageList(popupObj);
                    // popupObj.querySelector('#message-list').scrollTo(0, popupObj.querySelector('#message-list').scrollHeight);
                    if (resolveText) {
                        resolveText(content);
                    }
                }
            }

        }

        fetch(serviceParam_url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + serviceParam_key,
            }
        }).then((response) => {

            const reader = response.body.getReader();

            // 读取数据
            return reader.read().then(function process({ done, value }) {
                if (done) {
                    console.log('Stream finished');
                    if (resolveDone) {
                        resolveDone();
                    }
                    return;
                }

                // console.log('Received data chunk', value);
                resolveStreamData(value);

                // 读取下一段数据
                return reader.read().then(process);
            });



        });


        // chrome.storage.local.get(["serviceList", 'serviceDefault'])
        //     .then(this.resolveServiceOptions)
        //     .then((serviceOptions) => );
    };
}

function Gemini() {

}



const API_PROVIDERS = {
    "0": OpenAI,
    "1": Gemini,
    // "xai": XAI,
    // "anthropic": Anthropic,
    // "mistral": Mistral,
};