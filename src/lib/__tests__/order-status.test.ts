import {
  isCancelledOrderStatus,
  isTerminalOrderStatus,
  isFinalStatus,
  resolveOrderStatusStepIndex,
  getNextStatus,
  getNextStatusName,
} from '../order-status'

describe('order-status', () => {
  it('mapeia os 5 status canônicos do seeder', () => {
    expect(resolveOrderStatusStepIndex('Pendente')).toBe(0)
    expect(resolveOrderStatusStepIndex('Aceito')).toBe(1)
    expect(resolveOrderStatusStepIndex('Preparo')).toBe(2)
    expect(resolveOrderStatusStepIndex('Concluído')).toBe(3)
  })

  it('dobra sinônimos legados de "saiu para entrega/pronto" para dentro de Preparo', () => {
    expect(resolveOrderStatusStepIndex('Entrega')).toBe(2)
    expect(resolveOrderStatusStepIndex('Em Preparo')).toBe(2)
    expect(resolveOrderStatusStepIndex('Em Preparação')).toBe(2)
    expect(resolveOrderStatusStepIndex('Pronto para Expedição')).toBe(2)
    expect(resolveOrderStatusStepIndex('Aguardando Entregador')).toBe(2)
    expect(resolveOrderStatusStepIndex('Em Entrega')).toBe(2)
    expect(resolveOrderStatusStepIndex('Pronto')).toBe(2)
    expect(resolveOrderStatusStepIndex('Saiu para entrega')).toBe(2)
    expect(resolveOrderStatusStepIndex('A Caminho')).toBe(2)
  })

  it('mapeia outros status legados para o índice canônico correto', () => {
    expect(resolveOrderStatusStepIndex('Pedido Recebido')).toBe(0)
    expect(resolveOrderStatusStepIndex('Confirmado')).toBe(1)
    expect(resolveOrderStatusStepIndex('Entregue')).toBe(3)
  })

  it('identifica cancelamento', () => {
    expect(isCancelledOrderStatus('Cancelado')).toBe(true)
    expect(resolveOrderStatusStepIndex('Cancelado')).toBe(-1)
  })

  it('isTerminalOrderStatus reconhece Concluído e Cancelado', () => {
    expect(isTerminalOrderStatus('Concluído')).toBe(true)
    expect(isTerminalOrderStatus('Cancelado')).toBe(true)
    expect(isTerminalOrderStatus('Preparo')).toBe(false)
  })

  it('isFinalStatus só reconhece Concluído e Cancelado', () => {
    expect(isFinalStatus('Concluído')).toBe(true)
    expect(isFinalStatus('Cancelado')).toBe(true)
    expect(isFinalStatus('Preparo')).toBe(false)
    expect(isFinalStatus('Entregue')).toBe(false)
    expect(isFinalStatus(null)).toBe(false)
  })

  it('getNextStatus segue o fluxo canônico de 3 saltos', () => {
    expect(getNextStatus('Pendente')).toBe('Aceito')
    expect(getNextStatus('Aceito')).toBe('Preparo')
    expect(getNextStatus('Preparo')).toBe('Concluído')
    expect(getNextStatus('Concluído')).toBeNull()
    expect(getNextStatus('Cancelado')).toBeNull()
  })

  it('getNextStatusName espelha getNextStatus', () => {
    expect(getNextStatusName('Aceito')).toBe('Preparo')
  })
})
