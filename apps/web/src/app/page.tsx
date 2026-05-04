const summaryCards = [
  { label: "Новые", value: "14", tone: "bg-[#d9ecfb] text-[#0f4c81]" },
  { label: "В работе", value: "9", tone: "bg-[#dff4e8] text-[#17633f]" },
  { label: "Ждут данных", value: "5", tone: "bg-[#fff0d8] text-[#8a5a12]" },
  { label: "Без исполнителя", value: "4", tone: "bg-[#f1e3e6] text-[#7d3140]" },
];

const queueRows = [
  {
    id: "REQ-24051",
    title: "Проверка договора поставки с новым подрядчиком",
    businessUnit: "Закупки",
    priority: "High",
    status: "Новая",
    owner: "Не назначен",
  },
  {
    id: "REQ-24047",
    title: "Согласование претензии по просрочке поставки",
    businessUnit: "Логистика",
    priority: "Critical",
    status: "В работе",
    owner: "Ирина Соколова",
  },
  {
    id: "REQ-24043",
    title: "Корпоративное решение по дочернему обществу",
    businessUnit: "Корпоративный блок",
    priority: "Medium",
    status: "Ждёт данных",
    owner: "Андрей Лебедев",
  },
  {
    id: "REQ-24038",
    title: "Заключение по трудовому спору",
    businessUnit: "HR",
    priority: "High",
    status: "В работе",
    owner: "Мария Власова",
  },
];

const rightRail = [
  "Подключить live-данные из `/api/v1/requests/queue`",
  "Показать фильтры по роли, приоритету и статусу",
  "Связать действия назначения и смены статуса с API",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-8 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[24px] border border-line bg-panel/95 p-6 shadow-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                <span>Право</span>
                <span>Юридическая очередь</span>
              </div>
              <div>
                <h1 className="m-0 text-4xl font-semibold tracking-tight">
                  Операционная очередь юристов
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                  Второй инкремент переводит платформу из foundation-слоя в
                  первый рабочий legal workflow: заявки сохраняются, назначаются
                  исполнителям и двигаются по статусам.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <StatCard label="Блок" value="Queue" />
              <StatCard label="API" value="/requests/queue" />
              <StatCard label="Auth" value="Bearer" />
              <StatCard label="Storage" value="SQLAlchemy" />
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="rounded-[24px] border border-line bg-panel p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="m-0 text-xl font-semibold">Сводка по очереди</h2>
                <p className="mt-2 text-sm text-muted">
                  Основа для экрана старшего юриста и руководителя направления.
                </p>
              </div>
              <div className="rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-medium text-muted">
                SLA baseline
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border border-line bg-white/90 p-4"
                >
                  <div
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${card.tone}`}
                  >
                    {card.label}
                  </div>
                  <div className="mt-4 text-3xl font-semibold">{card.value}</div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[24px] border border-line bg-white/88 p-6 shadow-panel">
            <h2 className="m-0 text-xl font-semibold">Следом в работу</h2>
            <ul className="mt-4 space-y-3 pl-5 text-sm leading-6 text-muted">
              {rightRail.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="rounded-[24px] border border-line bg-panel p-6 shadow-panel">
          <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="m-0 text-xl font-semibold">Рабочий список</h2>
              <p className="mt-2 text-sm text-muted">
                Макет экрана очереди для legal team под реальные API-действия:
                взять в работу, назначить исполнителя, сменить статус.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge>Все заявки</Badge>
              <Badge>Приоритет High+</Badge>
              <Badge>Без исполнителя</Badge>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white/90">
            <div className="grid grid-cols-[1fr_140px_120px_140px_150px] gap-3 border-b border-line px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted">
              <span>Заявка</span>
              <span>Подразделение</span>
              <span>Приоритет</span>
              <span>Статус</span>
              <span>Исполнитель</span>
            </div>

            {queueRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_140px_120px_140px_150px] gap-3 border-b border-line px-4 py-4 last:border-b-0"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted">
                    {row.id}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{row.title}</div>
                </div>
                <div className="text-sm text-muted">{row.businessUnit}</div>
                <div>
                  <PriorityTag priority={row.priority} />
                </div>
                <div>
                  <StatusTag status={row.status} />
                </div>
                <div className="text-sm text-muted">{row.owner}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/85 px-3 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-[#f4f8fb] px-3 py-1 text-muted">
      {children}
    </span>
  );
}

function PriorityTag({ priority }: { priority: string }) {
  const tone =
    priority === "Critical"
      ? "bg-[#f7d6dd] text-[#7d3140]"
      : priority === "High"
        ? "bg-[#fff0d8] text-[#8a5a12]"
        : "bg-[#e7eef5] text-[#486176]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {priority}
    </span>
  );
}

function StatusTag({ status }: { status: string }) {
  const tone =
    status === "В работе"
      ? "bg-[#dff4e8] text-[#17633f]"
      : status === "Ждёт данных"
        ? "bg-[#f2e8ff] text-[#63409d]"
        : "bg-[#d9ecfb] text-[#0f4c81]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}
