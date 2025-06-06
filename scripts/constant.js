
// 对话历史记录存储的key
const MESSAGE_HISTORY_STORAGE_KEY = 'message-history';

// 划词选中的文本存储的key
const SELECTED_TEXT_STORAGE_KEY = 'selected-text';


const DEFAULT_TRANSLATE_SETTING = {
    'identity': 'translate',
    'title': '翻译',
    'icon': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16">
  <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/>
  <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31"/>
</svg>`,
    'promptText': `# 精准网页翻译（仅输出目标语言）

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

【注意：请直接呈现完美译文，不要包含任何其他内容】`
}

const DEFAULT_SUMMARIZE_SETTING = {
    'identity': 'summarize',
    'title': '总结',
    'icon': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-text" viewBox="0 0 16 16">
   <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z"/>
   <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
</svg>`,
    'promptText': `You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the text delimited by triple quotes and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the Simplified Chinese language. """ {{text}} """`
}

// const DEFAULT_CHAT_SETTING = {
//     'identity': 'chat',
//     'title': '对话',
//     'icon': `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat" viewBox="0 0 16 16">
//   <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
// </svg>`,
//     'promptText': `You are a helpful assistant...`
// }

const DEFAULT_PROMPT_LIST = [DEFAULT_TRANSLATE_SETTING, DEFAULT_SUMMARIZE_SETTING];

const CUSTOM_PROMPT_STORAGE_KEY = 'custom-prompt-list';






