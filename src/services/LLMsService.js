const { OpenAI } = require('openai');
const { LangCache } = require('@redis-ai/langcache');
const { SearchStrategy } = require('@redis-ai/langcache/models/searchstrategy')
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class LLMsService {
    constructor() {
        this._client = new OpenAI({
            baseURL: process.env.LLM_BASE_URL,
            apiKey: process.env.LLM_API_KEY,
        });
        this._langCache = new LangCache({
            serverURL: process.env.REDIS_CLOUD_SERVER_URL,
            cacheId: process.env.REDIS_CLOUD_CACHE_ID,
            apiKey: process.env.REDIS_CLOUD_API_KEY,
        });
    }

    async askLLM({ prompt, model }) {
        const id = `llm-${model}-${nanoid(16)}`;
        const llm_cache = await this._langCache.search({
            prompt,
            searchStrategies: [SearchStrategy.Semantic]
        });

        if (!llm_cache.data.length == 0) {
            return {
                id: id,
                hit_cache: true,
                output: llm_cache.data[0].response
            }
        } else {
            const llm_completion = await this._client.chat.completions.create({
                model,
                max_completion_tokens: 500,
                messages: [
                    { role: 'assistant', content: "You are an instructor in a software education platform called Dicoding. Your task is to provide the best guidance to students by giving them clues and answer their questions. Answer it as efficient possible!" },
                    { role: 'user', content: `${prompt}` }
                ]

            });
            const _saveCache = await this._langCache.set({
                prompt,
                response: llm_completion.choices[0].message.content,
                ttlMillis: 10800000, // 3hs
            });

            return {
                id: id,
                hit_cache: false,
                output: llm_completion.choices[0].message.content
            };
        }
    }
}

module.exports = LLMsService;
