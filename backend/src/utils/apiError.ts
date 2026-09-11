// Erro "operacional" com um código HTTP associado — tudo o que os
// handlers lançam de propósito (não encontrado, não autorizado, etc.)
// passa por aqui para que o errorHandler saiba que resposta dar.
export class ApiError extends Error {
  statusCode: number
  details?: unknown

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }

  static badRequest(message = 'Pedido inválido.', details?: unknown) {
    return new ApiError(400, message, details)
  }

  static unauthorized(message = 'Não autenticado.') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'Sem permissão para esta ação.') {
    return new ApiError(403, message)
  }

  static notFound(message = 'Recurso não encontrado.') {
    return new ApiError(404, message)
  }

  static conflict(message = 'Este registo já existe.') {
    return new ApiError(409, message)
  }
}
