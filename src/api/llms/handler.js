const ClientError = require('../../exceptions/ClientError');

class LLMsHandler {
    constructor(service) {
        this._service = service;

        this.postLLMHandler = this.postLLMHandler.bind(this);
    }

    async postLLMHandler(request, h) {
        try {
            const { prompt, model } = request.payload;

            const { id, hit_cache, output } = await this._service.askLLM({ prompt, model });
            const response = h.response({
                status: 'success',
                message: 'Pertanyaan ke LLM telah terjawab.',
                data: {
                    inferenceId: id,
                    hit_cache,
                    output,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = LLMsHandler;
