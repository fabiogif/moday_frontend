import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouponForm } from './coupon-form';
import '@testing-library/jest-dom';

describe('CouponForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Clear mock history before each test
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render the form correctly in create mode', () => {
    render(
      <CouponForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check for key fields
    expect(screen.getByLabelText(/Código/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de desconto/i)).toBeInTheDocument(); // Check for the label text
    expect(screen.getByRole('button', { name: /Percentual/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Valor fixo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: /Criar cupom/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form values when submitted', async () => {
    const user = userEvent.setup();
    render(
      <CouponForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const codeInput = screen.getByLabelText(/Código/i);
    const nameInput = screen.getByLabelText(/Nome/i);
    const valueInput = screen.getByLabelText(/Valor/i);
    const submitButton = screen.getByRole('button', { name: /Criar cupom/i });

    await user.type(codeInput, 'TESTE25');
    await user.type(nameInput, 'Cupom de Teste');
    await user.clear(valueInput);
    await user.type(valueInput, '25');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({
          code: 'TESTE25',
          name: 'Cupom de Teste',
          discount_type: 'percentage', // default
          discount_value: '25',
        }),
      })
    );
  });
});
