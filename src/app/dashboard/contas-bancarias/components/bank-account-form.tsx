'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import api, { endpoints } from '@/lib/api-client'
import { toast } from 'sonner'
import { Bank, BankAccount, BankAccountFormData } from '@/types/bank-account'
import { Loader2 } from 'lucide-react'

interface BankAccountFormProps {
  open: boolean
  account?: BankAccount | null
  onClose: () => void
  onSuccess: () => void
}

export function BankAccountForm({ open, account, onClose, onSuccess }: BankAccountFormProps) {
  const [banks, setBanks] = useState<Bank[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  
  const [formData, setFormData] = useState<BankAccountFormData>({
    account_type: 'checking',
    bank_code: '',
    agency: '',
    agency_digit: '',
    account_number: '',
    account_digit: '',
    account_holder_name: '',
    account_holder_document: '',
    account_holder_type: 'company',
    pix_key_type: undefined,
    pix_key: '',
    is_primary: false,
    notes: '',
  })

  useEffect(() => {
    if (open) {
      loadBanks()
      if (account) {
        loadAccountDetails()
      }
    }
  }, [open, account])

  const loadBanks = async () => {
    try {
      setIsLoadingBanks(true)
      const response = await api.get(endpoints.bankAccounts.banks)
      if (response.success && response.data) {
        setBanks(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar bancos:', error)
      toast.error('Erro ao carregar lista de bancos')
    } finally {
      setIsLoadingBanks(false)
    }
  }

  const loadAccountDetails = async () => {
    if (!account) return
    
    try {
      const response = await api.get(endpoints.bankAccounts.show(account.uuid))
      if (response.success && response.data) {
        const data = response.data
        setFormData({
          account_type: data.account_type,
          bank_code: data.bank_code,
          agency: data.agency,
          agency_digit: data.agency_digit || '',
          account_number: data.account_number,
          account_digit: data.account_digit,
          account_holder_name: data.account_holder_name,
          account_holder_document: data.account_holder_document,
          account_holder_type: data.account_holder_type,
          pix_key_type: data.pix_key_type || undefined,
          pix_key: data.pix_key || '',
          notes: data.notes || '',
        })
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
      toast.error('Erro ao carregar detalhes da conta')
    }
  }

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.bank_code) {
      toast.error('Selecione um banco')
      return
    }

    if (!formData.account_number || !formData.account_digit) {
      toast.error('Preencha o número e dígito da conta')
      return
    }

    const cleanDocument = formData.account_holder_document.replace(/\D/g, '')
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      toast.error('CPF deve ter 11 dígitos ou CNPJ 14 dígitos')
      return
    }

    try {
      setIsLoading(true)
      
      const dataToSend = {
        ...formData,
        account_holder_document: cleanDocument,
        pix_key: formData.pix_key || undefined,
        pix_key_type: formData.pix_key ? formData.pix_key_type : undefined,
      }

      if (account) {
        // Editar (somente campos permitidos)
        await api.put(endpoints.bankAccounts.update(account.uuid), {
          account_type: dataToSend.account_type,
          agency: dataToSend.agency,
          agency_digit: dataToSend.agency_digit,
          pix_key_type: dataToSend.pix_key_type,
          pix_key: dataToSend.pix_key,
          notes: dataToSend.notes,
        })
        toast.success('Conta bancária atualizada com sucesso!')
      } else {
        // Criar
        await api.post(endpoints.bankAccounts.create, dataToSend)
        toast.success('Conta bancária cadastrada com sucesso!')
      }
      
      onSuccess()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.message || 'Erro ao salvar conta bancária')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{account ? 'Editar' : 'Nova'} Conta Bancária</DialogTitle>
          <DialogDescription>
            {account 
              ? 'Atualize os dados da conta bancária' 
              : 'Cadastre uma conta bancária para receber pagamentos'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Conta */}
          <div>
            <Label>Tipo de Conta *</Label>
            <Select
              value={formData.account_type}
              onValueChange={(value: any) => setFormData({ ...formData, account_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Conta Poupança</SelectItem>
                <SelectItem value="payment">Conta Pagamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Banco */}
          <div>
            <Label>Banco *</Label>
            <Select
              value={formData.bank_code}
              onValueChange={(value) => setFormData({ ...formData, bank_code: value })}
              disabled={isLoadingBanks || !!account}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingBanks ? "Carregando..." : "Selecione o banco"} />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.code} - {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agência e Dígito */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label>Agência *</Label>
              <Input
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value.replace(/\D/g, '') })}
                placeholder="0001"
                maxLength={10}
                required
                disabled={!!account}
              />
            </div>
            <div>
              <Label>Dígito</Label>
              <Input
                value={formData.agency_digit}
                onChange={(e) => setFormData({ ...formData, agency_digit: e.target.value.replace(/\D/g, '') })}
                placeholder="0"
                maxLength={2}
                disabled={!!account}
              />
            </div>
          </div>

          {/* Conta e Dígito */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label>Número da Conta *</Label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value.replace(/\D/g, '') })}
                placeholder="12345678"
                maxLength={20}
                required
                disabled={!!account}
              />
            </div>
            <div>
              <Label>Dígito *</Label>
              <Input
                value={formData.account_digit}
                onChange={(e) => setFormData({ ...formData, account_digit: e.target.value.replace(/\D/g, '') })}
                placeholder="0"
                maxLength={2}
                required
                disabled={!!account}
              />
            </div>
          </div>

          {!account && (
            <>
              {/* Titular */}
              <div>
                <Label>Nome do Titular *</Label>
                <Input
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  placeholder="Nome completo ou razão social"
                  required
                />
              </div>

              {/* Tipo e Documento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Titular *</Label>
                  <Select
                    value={formData.account_holder_type}
                    onValueChange={(value: any) => setFormData({ ...formData, account_holder_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Pessoa Física</SelectItem>
                      <SelectItem value="company">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>CPF/CNPJ *</Label>
                  <Input
                    value={formData.account_holder_document}
                    onChange={(e) => {
                      const formatted = formatDocument(e.target.value)
                      setFormData({ ...formData, account_holder_document: formatted })
                    }}
                    placeholder={formData.account_holder_type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* PIX */}
          <div className="border-t pt-4">
            <Label className="text-base font-semibold">Chave PIX (Opcional)</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label>Tipo de Chave</Label>
                <Select
                  value={formData.pix_key_type || ''}
                  onValueChange={(value) => setFormData({ ...formData, pix_key_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chave</Label>
                <Input
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  placeholder="Digite a chave PIX"
                  disabled={!formData.pix_key_type}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações internas sobre esta conta..."
              rows={3}
            />
          </div>

          {/* Conta Principal */}
          {!account && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked as boolean })}
              />
              <label
                htmlFor="is_primary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Definir como conta principal para recebimentos
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Salvando...' : (account ? 'Atualizar' : 'Cadastrar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

