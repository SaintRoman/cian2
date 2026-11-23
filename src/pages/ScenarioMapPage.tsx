import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { goals, resultScreens, type GoalName } from '@/scenario';
import { clearGoalLog, getGoalLog, LOG_CHANGED, METRIKA_COUNTER_ID } from '@/analytics/metrika';
import s from './ScenarioMapPage.module.css';

function GoalTag({ name }: { name: GoalName }) {
  return (
    <code className={s.goal}>
      {name} <span>· шаг {goals[name].step}</span>
    </code>
  );
}

function Thumbnail({ href, title }: { href: string; title: string }) {
  const separator = href.includes('?') ? '&' : '?';
  return (
    <Link to={href} className={s.thumbnail} aria-label={`Открыть экран: ${title}`}>
      <iframe
        title={`Миниатюра: ${title}`}
        src={`${href}${separator}preview=1`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
      />
      <span className={s.openScreen}>Открыть экран ↗</span>
    </Link>
  );
}

export function ScenarioMapPage() {
  const [log, setLog] = useState(getGoalLog);
  useEffect(() => {
    document.title = 'Карта сценария · Главная Циана';
    const update = () => setLog(getGoalLog());
    window.addEventListener(LOG_CHANGED, update);
    return () => window.removeEventListener(LOG_CHANGED, update);
  }, []);

  return (
    <div className={s.page}>
      <header className={s.header}>
        <Link to="/" className={s.brand}>
          Циан <span>/ практика</span>
        </Link>
        <nav aria-label="Разделы карты">
          <a href="#screens">Экраны</a>
          <a href="#goals">События</a>
          <a href="#experiment">A/B-тест</a>
          <a href="#event-log">Журнал</a>
        </nav>
      </header>
      <main className={s.main}>
        <section className={s.intro}>
          <div>
            <p className={s.eyebrow}>ГЛАВНАЯ НА МОБИЛЬНЫХ · МОСКВА</p>
            <h1>От главной — к своему поиску</h1>
            <p>
              Два состояния главной, семь вариантов выдачи и события на каждом переходе. Нажмите на
              миниатюру, чтобы пройти сценарий.
            </p>
          </div>
          <Link className={s.primaryLink} to="/?user=returning&variant=A">
            Пройти сценарий ↗
          </Link>
        </section>

        <section id="screens" className={s.section} aria-labelledby="screens-title">
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>01 / КАРТА ЭКРАНОВ</p>
              <h2 id="screens-title">Одна главная, три пути к выдаче</h2>
            </div>
            <p>Шаг 1 — вход · шаг 2 — действие · шаг 3 — результат · шаг 4 — возврат</p>
          </div>

          <div className={s.sourceGrid}>
            <article className={s.sourceCard} id="screen-new">
              <Thumbnail href="/?user=new&variant=A" title="Новый пользователь" />
              <div className={s.screenDescription}>
                <span className={s.screenNumber}>ЭКРАН 01</span>
                <h3>Новый пользователь</h3>
                <p>Без истории. Начинает с формы поиска или выбирает вертикаль.</p>
                <GoalTag name="home_view" />
                <code>user_type: new</code>
                <code>screen: home</code>
                <code>variant: A</code>
              </div>
            </article>
            <div className={s.stateTransition}>
              <span className={s.doubleArrow} aria-hidden="true">
                ↔
              </span>
              <p>Демо-переключатель</p>
              <GoalTag name="demo_user_change" />
              <p>
                Затем новый <code>home_view</code>
              </p>
            </div>
            <article className={s.sourceCard} id="screen-returning">
              <Thumbnail href="/?user=returning&variant=A" title="Возвращающийся пользователь" />
              <div className={s.screenDescription}>
                <span className={s.screenNumber}>ЭКРАН 02</span>
                <h3>Возвращающийся пользователь</h3>
                <p>Может открыть сохранённый поиск, ввести новый или выбрать вертикаль.</p>
                <GoalTag name="home_view" />
                <code>user_type: returning</code>
                <code>screen: home</code>
                <code>variant: A</code>
              </div>
            </article>
          </div>

          <div className={s.branchLabel}>
            Переходы из главной 01 / 02 <span aria-hidden="true">↓</span>
          </div>
          <div className={s.destinationGrid}>
            {resultScreens.map((item, index) => (
              <article key={item.id} className={s.destinationCard}>
                <div className={s.transition}>
                  <span className={s.screenNumber}>
                    {item.id === 'saved' ? 'ИЗ ЭКРАНА 02' : 'ИЗ ЭКРАНА 01 ИЛИ 02'}
                  </span>
                  <strong>{item.action}</strong>
                  {item.id === 'search' && <GoalTag name="search_focus" />}
                  <GoalTag name={item.goal as GoalName} />
                  <span className={s.arrow} aria-label="Переход к экрану ниже" />
                </div>
                <div className={s.destinationScreen}>
                  <Thumbnail href={item.href} title={item.title} />
                  <span className={s.screenNumber}>ЭКРАН {String(index + 3).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <GoalTag name="results_view" />
                  <div className={s.params}>
                    <code>source: {item.source}</code>
                    <code>vertical: {item.vertical}</code>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className={s.returnPath}>
            <span className={s.returnArrow} aria-hidden="true">
              ↶
            </span>
            <div>
              <strong>Из любой выдачи → на главную 01 / 02</strong>
              <p>Кнопка «Назад» сохраняет состояние пользователя и вариант эксперимента.</p>
            </div>
            <GoalTag name="results_back" />
            <span aria-hidden="true">→</span>
            <GoalTag name="home_view" />
          </div>
          <p className={s.note}>
            Форма поиска — часть главной, а не отдельный экран. Реклама, рекомендации и лента
            остаются на главной; её миниатюры показывают первый экран. Каталог компонентов и эта
            карта — служебные страницы, в продуктовую воронку не входят. Миниатюры не отправляют
            события.
          </p>
        </section>

        <section id="goals" className={s.section} aria-labelledby="goals-title">
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>02 / ЯНДЕКС МЕТРИКА</p>
              <h2 id="goals-title">Цели и параметры шагов</h2>
            </div>
            <span className={s.status}>Счётчик {METRIKA_COUNTER_ID} · демо-заглушка</span>
          </div>
          <p className={s.sectionLead}>
            Цели вызываются в обработчиках действий и после отображения экранов. Без настоящего
            счётчика они записываются только в локальный журнал этой вкладки; загрузчик Метрики не
            подключён.
          </p>
          <div className={s.tableWrap}>
            <table className={s.goalTable}>
              <thead>
                <tr>
                  <th>Цель</th>
                  <th>Шаг</th>
                  <th>Когда срабатывает</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(goals).map(([name, goal]) => (
                  <tr key={name}>
                    <td>
                      <code>{name}</code>
                      <span>{goal.label}</span>
                    </td>
                    <td>{goal.step}</td>
                    <td>{goal.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.parameterGrid}>
            <div>
              <h3>В каждом событии</h3>
              <p>
                <code>scenario</code>, <code>experiment</code>, <code>step</code>,{' '}
                <code>screen</code>, <code>user_type</code>, <code>variant</code>.
              </p>
              <p>
                Для поиска и выдачи: <code>source</code>, <code>vertical</code>,{' '}
                <code>query_present</code>. Текст запроса в аналитику не передаётся.
              </p>
            </div>
            <pre aria-label="Пример вызова цели Метрики">{`// 0 — заглушка номера счётчика\nym(0, 'reachGoal', 'saved_search_open', {\n  scenario: 'home_mobile',\n  experiment: 'saved_search_position_v1',\n  step: 2, screen: 'home',\n  user_type: 'returning', variant: 'B',\n  source: 'saved', vertical: 'buy',\n  query_present: true\n});`}</pre>
          </div>
        </section>

        <section id="experiment" className={s.section} aria-labelledby="experiment-title">
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>03 / ДИЗАЙН A/B-ТЕСТА</p>
              <h2 id="experiment-title">Поможем быстрее продолжить поиск</h2>
            </div>
            <span className={s.status}>План проверки · ещё не запущен</span>
          </div>
          <p className={s.hypothesis}>
            Если поднять сохранённый поиск выше формы нового поиска, возвращающиеся пользователи
            чаще откроют свою выдачу: знакомый сценарий станет заметнее и потребует меньше усилий.
          </p>
          <div className={s.variantGrid}>
            <article className={s.variantCard}>
              <span className={s.variantLabel}>A · КОНТРОЛЬ</span>
              <h3>Сначала новая задача</h3>
              <ol>
                <li>Вертикали</li>
                <li>Форма поиска</li>
                <li>Сохранённый поиск</li>
                <li>Рекомендации</li>
              </ol>
              <Link to="/?user=returning&variant=A">Открыть вариант A ↗</Link>
            </article>
            <article className={`${s.variantCard} ${s.variantB}`}>
              <span className={s.variantLabel}>B · ИЗМЕНЕНИЕ</span>
              <h3>Сначала продолжение</h3>
              <ol>
                <li>Вертикали</li>
                <li>
                  <strong>Сохранённый поиск</strong>
                </li>
                <li>Форма поиска</li>
                <li>Рекомендации</li>
              </ol>
              <Link to="/?user=returning&variant=B">Открыть вариант B ↗</Link>
            </article>
          </div>
          <p className={s.note}>
            Вариант B уже можно посмотреть по ссылке. Отличается только порядок двух блоков;
            контент, кнопки и рекомендации одинаковы. Новые пользователи в эксперимент не входят. В
            прототипе вариант задаётся ссылкой, реального распределения трафика нет.
          </p>
          <div className={s.metricGrid}>
            <article>
              <p className={s.eyebrow}>ОСНОВНАЯ МЕТРИКА</p>
              <h3>Открытие сохранённой выдачи</h3>
              <p>
                Доля уникальных участников с <code>home_view</code>, у которых в той же сессии после{' '}
                <code>saved_search_open</code> произошёл <code>results_view</code> с{' '}
                <code>source=saved</code>.
              </p>
              <strong>20% → 23%</strong>
              <p>Ожидаемый минимум эффекта: +3 п.п. (+15% относительно базы).</p>
            </article>
            <article>
              <p className={s.eyebrow}>ОГРАНИЧИВАЮЩАЯ МЕТРИКА</p>
              <h3>Открытие любой выдачи</h3>
              <p>
                Доля тех же участников, увидевших <code>results_view</code> из любого источника в
                той же сессии. Защищает возможность начать новый поиск.
              </p>
              <strong>Падение не больше 2 п.п.</strong>
              <p>
                При предполагаемой базе 60% нижняя граница одностороннего 95% интервала разницы B −
                A должна быть выше −2 п.п.
              </p>
            </article>
          </div>
          <div className={s.samplePanel}>
            <div>
              <span>ВЫБОРКА</span>
              <strong>15 000</strong>
              <p>
                уникальных пользователей всего
                <br />7 500 в A и 7 500 в B
              </p>
            </div>
            <div>
              <span>СРОК ПРИ 1 000 В ДЕНЬ</span>
              <strong>21 день</strong>
              <p>
                полные недели, минимум 14 дней
                <br />и достижение выборки обеих групп
              </p>
            </div>
            <div>
              <span>ПАРАМЕТРЫ</span>
              <strong>95% / 80%</strong>
              <p>
                уровень доверия / мощность
                <br />
                распределение 50 / 50
              </p>
            </div>
          </div>
          <details className={s.calculation}>
            <summary>Откуда взялись выборка и срок</summary>
            <p>
              Фактической статистики нет. Базы 20% и 60%, эффект +3 п.п. и 1 000 подходящих
              пользователей в день — явные плановые допущения. Перед запуском заменить их данными
              Метрики и пересчитать.
            </p>
            <p>
              Для основной метрики: двусторонний z-тест долей, α = 0,05, мощность 80%, pA = 0,20, pB
              = 0,23 → около 2 943 пользователей на группу. Для ограничивающей: односторонняя
              проверка неухудшения, α = 0,05, мощность 80%, база 0,60, допустимое падение 0,02 →
              около 7 420 на группу. Берём большую оценку и округляем до 7 500. Нормальная
              аппроксимация, без поправок на потери трафика.
            </p>
            <p>
              15 000 / 1 000 = 15 дней; округляем до полных недель → 21 день. При 500 подходящих
              пользователях в день потребуется 35 дней. Эксперимент заканчивается после нужного
              числа участников в каждой группе и полных недель; не останавливаем по промежуточной
              значимости.
            </p>
          </details>
          <div className={s.decision}>
            <h3>Как принимаем решение</h3>
            <p>
              Участники — возвращающиеся мобильные пользователи с сохранённым поиском. Закрепить
              вариант по стабильному ID пользователя 50/50 до первого показа; все устройства одного
              пользователя получают один вариант. Сессия — 30 минут бездействия, конверсия считается
              в первой сессии участия.
            </p>
            <p>
              После набора выборки: рост основной метрики статистически значим при двустороннем α =
              0,05, а ограничивающая проходит проверку неухудшения. Если любой критерий не выполнен
              или группы распределились некорректно — вариант B не раскатываем, проверяем данные.{' '}
              <code>demo_user_change</code>, миниатюры и служебные страницы исключаем из анализа.
            </p>
          </div>
        </section>

        <section id="event-log" className={s.section} aria-labelledby="log-title">
          <div className={s.sectionHeading}>
            <div>
              <p className={s.eyebrow}>04 / ПРОВЕРКА РАЗМЕТКИ</p>
              <h2 id="log-title">Журнал событий этой вкладки</h2>
            </div>
            <button className={s.clearButton} type="button" onClick={clearGoalLog}>
              Очистить журнал
            </button>
          </div>
          <p className={s.sectionLead}>
            Откройте экран по миниатюре, пройдите сценарий и вернитесь по ссылке «Карта сценария и
            события». Здесь появятся последние 50 событий. Журнал обновляется только от действий в
            этой вкладке.
          </p>
          {log.length === 0 ? (
            <p className={s.emptyLog}>
              Пока пусто.{' '}
              <Link to="/?user=returning&variant=B">Пройти сохранённый поиск в варианте B →</Link>
            </p>
          ) : (
            <ol className={s.eventLog} aria-label="Записанные события">
              {[...log].reverse().map((event, index) => (
                <li key={`${event.time}-${index}`}>
                  <div>
                    <time dateTime={event.time}>
                      {new Date(event.time).toLocaleTimeString('ru-RU')}
                    </time>
                    <GoalTag name={event.name} />
                  </div>
                  <code>{JSON.stringify(event.params)}</code>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
      <footer className={s.footer}>
        Циан · Главная на мобильных · <Link to="/">Вернуться в прототип</Link>
      </footer>
    </div>
  );
}
