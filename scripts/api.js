class ServiceFactory {
    constructor() { }

    createInstance() {
        const serviceListKey = 'service-list';
        const serviceDefaultKey = 'service-default';

        return chrome.storage.local.get([serviceListKey, serviceDefaultKey])
            .then((result) => {

                try {
                    result[serviceDefaultKey] = parseInt(result[serviceDefaultKey]);
                } catch (error) {
                    result[serviceDefaultKey] = null;
                }

                let serviceDefault = parseInt(result[serviceDefaultKey]);
                if (result[serviceListKey].length > 0 && serviceDefault < result[serviceListKey].length) {
                    let serviceDefaultItem = result[serviceListKey][serviceDefault];
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

        let responseBody = '';

        let responseBodyStream = '';

        function resolveStreamData(value) {
            const decoder = new TextDecoder();
            let responseMessageData = decoder.decode(value);
            // console.log(responseMessageData);

            const responseMessageStart = 'data: ';
            const responseMessageEnd = '[DONE]';

            responseBodyStream += responseMessageData;

            // 先将这次拿到的数据和之前剩下的数据拼接
            // 然后找是不是有\n
            // 如果有\n就分割成行，然后取出来当做一个json处理
            // 直到没有\n之后，将剩下的数据继续保存在responseBodyStream中等待下次收到数据处理
            let nextLineStartAt = responseBodyStream.indexOf('\n');
            while (nextLineStartAt >= 0) {
                let responseMessageLine = responseBodyStream.substring(0, nextLineStartAt);
                responseBodyStream = responseBodyStream.substring(nextLineStartAt + 1);
                // 继续查找下一个\n
                nextLineStartAt = responseBodyStream.indexOf('\n');
                // console.log(responseMessageLine);

                // 开始处理取出来的一行数据
                if (responseMessageLine.startsWith(responseMessageStart)) {
                    // 处理掉开头的data: 
                    responseMessageLine = responseMessageLine.substring(responseMessageStart.length);
                }

                if (responseMessageLine.startsWith(responseMessageEnd)) {
                    continue;
                }
                if (responseMessageLine.trim().length === 0) {
                    continue;
                }

                let responseDataObj = JSON.parse(responseMessageLine);
                // console.log(responseDataObj);
                let content = responseDataObj.choices[0].delta.content;
                if (!!content) {
                    if (resolveText) {
                        resolveText(content);

                        responseBody += content;
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
                        resolveDone(responseBody);
                    }
                    return;
                }

                // console.log('Received data chunk', value);
                resolveStreamData(value);

                // 读取下一段数据
                return reader.read().then(process);
            });



        });


        // chrome.storage.local.get(['service-list', 'service-default'])
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