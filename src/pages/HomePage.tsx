import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Icon } from '@/ui';
import s from './HomePage.module.css';

type Vertical = 'buy' | 'rent' | 'newbuild' | 'daily' | 'commercial';

const verticals: Array<{ id: Vertical; label: string; icon: 'MapLocation16' | 'ActionSearch16' | 'PlaceholderBuilder16' | 'FunctionalCalendar24' | 'PlaceholderAgency16' }> = [
  { id: 'buy', label: 'Купить', icon: 'MapLocation16' },
  { id: 'rent', label: 'Снять', icon: 'ActionSearch16' },
  { id: 'newbuild', label: 'Новостройки', icon: 'PlaceholderBuilder16' },
  { id: 'daily', label: 'Посуточно', icon: 'FunctionalCalendar24' },
  { id: 'commercial', label: 'Коммерческая', icon: 'PlaceholderAgency16' },
];

const resultTitles: Record<Vertical, string> = {
  buy: 'Купить квартиру',
  rent: 'Снять квартиру',
  newbuild: 'Новостройки',
  daily: 'Посуточная аренда',
  commercial: 'Коммерческая недвижимость',
};

const recommendationCards = [
  {
    title: '2-комн. квартира',
    location: 'Сокольники · 8 мин',
    price: '18,8 млн ₽',
    tone: 'warm',
  },
  {
    title: 'Квартира с видом на парк',
    location: 'Хамовники · 11 мин',
    price: '32 млн ₽',
    tone: 'blue',
  },
  {
    title: 'Семейная квартира',
    location: 'Раменки · 6 мин',
    price: '24,5 млн ₽',
    tone: 'green',
  },
] as const;

function AppMark() {
  return (
    <span className={s.brand} aria-label="Циан">
      <span className={s.mark} aria-hidden="true">Ц</span>
      <strong className={s.brandName}>Циан</strong>
    </span>
  );
}

