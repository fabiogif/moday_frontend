import {
  isCancelledOrderStatus,
  resolveOrderStatusStepIndex,
} from '../order-status'

describe('order-status', () => {
  it('mapeia status novos do seeder', () => {
    expect(resolveOrderStatusStepIndex('Pedido Recebido')).toBe(0)
    expect(resolveOrderStatusStepIndex('Em Preparação')).toBe(0)
    expect(resolveOrderStatusStepIndex('Pronto para Expedição')).toBe(1)
    expect(resolveOrderStatusStepIndex('Aguardando Entregador')).toBe(2)
    expect(resolveOrderStatusStepIndex('Em Entrega')).toBe(3)
    expect(resolveOrderStatusStepIndex('Entregue')).toBe(4)
  })

  it('mapeia status legados', () => {
    expect(resolveOrderStatusStepIndex('Em Preparo')).toBe(0)
    expect(resolveOrderStatusStepIndex('Pronto')).toBe(1)
    expect(resolveOrderStatusStepIndex('Saiu para entrega')).toBe(2)
    expect(resolveOrderStatusStepIndex('A Caminho')).toBe(3)
    expect(resolveOrderStatusStepIndex('Concluído')).toBe(4)
  })

  it('identifica cancelamento', () => {
    expect(isCancelledOrderStatus('Cancelado')).toBe(true)
    expect(resolveOrderStatusStepIndex('Cancelado')).toBe(-1)
  })
})
