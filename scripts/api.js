/**
 * 基础 API 服务类
 * 定义所有 AI 服务提供商的通用接口
 */
class BaseAPIService {
    constructor(serviceOpt) {
        this.serviceOpt = serviceOpt;
        this.responseBody = '';
        this.responseBodyStream = '';
    }

    /**
     * 发送消息到 AI 服务
     * @param {Array} messages - 消息数组
     * @param {Function} resolveText - 处理流式文本回调
     * @param {Function} resolveDone - 完成回调
     */
    fetch(messages, resolveText, resolveDone) {
        throw new Error('fetch method must be implemented by subclass');
    }

    /**
     * 处理流式数据的通用方法
     * @param {Uint8Array} value - 流数据
     * @param {Function} resolveText - 文本处理回调
     * @param {Function} parseContent - 内容解析函数
     */
    processStreamData(value, resolveText, parseContent) {
        const decoder = new TextDecoder();
        let responseMessageData = decoder.decode(value);

        this.responseBodyStream += responseMessageData;

        let nextLineStartAt = this.responseBodyStream.indexOf('\n');
        while (nextLineStartAt >= 0) {
            let responseMessageLine = this.responseBodyStream.substring(0, nextLineStartAt);
            this.responseBodyStream = this.responseBodyStream.substring(nextLineStartAt + 1);
            nextLineStartAt = this.responseBodyStream.indexOf('\n');

            const content = parseContent(responseMessageLine);
            if (content && resolveText) {
                resolveText(content);
                this.responseBody += content;
            }
        }
    }

    /**
     * 重置响应状态
     */
    resetResponse() {
        this.responseBody = '';
        this.responseBodyStream = '';
    }
}

/**
 * 服务工厂类
 * 负责创建和管理 AI 服务实例
 */
class ServiceFactory {
    constructor() {}

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
                if (result[serviceListKey]?.length > 0 &&
                    serviceDefault < result[serviceListKey].length) {
                    let serviceDefaultItem = result[serviceListKey][serviceDefault];
                    if (serviceDefaultItem && API_PROVIDERS[serviceDefaultItem.type]) {
                        return new API_PROVIDERS[serviceDefaultItem.type](serviceDefaultItem);
                    }
                }
                return null;
            })
            .catch(error => {
                console.error('Failed to create service instance:', error);
                return null;
            });
    }
}

/**
 * OpenAI API 服务类
 * 实现 OpenAI 兼容的 API 调用
 */
class OpenAI extends BaseAPIService {
    constructor(serviceOpt) {
        super(serviceOpt);
    }

    /**
     * 解析 OpenAI 格式的流式响应内容
     * @param {string} line - 响应行数据
     * @returns {string|null} - 解析出的内容
     */
    parseOpenAIContent(line) {
        const responseMessageStart = 'data: ';
        const responseMessageEnd = '[DONE]';

        // 处理数据行前缀
        if (line.startsWith(responseMessageStart)) {
            line = line.substring(responseMessageStart.length);
        }

        // 跳过结束标记和空行
        if (line.startsWith(responseMessageEnd) || line.trim().length === 0) {
            return null;
        }

        try {
            const responseDataObj = JSON.parse(line);
            return responseDataObj.choices?.[0]?.delta?.content || null;
        } catch (error) {
            console.warn('Failed to parse OpenAI response line:', line, error);
            return null;
        }
    }

    /**
     * 发送消息到 OpenAI API
     * @param {Array} messages - 消息数组
     * @param {Function} resolveText - 处理流式文本回调
     * @param {Function} resolveDone - 完成回调
     */
    async fetch(messages, resolveText, resolveDone) {
        this.resetResponse();

        const serviceParam_url = this.serviceOpt.host + '/chat/completions';
        const serviceParam_key = this.serviceOpt.key;
        const serviceParam_model = this.serviceOpt.modelName;

        console.log('OpenAI API:', serviceParam_url, serviceParam_model);

        const data = {
            model: serviceParam_model,
            stream: true,
            messages: messages
        };

        try {
            const response = await fetch(serviceParam_url, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + serviceParam_key,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();

            const processStream = async ({ done, value }) => {
                if (done) {
                    console.log('OpenAI stream finished');
                    if (resolveDone) {
                        resolveDone(this.responseBody);
                    }
                    return;
                }

                this.processStreamData(value, resolveText, (line) => this.parseOpenAIContent(line));

                // 继续读取下一段数据
                return reader.read().then(processStream);
            };

            return reader.read().then(processStream);

        } catch (error) {
            console.error('OpenAI API error:', error);
            if (resolveDone) {
                resolveDone('Error: ' + error.message);
            }
        }
    }
}

/**
 * Google Gemini API 服务类
 * 实现 Google AI Gemini 模型的 API 调用
 */
class Gemini extends BaseAPIService {
    constructor(serviceOpt) {
        super(serviceOpt);
    }

    /**
     * 解析 Gemini 格式的流式响应内容
     * @param {string} line - 响应行数据
     * @returns {string|null} - 解析出的内容
     */
    parseGeminiContent(line) {
        // 跳过空行
        if (line.trim().length === 0) {
            return null;
        }

        try {
            const responseDataObj = JSON.parse(line);
            // Gemini API 的响应格式可能不同，这里需要根据实际 API 文档调整
            return responseDataObj.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (error) {
            console.warn('Failed to parse Gemini response line:', line, error);
            return null;
        }
    }

    /**
     * 将消息格式转换为 Gemini API 格式
     * @param {Array} messages - OpenAI 格式的消息数组
     * @returns {Object} - Gemini API 格式的请求体
     */
    convertMessagesToGeminiFormat(messages) {
        // 这里需要根据 Gemini API 的实际格式进行转换
        // 目前先返回一个基础结构，后续可以根据需要调整
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        return {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        };
    }

    /**
     * 发送消息到 Gemini API
     * @param {Array} messages - 消息数组
     * @param {Function} resolveText - 处理流式文本回调
     * @param {Function} resolveDone - 完成回调
     */
    async fetch(messages, resolveText, resolveDone) {
        this.resetResponse();

        const serviceParam_url = this.serviceOpt.host || 'https://generativelanguage.googleapis.com/v1beta';
        const serviceParam_key = this.serviceOpt.key;
        const serviceParam_model = this.serviceOpt.modelName || 'gemini-pro';

        console.log('Gemini API:', serviceParam_url, serviceParam_model);

        // 构建 Gemini API 的请求 URL
        const apiUrl = `${serviceParam_url}/models/${serviceParam_model}:streamGenerateContent?key=${serviceParam_key}`;

        const data = this.convertMessagesToGeminiFormat(messages);

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();

            const processStream = async ({ done, value }) => {
                if (done) {
                    console.log('Gemini stream finished');
                    if (resolveDone) {
                        resolveDone(this.responseBody);
                    }
                    return;
                }

                this.processStreamData(value, resolveText, (line) => this.parseGeminiContent(line));

                // 继续读取下一段数据
                return reader.read().then(processStream);
            };

            return reader.read().then(processStream);

        } catch (error) {
            console.error('Gemini API error:', error);
            if (resolveDone) {
                resolveDone('Error: ' + error.message);
            }
        }
    }
}

/**
 * API 服务提供商映射
 * 用于根据类型创建对应的服务实例
 */
const API_PROVIDERS = {
    "0": OpenAI,        // OpenAI 兼容服务
    "1": Gemini,        // Google Gemini 服务
    // 预留其他服务商
    // "2": XAI,        // xAI Grok
    // "3": Anthropic,  // Anthropic Claude
    // "4": Mistral,    // Mistral AI
};