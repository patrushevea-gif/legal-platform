const roleCards = [
  {
    title: "Бизнес-заказчик",
    subtitle: "Подача и отслеживание юридических заявок",
    metric: "1 стартовый сценарий",
  },
  {
    title: "Юрист",
    subtitle: "Очередь входящих задач и контроль SLA",
    metric: "API foundation",
  },
  {
    title: "CLO",
    subtitle: "Видимость нагрузки, сроков и рисков",
    metric: "Dashboard next",
  },
];

const starterItems = [
  "Создать заявку на проверку договора",
  "Поставить базовые справочники ролей и типов заявок",
  "Подготовить слой auth и RBAC для следующего инкремента",
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-line bg-panel/90 p-6 shadow-panel backdrop-blur">
          <div className="inline-flex items-center gap-3 rounded-full border border-line bg-white/75 px-3 py-1 text-sm text-muted">
            <span>Направление: Право</span>
            <span>Проект: Legal Platform</span>
          </div>
          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="m-0 text-4xl font-semibold tracking-tight">Право</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Корпоративный портал юридического департамента. Первый инкремент
                поднимает foundation-слой под заявки, очереди юристов и
                последующие AI-модули.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <StatCard label="Фаза" value="0" />
              <StatCard label="API" value="/api/v1" />
              <StatCard label="Infra" value="4 svc" />
              <StatCard label="Flow" value="Requests" />
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-line bg-panel p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="m-0 text-xl font-semibold">Первый бизнес-сценарий</h2>
                <p className="mt-2 text-sm text-muted">
                  Бизнес-заказчик подаёт заявку, система регистрирует её как
                  новую, а юридическая команда получает базовую очередь на
                  следующем шаге.
                </p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                Foundation
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <FlowStep
                step="01"
                title="Инициирование"
                body="Форма подачи юридической заявки для внутренних заказчиков."
              />
              <FlowStep
                step="02"
                title="Регистрация"
                body="API создаёт карточку заявки со статусом new."
              />
              <FlowStep
                step="03"
                title="Очередь"
                body="Данные готовы для экрана очереди юриста."
              />
            </div>
          </div>

          <aside className="rounded-2xl border border-line bg-white/80 p-6 shadow-panel">
            <h2 className="m-0 text-xl font-semibold">Следом в работу</h2>
            <ul className="mt-4 space-y-3 pl-5 text-sm text-muted">
              {starterItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {roleCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-line bg-panel p-5 shadow-panel"
            >
              <p className="m-0 text-xs uppercase tracking-[0.2em] text-muted">
                role view
              </p>
              <h3 className="mt-3 text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{card.subtitle}</p>
              <div className="mt-5 rounded-xl border border-dashed border-line px-3 py-2 text-sm text-accent">
                {card.metric}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/85 px-3 py-2">
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function FlowStep({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white/85 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted">{step}</div>
      <h3 className="mt-2 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