function BottomNavigation() {
  return (
    <nav className={s.bottomNavigation} aria-label="Основная навигация">
      <button type="button" className={s.navItem} aria-current="page">
        <Icon name="MapLocation16" size={20} />
        <span>Главная</span>
      </button>
      <button type="button" className={s.navItem}>
        <Icon name="Heart" size={20} />
        <span>Избранное</span>
      </button>
      <button type="button" className={s.navItem}>
        <Icon name="Message" size={20} />
        <span>Сообщения</span>
      </button>
      <button type="button" className={s.navItem}>
        <Icon name="ActionProfile24" size={20} />
        <span>Профиль</span>
      </button>
    </nav>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [userMode, setUserMode] = useState<'new' | 'returning'>('returning');
  const [vertical, setVertical] = useState<Vertical>('buy');
  const [place, setPlace] = useState('');

  useEffect(() => {
    document.title = 'Циан — недвижимость в Москве';
  }, []);

  function openResults(nextVertical: Vertical, nextPlace?: string, saved = false) {
    const params = new URLSearchParams();
    if (nextPlace?.trim()) params.set('place', nextPlace.trim());
    if (saved) params.set('saved', 'true');
    const query = params.toString();
    navigate(`/results/${nextVertical}${query ? `?${query}` : ''}`);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    openResults(vertical, place || 'Москве');
  }

  return (
    <main className={s.page}>
      <div className={s.phoneFrame}>
        <header className={s.header}>
          <AppMark />
          <div className={s.headerActions}>
            <button type="button" className={s.roundButton} aria-label="Уведомления">
              <Icon name="Bell" size={20} />
            </button>
            <button type="button" className={s.avatar} aria-label="Профиль">Р</button>
          </div>
        </header>

        <div className={s.content}>
          <section className={s.modePanel} aria-label="Демонстрация состояния пользователя">
            <span>Демо-режим</span>
            <div className={s.modeToggle}>
              <button
                type="button"
                aria-pressed={userMode === 'new'}
                onClick={() => setUserMode('new')}
              >
                Новый
              </button>
              <button
                type="button"
                aria-pressed={userMode === 'returning'}
                onClick={() => setUserMode('returning')}
              >
                Возвращаюсь
              </button>
            </div>
          </section>

          <section className={s.hero} aria-labelledby="home-title">
            <p className={s.city}>Москва</p>
            <h1 id="home-title">Найдём место, которое станет вашим</h1>
            <p>Квартиры, новостройки и пространства для бизнеса рядом с вами.</p>
          </section>

          <section aria-label="Выберите цель поиска">
            <div className={s.verticalGrid}>
              {verticals.map((item) => (
                <button
                  className={s.verticalButton}
                  type="button"
                  key={item.id}
                  onClick={() => openResults(item.id)}
                >
                  <span className={s.verticalIcon}><Icon name={item.icon} size={20} /></span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <form className={s.searchPanel} onSubmit={submitSearch}>
            <label htmlFor="place-search">Город, район или метро</label>
            <div className={s.searchInput}>
              <Icon name="ActionSearch16" size={20} />
              <input
                id="place-search"
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                placeholder="Например, Сокольники"
              />
            </div>
            <div className={s.searchControls}>
              <label className={s.selectLabel}>
                Тип недвижимости
                <select value={vertical} onChange={(event) => setVertical(event.target.value as Vertical)}>
                  {verticals.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <Button type="submit" theme="main_primary" className={s.searchSubmit}>Найти</Button>
            </div>
          </form>

          {userMode === 'returning' ? (
            <section className={s.savedSearch} aria-labelledby="saved-search-title">
              <div>
                <p className={s.sectionEyebrow}>ВАШ ПОИСК</p>
                <h2 id="saved-search-title">Продолжить поиск</h2>
                <p>2-комн. квартира в Сокольниках</p>
              </div>
              <Button
                theme="stroke_primary"
                size="XS"
                onClick={() => openResults('buy', 'Сокольники', true)}
              >
                Открыть
              </Button>
            </section>
          ) : (
            <section className={s.welcomeCard} aria-labelledby="welcome-title">
              <div className={s.welcomeIcon}><Icon name="ActionSearch16" size={24} /></div>
              <div>
                <h2 id="welcome-title">С чего начнём?</h2>
                <p>Сохраните поиск — и новые предложения найдут вас сами.</p>
              </div>
            </section>
          )}

          <section className={s.recommendations} aria-labelledby="recommendations-title">
            <div className={s.sectionHeading}>
              <div>
                <p className={s.sectionEyebrow}>ПОДОБРАНО ДЛЯ ВАС</p>
                <h2 id="recommendations-title">Рекомендации</h2>
              </div>
              <button type="button" className={s.textButton}>Все</button>
            </div>
            <div className={s.cardScroller}>
              {recommendationCards.map((card) => (
                <article className={s.propertyCard} key={card.title}>
                  <div className={`${s.propertyVisual} ${s[`visual${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]}`}>
                    <Badge tone="positive">Хорошая цена</Badge>
                    <button type="button" className={s.heartButton} aria-label={`Добавить «${card.title}» в избранное`}>
                      <Icon name="Heart" size={19} />
                    </button>
                  </div>
                  <div className={s.propertyBody}>
                    <h3>{card.title}</h3>
                    <p>{card.location}</p>
                    <strong>{card.price}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className={s.advertisement} aria-label="Рекламное предложение">
            <span className={s.adMark}>Реклама</span>
            <div>
              <p>Выгодная ипотека</p>
              <strong>Рассчитайте платёж за минуту</strong>
            </div>
            <Icon name="ActionChevronRight16" size={20} />
          </aside>

          <section className={s.feed} aria-labelledby="feed-title">
            <div className={s.sectionHeading}>
              <div>
                <p className={s.sectionEyebrow}>МОСКВА</p>
                <h2 id="feed-title">На что обратить внимание</h2>
              </div>
            </div>
            <article className={s.feedCard}>
              <div className={s.feedVisual}><Icon name="MapLocation16" size={28} /></div>
              <div>
                <h3>Районы для прогулок у воды</h3>
                <p>Гид по местам, где город становится тише.</p>
              </div>
              <Icon name="ActionChevronRight16" size={18} />
            </article>
          </section>
        </div>

        <BottomNavigation />
      </div>
    </main>
  );
}

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vertical = 'buy' } = useParams();
  const selectedVertical = (vertical in resultTitles ? vertical : 'buy') as Vertical;
  const search = new URLSearchParams(location.search);
  const place = search.get('place');
  const isSaved = search.get('saved') === 'true';
  const title = `${resultTitles[selectedVertical]}${place ? ` в ${place}` : ' в Москве'}`;

  useEffect(() => {
    document.title = `${title} — Циан`;
  }, [title]);

  return (
    <main className={s.page}>
      <div className={s.phoneFrame}>
        <header className={s.resultsHeader}>
          <button type="button" onClick={() => navigate(-1)} className={s.backButton} aria-label="Вернуться на главную">
            <Icon name="ActionChevronLeft16" size={22} />
          </button>
          <AppMark />
          <button type="button" className={s.roundButton} aria-label="Открыть карту">
            <Icon name="ActionMap16" size={20} />
          </button>
        </header>
        <div className={s.resultsContent}>
          {isSaved && <Badge tone="main">Сохранённый поиск</Badge>}
          <h1>{title}</h1>
          <p className={s.resultsMeta}>Найдено 1 248 предложений · актуально сейчас</p>
          <div className={s.filterRow} aria-label="Фильтры поиска">
            <button type="button">Фильтры</button>
            <button type="button">На карте</button>
            <button type="button">Цена</button>
          </div>
          <div className={s.resultList}>
            {recommendationCards.slice(0, 2).map((card, index) => (
              <article className={s.resultCard} key={card.title}>
                <div className={`${s.resultVisual} ${s[`visual${index ? 'Blue' : 'Warm'}`]}`} />
                <div>
                  <h2>{card.title}</h2>
                  <p>{card.location}</p>
                  <strong>{card.price}</strong>
                  <Badge tone={index ? 'main' : 'positive'}>{index ? 'Только на Циан' : 'Хорошая цена'}</Badge>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
