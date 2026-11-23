import type { IconName } from '@/ui';

export type Vertical = 'buy' | 'rent' | 'newbuild' | 'daily' | 'commercial';
export type UserMode = 'new' | 'returning';
export type Variant = 'A' | 'B';
export type Entry = 'direct' | 'vertical' | 'search' | 'saved';

export const verticals: Array<{ id: Vertical; label: string; icon: IconName }> = [
  { id: 'buy', label: 'Купить', icon: 'MapLocation16' },
  { id: 'rent', label: 'Снять', icon: 'ActionSearch16' },
  { id: 'newbuild', label: 'Новостройки', icon: 'PlaceholderBuilder16' },
  { id: 'daily', label: 'Посуточно', icon: 'FunctionalCalendar24' },
  { id: 'commercial', label: 'Коммерческая', icon: 'PlaceholderAgency16' },
];

export const resultTitles: Record<Vertical, string> = {
  buy: 'Купить квартиру',
  rent: 'Снять квартиру',
  newbuild: 'Новостройки',
  daily: 'Посуточная аренда',
  commercial: 'Коммерческая недвижимость',
};

export function readScenario(search: string) {
  const params = new URLSearchParams(search);
  const userMode: UserMode = params.get('user') === 'new' ? 'new' : 'returning';
  const variant: Variant = params.get('variant') === 'B' ? 'B' : 'A';
  const source = params.get('source');
  const entry: Entry =
    params.get('saved') === 'true'
      ? 'saved'
      : source === 'vertical' || source === 'search'
        ? source
        : 'direct';
  return { userMode, variant, entry, preview: params.get('preview') === '1' };
}

export const goals = {
  home_view: {
    step: 1,
    label: 'Открытие главной',
    trigger: 'После отображения главной или смены состояния пользователя.',
  },
  demo_user_change: {
    step: 1,
    label: 'Смена демо-состояния',
    trigger: 'Нажатие «Новый» или «Возвращаюсь»; служебное событие демо.',
  },
  search_focus: { step: 2, label: 'Начало ввода', trigger: 'Первый фокус поля поиска на экране.' },
  search_submit: {
    step: 2,
    label: 'Новый поиск',
    trigger: 'Отправка формы кнопкой «Найти» или Enter.',
  },
  vertical_select: { step: 2, label: 'Выбор вертикали', trigger: 'Нажатие одной из пяти плашек.' },
  saved_search_open: {
    step: 2,
    label: 'Продолжение поиска',
    trigger: 'Кнопка «Открыть» в сохранённом поиске.',
  },
  results_view: {
    step: 3,
    label: 'Просмотр выдачи',
    trigger: 'После отображения результатов, в том числе при прямом входе.',
  },
  results_back: {
    step: 4,
    label: 'Возврат на главную',
    trigger: 'Кнопка «Вернуться на главную» в выдаче.',
  },
} as const;

export type GoalName = keyof typeof goals;

export const resultScreens = [
  {
    id: 'search',
    title: 'Новый поиск',
    action: 'Найти → выдача',
    goal: 'search_submit',
    source: 'search',
    vertical: 'buy',
    href: '/results/buy?place=Сокольники&source=search&user=new&variant=A',
  },
  ...verticals.map((item) => ({
    id: item.id,
    title: item.label,
    action: `${item.label} → выдача`,
    goal: 'vertical_select',
    source: 'vertical',
    vertical: item.id,
    href: `/results/${item.id}?source=vertical&user=returning&variant=A`,
  })),
  {
    id: 'saved',
    title: 'Сохранённый поиск',
    action: 'Открыть → выдача',
    goal: 'saved_search_open',
    source: 'saved',
    vertical: 'buy',
    href: '/results/buy?place=Сокольники&saved=true&user=returning&variant=A',
  },
] as const;
