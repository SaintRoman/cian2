import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { clearGoalLog, getGoalLog } from '@/analytics/metrika';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('mobile home prototype', () => {
  beforeEach(clearGoalLog);
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
    expect(
      screen.getByRole('heading', { name: 'Купить квартиру в Хамовники' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Вернуться на главную' }));
    await user.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(screen.getByText('Сохранённый поиск')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Купить квартиру в Сокольники' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['Купить', 'buy'],
    ['Снять', 'rent'],
    ['Новостройки', 'newbuild'],
    ['Посуточно', 'daily'],
    ['Коммерческая', 'commercial'],
  ])('tracks the %s vertical through to a displayed results screen', async (label, vertical) => {
    renderApp('/?user=new&variant=A');
    await userEvent.click(screen.getByRole('button', { name: label }));
    expect(getGoalLog().map((event) => [event.name, event.params.step])).toEqual([
      ['home_view', 1],
      ['vertical_select', 2],
      ['results_view', 3],
    ]);
    expect(getGoalLog().at(-1)?.params).toMatchObject({
      vertical,
      source: 'vertical',
      user_type: 'new',
      variant: 'A',
    });
  });

  it('tracks a submitted query without recording its text', async () => {
    renderApp('/?user=new');
    const input = screen.getByLabelText('Город, район или метро');
    await userEvent.type(input, 'Сокольники');
    await userEvent.tab();
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    expect(getGoalLog().map((event) => event.name)).toEqual([
      'home_view',
      'search_focus',
      'search_submit',
      'results_view',
    ]);
    expect(getGoalLog().at(-1)?.params).toMatchObject({ query_present: true, source: 'search' });
    expect(JSON.stringify(getGoalLog())).not.toContain('Сокольники');
  });

  it('puts saved search first in B, preserves the variant and records a complete round trip', async () => {
    renderApp('/?user=returning&variant=B');
    const saved = screen.getByRole('heading', { name: 'Продолжить поиск' });
    const form = screen.getByLabelText('Город, район или метро');
    expect(saved.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    await userEvent.click(screen.getByRole('button', { name: 'Вернуться на главную' }));
    expect(getGoalLog().map((event) => event.name)).toEqual([
      'home_view',
      'saved_search_open',
      'results_view',
      'results_back',
      'home_view',
    ]);
    expect(getGoalLog().every((event) => event.params.variant === 'B')).toBe(true);
  });

  it('emits one initial view under StrictMode and never calls a placeholder counter', () => {
    window.ym = vi.fn();
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </StrictMode>,
    );
    expect(getGoalLog().filter((event) => event.name === 'home_view')).toHaveLength(1);
    expect(window.ym).not.toHaveBeenCalled();
    delete window.ym;
  });

  it('does not record views or actions from embedded map previews', async () => {
    renderApp('/?user=returning&variant=B&preview=1');
    await userEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(
      screen.getByRole('heading', { name: 'Купить квартиру в Сокольники' }),
    ).toBeInTheDocument();
    expect(getGoalLog()).toEqual([]);
  });

  it('opens the map directly with all nine screen previews and the experiment brief', () => {
    const { container } = renderApp('/map');
    expect(
      screen.getByRole('heading', { name: 'Одна главная, три пути к выдаче' }),
    ).toBeInTheDocument();
    const frames = container.querySelectorAll('iframe');
    expect(frames).toHaveLength(9);
    expect([...frames].every((frame) => frame.src.includes('preview=1'))).toBe(true);
    expect(screen.getByText('15 000')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Открыть вариант B ↗' })).toHaveAttribute(
      'href',
      '/?user=returning&variant=B',
    );
    expect(getGoalLog()).toEqual([]);
  });
});
