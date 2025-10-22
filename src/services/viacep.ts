/**
 * Serviço de integração com API ViaCEP
 * Documentação: https://viacep.com.br/
 */

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressData {
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  // Campos originais do ViaCEP
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

/**
 * Busca endereço pelo CEP usando ViaCEP
 * @param cep - CEP com ou sem máscara
 * @returns Dados do endereço ou null se não encontrado
 */
export async function searchAddressByCEP(cep: string): Promise<AddressData | null> {
  try {
    // Remove máscara do CEP
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Valida se tem 8 dígitos
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }
    
    // Faz requisição para ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao consultar CEP');
    }
    
    const data: ViaCEPResponse = await response.json();
    
    // Verifica se retornou erro
    if (data.erro) {
      return null;
    }
    
    // Mapeia para o formato da aplicação
    return {
      address: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipCode: data.cep || '',
      // Incluir campos originais para compatibilidade
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
}

/**
 * Verifica se o CEP é válido (apenas formato)
 */
export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

