import {
  isCancelledOrderStatus,
  resolveOrderStatusStepIndex,
} from '../order-status'

describe('order-status', () => {
  it('mapeia status canônicos do seeder', () => {
    expect(resolveOrderStatusStepIndex('Pendente')).toBe(0)
    expect(resolveOrderStatusStepIndex('Aceito')).toBe(1)
    expect(resolveOrderStatusStepIndex('Preparo')).toBe(2)
    expect(resolveOrderStatusStepIndex('Entrega')).toBe(3)
    expect(resolveOrderStatusStepIndex('Concluído')).toBe(4)
  })

  it('mapeia status legados', () => {
    expect(resolveOrderStatusStepIndex('Pedido Recebido')).toBe(0)
    expect(resolveOrderStatusStepIndex('Em Preparação')).toBe(2)
    expect(resolveOrderStatusStepIndex('Pronto para Expedição')).toBe(3)
    expect(resolveOrderStatusStepIndex('Aguardando Entregador')).toBe(3)
    expect(resolveOrderStatusStepIndex('Em Entrega')).toBe(3)
    expect(resolveOrderStatusStepIndex('Entregue')).toBe(4)
    expect(resolveOrderStatusStepIndex('Em Preparo')).toBe(2)
    expect(resolveOrderStatusStepIndex('Pronto')).toBe(3)
    expect(resolveOrderStatusStepIndex('Saiu para entrega')).toBe(3)
    expect(resolveOrderStatusStepIndex('A Caminho')).toBe(3)
  })

  it('identifica cancelamento', () => {
    expect(isCancelledOrderStatus('Cancelado')).toBe(true)
    expect(resolveOrderStatusStepIndex('Cancelado')).toBe(-1)
  })
})
