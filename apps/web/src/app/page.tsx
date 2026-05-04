"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type UserRole =
  | "business_requester"
  | "legal_counsel"
  | "senior_legal_counsel"
  | "clo"
  | "system_admin"
  | "auditor";

type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: CurrentUser;
};

type LegalRequest = {
  id: string;
  title: string;
  request_type: string;
  priority: string;
  business_unit: string;
  description: string;
  status: string;
  created_by_user_id: string;
  created_by_user_name: string | null;
  assigned_to_user_id: string | null;
  assigned_to_user_name: string | null;
  assigned_at: string | null;
  created_at: string;
  updated_at: string;
};

type QueueSummaryItem = {
  key: string;
  label: string;
  count: number;
};

type QueueResponse = {
  items: LegalRequest[];
  summary: QueueSummaryItem[];
  total: number;
};

type LegalTeamMember = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
};

type RequestFormState = {
  title: string;
  request_type: string;
  priority: string;
  business_unit: string;
  description: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const demoUsers = [
  {
    label: "Бизнес-заказчик",
    email: "requester@legal-platform.local",
    password: "Requester123!",
  },
  {
    label: "Юрист",
    email: "lawyer@legal-platform.local",
    password: "Lawyer123!",
  },
  {
    label: "Администратор",
    email: "admin@legal-platform.local",
    password: "Admin123!",
  },
];

const requestTypeOptions = [
  { value: "contract_review", label: "Проверка договора" },
  { value: "claim", label: "Претензионная работа" },
  { value: "corporate_action", label: "Корпоративное действие" },
  { value: "procurement_support", label: "Поддержка закупки" },
  { value: "employment_matter", label: "Трудовой вопрос" },
  { value: "general_consultation", label: "Общая консультация" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const statusOptions = [
  { value: "in_review", label: "В работе" },
  { value: "waiting_for_info", label: "Ждёт данных" },
  { value: "completed", label: "Завершена" },
];

const initialRequestForm: RequestFormState = {
  title: "",
  request_type: "contract_review",
  priority: "medium",
  business_unit: "",
  description: "",
};

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [requests, setRequests] = useState<LegalRequest[]>([]);
  const [legalTeam, setLegalTeam] = useState<LegalTeamMember[]>([]);
  const [requestForm, setRequestForm] = useState<RequestFormState>(initialRequestForm);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canCreateRequests =
    user?.role === "business_requester" || user?.role === "system_admin";
  const canManageQueue =
    user?.role === "legal_counsel" ||
    user?.role === "senior_legal_counsel" ||
    user?.role === "clo" ||
    user?.role === "system_admin" ||
    user?.role === "auditor";

  useEffect(() => {
    const savedToken = window.localStorage.getItem("legal-platform-token");
    const savedUser = window.localStorage.getItem("legal-platform-user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser) as CurrentUser);
    }
  }, []);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    void refreshData(token, user.role);
  }, [token, user]);

  const summaryCards = useMemo(() => queue?.summary ?? [], [queue]);

  async function refreshData(activeToken: string, role: UserRole) {
    setError(null);
    try {
      if (
        role === "legal_counsel" ||
        role === "senior_legal_counsel" ||
        role === "clo" ||
        role === "system_admin" ||
        role === "auditor"
      ) {
        const [queueResponse, legalTeamResponse] = await Promise.all([
          apiFetch<QueueResponse>("/api/v1/requests/queue", {
            token: activeToken,
          }),
          apiFetch<LegalTeamMember[]>("/api/v1/users/legal-team", {
            token: activeToken,
          }),
        ]);
        setQueue(queueResponse);
        setLegalTeam(legalTeamResponse);
      } else {
        setQueue(null);
        setLegalTeam([]);
      }

      const requestList = await apiFetch<{ items: LegalRequest[]; total: number }>(
        "/api/v1/requests",
        { token: activeToken }
      );
      setRequests(requestList.items);
    } catch (fetchError) {
      setError(readError(fetchError));
    }
  }

  async function login(email: string, password: string) {
    setBusyAction(`login:${email}`);
    setError(null);
    setInfo(null);
    try {
      const response = await apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(response.access_token);
      setUser(response.user);
      window.localStorage.setItem("legal-platform-token", response.access_token);
      window.localStorage.setItem("legal-platform-user", JSON.stringify(response.user));
      setInfo(`Вход выполнен: ${response.user.full_name}`);
    } catch (loginError) {
      setError(readError(loginError));
    } finally {
      setBusyAction(null);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    setQueue(null);
    setRequests([]);
    setLegalTeam([]);
    setError(null);
    setInfo("Сессия завершена");
    window.localStorage.removeItem("legal-platform-token");
    window.localStorage.removeItem("legal-platform-user");
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setBusyAction("create-request");
    setError(null);
    setInfo(null);
    try {
      await apiFetch<LegalRequest>("/api/v1/requests", {
        method: "POST",
        token,
        body: JSON.stringify(requestForm),
      });
      setRequestForm(initialRequestForm);
      setInfo("Заявка создана");
      if (user) {
        await refreshData(token, user.role);
      }
    } catch (createError) {
      setError(readError(createError));
    } finally {
      setBusyAction(null);
    }
  }

  async function assignRequest(requestId: string, assigneeUserId: string) {
    if (!token || !assigneeUserId || !user) {
      return;
    }
    setBusyAction(`assign:${requestId}`);
    setError(null);
    setInfo(null);
    try {
      await apiFetch<LegalRequest>(`/api/v1/requests/${requestId}/assign`, {
        method: "POST",
        token,
        body: JSON.stringify({ assignee_user_id: assigneeUserId }),
      });
      setInfo("Исполнитель назначен");
      await refreshData(token, user.role);
    } catch (assignError) {
      setError(readError(assignError));
    } finally {
      setBusyAction(null);
    }
  }

  async function updateStatus(requestId: string, nextStatus: string) {
    if (!token || !user) {
      return;
    }
    setBusyAction(`status:${requestId}:${nextStatus}`);
    setError(null);
    setInfo(null);
    try {
      await apiFetch<LegalRequest>(`/api/v1/requests/${requestId}/status`, {
        method: "POST",
        token,
        body: JSON.stringify({ status: nextStatus }),
      });
      setInfo("Статус обновлён");
      await refreshData(token, user.role);
    } catch (statusError) {
      setError(readError(statusError));
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-8 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[24px] border border-line bg-panel/95 p-6 shadow-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                <span>Право</span>
                <span>Live demo portal</span>
              </div>
              <div>
                <h1 className="m-0 text-4xl font-semibold tracking-tight">
                  Корпоративный LegalOps-портал
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                  Текущий инкремент связывает web с API: вход, создание заявки,
                  просмотр списка и операционная очередь юристов теперь работают
                  поверх живых эндпоинтов.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <StatCard label="Web" value="Connected" />
              <StatCard label="Auth" value="Live" />
              <StatCard label="Queue" value={queue ? String(queue.total) : "-"} />
              <StatCard label="Role" value={user ? roleLabel[user.role] : "Guest"} />
            </div>
          </div>
        </header>

        {error ? <Banner tone="error">{error}</Banner> : null}
        {info ? <Banner tone="info">{info}</Banner> : null}

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.45fr]">
          <aside className="rounded-[24px] border border-line bg-white/88 p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="m-0 text-xl font-semibold">Сессия</h2>
                <p className="mt-2 text-sm text-muted">
                  Вход по demo-пользователям из seed-набора API.
                </p>
              </div>
              {user ? (
                <button
                  className="rounded-full border border-line px-3 py-1 text-sm text-muted transition hover:bg-[#eef4f8]"
                  onClick={logout}
                  type="button"
                >
                  Выйти
                </button>
              ) : null}
            </div>

            {user ? (
              <div className="mt-5 rounded-2xl border border-line bg-[#f6fafc] p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">
                  Активный пользователь
                </div>
                <div className="mt-2 text-lg font-semibold">{user.full_name}</div>
                <div className="mt-1 text-sm text-muted">{user.email}</div>
                <div className="mt-4 inline-flex rounded-full bg-[#d9ecfb] px-3 py-1 text-xs font-semibold text-[#0f4c81]">
                  {roleLabel[user.role]}
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {demoUsers.map((demoUser) => (
                  <button
                    key={demoUser.email}
                    className="flex w-full items-start justify-between rounded-2xl border border-line bg-[#f8fbfd] px-4 py-4 text-left transition hover:bg-[#eef4f8]"
                    onClick={() => void login(demoUser.email, demoUser.password)}
                    type="button"
                  >
                    <div>
                      <div className="text-sm font-semibold">{demoUser.label}</div>
                      <div className="mt-1 text-xs text-muted">{demoUser.email}</div>
                    </div>
                    <span className="text-xs text-muted">
                      {busyAction === `login:${demoUser.email}` ? "Вход..." : "Войти"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
              <div className="font-semibold text-ink">Что уже живое</div>
              <ul className="mt-3 space-y-2 pl-5">
                <li>Авторизация через `/api/v1/auth/login`</li>
                <li>Подача заявки через `/api/v1/requests`</li>
                <li>Очередь юристов через `/api/v1/requests/queue`</li>
              </ul>
            </div>
          </aside>

          <div className="flex flex-col gap-4">
            {canCreateRequests ? (
              <section className="rounded-[24px] border border-line bg-panel p-6 shadow-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="m-0 text-xl font-semibold">Новая заявка</h2>
                    <p className="mt-2 text-sm text-muted">
                      Первый рабочий сценарий для бизнес-заказчика.
                    </p>
                  </div>
                  <div className="rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-medium text-muted">
                    Request intake
                  </div>
                </div>

                <form className="mt-5 grid gap-4" onSubmit={submitRequest}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Заголовок">
                      <input
                        className={inputClassName}
                        onChange={(event) =>
                          setRequestForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        required
                        value={requestForm.title}
                      />
                    </Field>
                    <Field label="Подразделение">
                      <input
                        className={inputClassName}
                        onChange={(event) =>
                          setRequestForm((current) => ({
                            ...current,
                            business_unit: event.target.value,
                          }))
                        }
                        required
                        value={requestForm.business_unit}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Тип заявки">
                      <select
                        className={inputClassName}
                        onChange={(event) =>
                          setRequestForm((current) => ({
                            ...current,
                            request_type: event.target.value,
                          }))
                        }
                        value={requestForm.request_type}
                      >
                        {requestTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Приоритет">
                      <select
                        className={inputClassName}
                        onChange={(event) =>
                          setRequestForm((current) => ({
                            ...current,
                            priority: event.target.value,
                          }))
                        }
                        value={requestForm.priority}
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Описание">
                    <textarea
                      className={`${inputClassName} min-h-32 resize-y`}
                      onChange={(event) =>
                        setRequestForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      required
                      value={requestForm.description}
                    />
                  </Field>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted">
                      После создания заявка сразу попадает в общий реестр и очередь.
                    </div>
                    <button
                      className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      disabled={busyAction === "create-request"}
                      type="submit"
                    >
                      {busyAction === "create-request" ? "Создание..." : "Создать заявку"}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <section className="rounded-[24px] border border-line bg-panel p-6 shadow-panel">
              <div className="flex flex-col gap-3 border-b border-line pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="m-0 text-xl font-semibold">
                    {canManageQueue ? "Юридическая очередь" : "Мои заявки"}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {canManageQueue
                      ? "Живые данные из API для юристов и руководителей направления."
                      : "Список заявок бизнес-заказчика после входа в систему."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(canManageQueue ? summaryCards : []).map((card) => (
                    <Badge key={card.key}>
                      {card.label}: {card.count}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white/90">
                <div className="grid grid-cols-[1.2fr_140px_110px_150px_170px] gap-3 border-b border-line px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted">
                  <span>Заявка</span>
                  <span>Подразделение</span>
                  <span>Приоритет</span>
                  <span>Статус</span>
                  <span>Исполнитель</span>
                </div>

                {(canManageQueue ? queue?.items : requests)?.map((item) => (
                  <RequestRow
                    busyAction={busyAction}
                    canManageQueue={canManageQueue}
                    item={item}
                    key={item.id}
                    legalTeam={legalTeam}
                    onAssign={assignRequest}
                    onUpdateStatus={updateStatus}
                  />
                )) ?? (
                  <div className="px-4 py-6 text-sm text-muted">
                    Войдите в систему, чтобы загрузить данные.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function RequestRow({
  item,
  canManageQueue,
  legalTeam,
  onAssign,
  onUpdateStatus,
  busyAction,
}: {
  item: LegalRequest;
  canManageQueue: boolean;
  legalTeam: LegalTeamMember[];
  onAssign: (requestId: string, assigneeUserId: string) => Promise<void>;
  onUpdateStatus: (requestId: string, nextStatus: string) => Promise<void>;
  busyAction: string | null;
}) {
  const [selectedAssignee, setSelectedAssignee] = useState(item.assigned_to_user_id ?? "");
  const [selectedStatus, setSelectedStatus] = useState(item.status);

  useEffect(() => {
    setSelectedAssignee(item.assigned_to_user_id ?? "");
    setSelectedStatus(item.status);
  }, [item.assigned_to_user_id, item.status]);

  return (
    <div className="grid grid-cols-[1.2fr_140px_110px_150px_170px] gap-3 border-b border-line px-4 py-4 last:border-b-0">
      <div>
        <div className="text-xs uppercase tracking-[0.16em] text-muted">{item.id}</div>
        <div className="mt-2 text-sm font-semibold">{item.title}</div>
        <div className="mt-2 text-xs text-muted">
          Инициатор: {item.created_by_user_name ?? item.created_by_user_id}
        </div>
      </div>
      <div className="text-sm text-muted">{item.business_unit}</div>
      <div>
        <PriorityTag priority={item.priority} />
      </div>
      <div className="space-y-2">
        <StatusTag status={statusLabel[item.status] ?? item.status} />
        {canManageQueue ? (
          <select
            className={miniInputClassName}
            onChange={(event) => setSelectedStatus(event.target.value)}
            value={selectedStatus}
          >
            <option value={item.status}>{statusLabel[item.status] ?? item.status}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
        {canManageQueue ? (
          <button
            className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:bg-[#eef4f8]"
            disabled={busyAction === `status:${item.id}:${selectedStatus}`}
            onClick={() => void onUpdateStatus(item.id, selectedStatus)}
            type="button"
          >
            {busyAction === `status:${item.id}:${selectedStatus}` ? "Сохранение..." : "Сменить статус"}
          </button>
        ) : null}
      </div>
      <div className="space-y-2">
        <div className="text-sm text-muted">
          {item.assigned_to_user_name ?? "Не назначен"}
        </div>
        {canManageQueue ? (
          <select
            className={miniInputClassName}
            onChange={(event) => setSelectedAssignee(event.target.value)}
            value={selectedAssignee}
          >
            <option value="">Выберите исполнителя</option>
            {legalTeam.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name}
              </option>
            ))}
          </select>
        ) : null}
        {canManageQueue ? (
          <button
            className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:bg-[#eef4f8]"
            disabled={!selectedAssignee || busyAction === `assign:${item.id}`}
            onClick={() => void onAssign(item.id, selectedAssignee)}
            type="button"
          >
            {busyAction === `assign:${item.id}` ? "Назначение..." : "Назначить"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
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

function Banner({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "error" | "info";
}) {
  const className =
    tone === "error"
      ? "border-[#f0c8d0] bg-[#fff3f5] text-[#7d3140]"
      : "border-[#cfe0ec] bg-[#f4f9fc] text-[#365068]";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${className}`}>{children}</div>;
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
    priority === "critical"
      ? "bg-[#f7d6dd] text-[#7d3140]"
      : priority === "high"
        ? "bg-[#fff0d8] text-[#8a5a12]"
        : "bg-[#e7eef5] text-[#486176]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {priority.toUpperCase()}
    </span>
  );
}

function StatusTag({ status }: { status: string }) {
  const tone =
    status === "В работе"
      ? "bg-[#dff4e8] text-[#17633f]"
      : status === "Ждёт данных"
        ? "bg-[#f2e8ff] text-[#63409d]"
        : status === "Завершена"
          ? "bg-[#e7eef5] text-[#486176]"
          : "bg-[#d9ecfb] text-[#0f4c81]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  );
}

async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: string;
  } = {}
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { detail?: string }
      | null;
    throw new Error(payload?.detail ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function readError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Произошла непредвиденная ошибка";
}

const roleLabel: Record<UserRole, string> = {
  business_requester: "Бизнес-заказчик",
  legal_counsel: "Юрист",
  senior_legal_counsel: "Старший юрист",
  clo: "CLO",
  system_admin: "Администратор",
  auditor: "Аудитор",
};

const statusLabel: Record<string, string> = {
  new: "Новая",
  in_review: "В работе",
  waiting_for_info: "Ждёт данных",
  completed: "Завершена",
};

const inputClassName =
  "w-full rounded-2xl border border-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent";
const miniInputClassName =
  "w-full rounded-xl border border-line bg-white px-2.5 py-2 text-xs outline-none transition focus:border-accent";
