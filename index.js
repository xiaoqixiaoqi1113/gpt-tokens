"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testGPTTokens = exports.GPTTokens = exports.getEncodingForModelCached = void 0;
const js_tiktoken_1 = require("js-tiktoken");
const decimal_js_1 = __importDefault(require("decimal.js"));
let modelEncodingCache = {};
function getEncodingForModelCached(model) {
    if (!modelEncodingCache[model]) {
        try {
            if (['gpt-3.5-turbo-1106'].includes(model))
                model = 'gpt-3.5-turbo';
            if (['gpt-4-1106-preview'].includes(model))
                model = 'gpt-4';
            modelEncodingCache[model] = (0, js_tiktoken_1.encodingForModel)(model);
        }
        catch (e) {
            console.error('Model not found. Using cl100k_base encoding.');
            modelEncodingCache[model] = (0, js_tiktoken_1.getEncoding)('cl100k_base');
        }
    }
    return modelEncodingCache[model];
}
exports.getEncodingForModelCached = getEncodingForModelCached;
class GPTTokens {
    constructor(options) {
        // https://openai.com/pricing/
        // gpt-3.5-turbo 4K context
        // $0.0015 / 1K tokens
        this.gpt3_5_turboPromptTokenUnit = new decimal_js_1.default(0.0015).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-3.5-turbo 4K context
        // $0.002 / 1K tokens
        this.gpt3_5_turboCompletionTokenUnit = new decimal_js_1.default(0.002).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-3.5-turbo-16k
        // Prompt: $0.003 / 1K tokens
        this.gpt3_5_turbo_16kPromptTokenUnit = new decimal_js_1.default(0.003).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-3.5-turbo-16k
        // Prompt: $0.004 / 1K tokens
        this.gpt3_5_turbo_16kCompletionTokenUnit = new decimal_js_1.default(0.004).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-3.5-turbo-16k
        // Prompt: $0.001 / 1K tokens
        this.gpt3_5_turbo_1106PromptTokenUnit = new decimal_js_1.default(0.001).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-3.5-turbo-16k
        // Prompt: $0.002 / 1K tokens
        this.gpt3_5_turbo_1106CompletionTokenUnit = new decimal_js_1.default(0.002).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-8k
        // Prompt: $0.03 / 1K tokens
        this.gpt4_8kPromptTokenUnit = new decimal_js_1.default(0.03).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-8k
        // Completion: $0.06 / 1K tokens
        this.gpt4_8kCompletionTokenUnit = new decimal_js_1.default(0.06).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-32k
        // Prompt: $0.06 / 1K tokens
        this.gpt4_32kPromptTokenUnit = new decimal_js_1.default(0.06).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-32k
        // Completion: $0.12 / 1K tokens
        this.gpt4_32kCompletionTokenUnit = new decimal_js_1.default(0.12).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-1106-preview
        // Prompt: $0.01 / 1K tokens
        this.gpt4_turbo_previewPromptTokenUnit = new decimal_js_1.default(0.01).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-1106-preview
        // Completion: $0.03 / 1K tokens
        this.gpt4_turbo_previewCompletionTokenUnit = new decimal_js_1.default(0.03).div(1000).toNumber();
        const { model, messages, } = options;
        if (!GPTTokens.supportModels.includes(model))
            throw new Error(`Model ${model} is not supported`);
        if (model === 'gpt-3.5-turbo')
            this.warning(`${model} may update over time. Returning num tokens assuming gpt-3.5-turbo-0613`);
        if (model === 'gpt-3.5-turbo-16k')
            this.warning(`${model} may update over time. Returning num tokens assuming gpt-3.5-turbo-16k-0613`);
        if (model === 'gpt-4')
            this.warning(`${model} may update over time. Returning num tokens assuming gpt-4-0613`);
        if (model === 'gpt-4-32k')
            this.warning(`${model} may update over time. Returning num tokens assuming gpt-4-32k-0613`);
        this.model = model;
        this.messages = messages;
    }
    // Used USD
    get usedUSD() {
        let price = 0;
        if ([
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0301',
            'gpt-3.5-turbo-0613',
        ].includes(this.model)) {
            const promptUSD = new decimal_js_1.default(this.promptUsedTokens)
                .mul(this.gpt3_5_turboPromptTokenUnit);
            const completionUSD = new decimal_js_1.default(this.completionUsedTokens)
                .mul(this.gpt3_5_turboCompletionTokenUnit);
            price = promptUSD.add(completionUSD).toNumber();
        }
        if ([
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-16k-0613',
        ].includes(this.model)) {
            const promptUSD = new decimal_js_1.default(this.promptUsedTokens)
                .mul(this.gpt3_5_turbo_16kPromptTokenUnit);
            const completionUSD = new decimal_js_1.default(this.completionUsedTokens)
                .mul(this.gpt3_5_turbo_16kCompletionTokenUnit);
            price = promptUSD.add(completionUSD).toNumber();
        }
        if ([
            'gpt-3.5-turbo-1106',
        ].includes(this.model)) {
            const promptUSD = new decimal_js_1.default(this.promptUsedTokens)
                .mul(this.gpt3_5_turbo_1106PromptTokenUnit);
            const completionUSD = new decimal_js_1.default(this.completionUsedTokens)
                .mul(this.gpt3_5_turbo_1106CompletionTokenUnit);
            price = promptUSD.add(completionUSD).toNumber();
        }
        if ([
            'gpt-4',
            'gpt-4-0314',
            'gpt-4-0613',
        ].includes(this.model)) {
            const promptUSD = new decimal_js_1.default(this.promptUsedTokens)
                .mul(this.gpt4_8kPromptTokenUnit);
            const completionUSD = new decimal_js_1.default(this.completionUsedTokens)
                .mul(this.gpt4_8kCompletionTokenUnit);
            price = promptUSD.add(completionUSD).toNumber();
        }
        if ([
            'gpt-4-32k',
            'gpt-4-32k-0314',
            'gpt-4-32k-0613',
        ].includes(this.model)) {
            const promptUSD = new decimal_js_1.default(this.promptUsedTokens)
                .mul(this.gpt4_32kPromptTokenUnit);
            const completionUSD = new decimal_js_1.default(this.completionUsedTokens)
                .mul(this.gpt4_32kCompletionTokenUnit);
            price = promptUSD.add(completionUSD).toNumber();
        }
        if (this.model === 'gpt-4-1106-preview') {
            const promptUSD = new decimal_js_1.default(this.promptUsedTokens)
                .mul(this.gpt4_turbo_previewPromptTokenUnit);
            const completionUSD = new decimal_js_1.default(this.completionUsedTokens)
                .mul(this.gpt4_turbo_previewCompletionTokenUnit);
            price = promptUSD.add(completionUSD).toNumber();
        }
        return price;
    }
    // Used Tokens (total)
    get usedTokens() {
        return this.promptUsedTokens + this.completionUsedTokens;
    }
    // Used Tokens (prompt)
    get promptUsedTokens() {
        return GPTTokens.num_tokens_from_messages(this.promptMessages, this.model);
    }
    // Used Tokens (completion)
    get completionUsedTokens() {
        return this.completionMessage
            ? GPTTokens.contentUsedTokens(this.model, this.completionMessage)
            : 0;
    }
    static contentUsedTokens(model, content) {
        let encoding;
        encoding = getEncodingForModelCached(model);
        return encoding.encode(content).length;
    }
    get lastMessage() {
        return this.messages[this.messages.length - 1];
    }
    get promptMessages() {
        return this.lastMessage.role === 'assistant' ? this.messages.slice(0, -1) : this.messages;
    }
    get completionMessage() {
        return this.lastMessage.role === 'assistant'
            ? this.lastMessage.content
            : '';
    }
    /**
     * Print a warning message.
     * @param message The message to print. Will be prefixed with "Warning: ".
     * @returns void
     */
    warning(message) {
        console.warn('Warning:', message);
    }
    /**
     * Return the number of tokens in a list of messages.
     * @param messages A list of messages.
     * @param model The model to use for encoding.
     * @returns The number of tokens in the messages.
     * @throws If the model is not supported.
     */
    static num_tokens_from_messages(messages, model) {
        let encoding;
        let tokens_per_message;
        let tokens_per_name;
        let num_tokens = 0;
        if ([
            'gpt-3.5-turbo-0301',
        ].includes(model)) {
            tokens_per_message = 4;
            tokens_per_name = -1;
        }
        if ([
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0613',
            'gpt-3.5-turbo-1106',
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-16k-0613',
            'gpt-4',
            'gpt-4-0314',
            'gpt-4-0613',
            'gpt-4-32k',
            'gpt-4-32k-0314',
            'gpt-4-32k-0613',
            'gpt-4-1106-preview',
        ].includes(model)) {
            tokens_per_message = 3;
            tokens_per_name = 1;
        }
        encoding = getEncodingForModelCached(model);
        // Python 2 Typescript by gpt-4
        for (const message of messages) {
            num_tokens += tokens_per_message;
            for (const [key, value] of Object.entries(message)) {
                num_tokens += encoding.encode(value).length;
                if (key === 'name') {
                    num_tokens += tokens_per_name;
                }
            }
        }
        // Supplementary
        // encoding.free()
        // every reply is primed with <|start|>assistant<|message|>
        return num_tokens + 3;
    }
}
GPTTokens.supportModels = [
    'gpt-3.5-turbo-0301',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0613',
    'gpt-3.5-turbo-16k',
    'gpt-3.5-turbo-16k-0613',
    'gpt-3.5-turbo-1106',
    'gpt-4',
    'gpt-4-0314',
    'gpt-4-0613',
    'gpt-4-32k',
    'gpt-4-32k-0314',
    'gpt-4-32k-0613',
    'gpt-4-1106-preview',
];
exports.GPTTokens = GPTTokens;
function testGPTTokens(openai) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `How are u`;
        const messages = [
            { role: 'user', content: prompt },
        ];
        const { length: modelsNum } = GPTTokens.supportModels;
        for (let i = 0; i < modelsNum; i += 1) {
            const model = GPTTokens.supportModels[i];
            console.info(`[${i + 1}/${modelsNum}]: Testing ${model}...`);
            let ignoreModel = false;
            const chatCompletion = yield openai.chat.completions.create({
                model,
                messages,
            })
                .catch(err => {
                ignoreModel = true;
                console.info(`Ignore model ${model}:`, err.message);
            });
            const openaiUsage = chatCompletion === null || chatCompletion === void 0 ? void 0 : chatCompletion.usage;
            const gptTokens = new GPTTokens({
                model,
                messages: [
                    ...messages,
                    ...[chatCompletion === null || chatCompletion === void 0 ? void 0 : chatCompletion.choices[0].message],
                ],
            });
            if (ignoreModel)
                continue;
            if (!openaiUsage) {
                console.error(`Test ${model} failed (openai return usage is null)`);
                continue;
            }
            if (gptTokens.promptUsedTokens !== openaiUsage.prompt_tokens)
                throw new Error(`Test ${model} promptUsedTokens failed (openai: ${openaiUsage.prompt_tokens}/ gpt-tokens: ${gptTokens.promptUsedTokens})`);
            if (gptTokens.completionUsedTokens !== openaiUsage.completion_tokens)
                throw new Error(`Test ${model} completionUsedTokens failed (openai: ${openaiUsage.completion_tokens}/ gpt-tokens: ${gptTokens.completionUsedTokens})`);
            if (gptTokens.usedTokens !== (openaiUsage === null || openaiUsage === void 0 ? void 0 : openaiUsage.total_tokens))
                throw new Error(`Test ${model} usedTokens failed (openai: ${openaiUsage === null || openaiUsage === void 0 ? void 0 : openaiUsage.total_tokens}/ gpt-tokens: ${gptTokens.usedTokens})`);
            console.info('Pass!');
        }
        console.info('Test success!');
    });
}
exports.testGPTTokens = testGPTTokens;
