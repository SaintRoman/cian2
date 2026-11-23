import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '@/App';

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
}

describe('mobile home prototype', () => {
  it('switches between new and returning user states', async () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Продолжить поиск' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Новый' }));
    expect(screen.getByRole('heading', { name: 'С чего начнём?' })).toBeInTheDocument();
  });

  it('opens results from a vertical entry point', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'Снять' }));
    expect(screen.getByRole('heading', { name: 'Снять квартиру в Москве' })).toBeInTheDocument();
  });

  it('opens results for a new search and a saved search', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Город, район или метро'), 'Хамовники');
    await user.click(screen.getByRole('button', { name: 'Найти' }));
    expect(screen.getByRole('heading', { name: 'Купить квартиру в Хамовники' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Вернуться на главную' }));
    await user.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(screen.getByText('Сохранённый поиск')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Купить квартиру в Сокольники' })).toBeInTheDocument();
  });
});
