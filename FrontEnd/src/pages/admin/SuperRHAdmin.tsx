const statCards = [
  {
    label: 'Active employees',
    value: '142',
    note: 'Mock data',
  },
  {
    label: 'Knowledge files',
    value: '384',
    note: 'Mock data',
  },
  {
    label: 'Pending reviews',
    value: '7',
    note: 'Mock data',
  },
]

const signalCards = [
  {
    title: 'Policy coverage',
    detail: 'Tagged documents',
    value: '82%',
    progress: 82,
  },
  {
    title: 'Ingestion health',
    detail: 'Clean extractions',
    value: '94%',
    progress: 94,
  },
  {
    title: 'Access reviews',
    detail: 'Completed this week',
    value: '6/9',
    progress: 68,
  },
]

const activityItems = [
  {
    title: 'Policy refresh queued',
    detail: 'Finance handbook · 08:45',
  },
  {
    title: 'New workspace approved',
    detail: 'Recruiting · 09:12',
  },
  {
    title: 'Assistant response audit',
    detail: 'Benefits FAQ · 11:30',
  },
]

const approvalItems = [
  {
    title: 'Document access request',
    detail: 'Payroll policy · 2 pending',
  },
  {
    title: 'New manager role',
    detail: 'People ops · approval needed',
  },
  {
    title: 'Retention report export',
    detail: 'Analytics · scheduled',
  },
]

function SuperRHAdmin() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Mockup overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            SuperRH control center
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is a visual placeholder for workforce health,
            knowledge governance, and compliance signals.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-background px-3 py-1">
              Workspace: SuperRH
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1">
              Isolation: Enabled
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1">
              Sync cadence: Daily
            </span>
          </div>
        </div>
        <div className="grid gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border bg-card p-4 shadow-card"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {signalCards.map((card) => (
          <div key={card.title} className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {card.title}
            </p>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">
              {card.detail} · mock data
            </p>
            <div className="mt-4 h-2 rounded-full bg-doku-cream">
              <div
                className="h-2 rounded-full bg-doku-rose"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Recent activity
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                Knowledge ops timeline
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">Mock feed</span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {activityItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-background p-3"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Pending approvals
            </p>
            <h2 className="mt-2 text-lg font-semibold">Queue snapshot</h2>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {approvalItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-background p-3"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default SuperRHAdmin
