import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Archive, ArrowLeft, ArrowUpRight, CalendarDays, Check, CircleHelp, Download, FileSpreadsheet, FolderOpen, HeartHandshake, History, MonitorUp, Plus, Settings2, ShieldCheck, Upload, X } from 'lucide-react';
import { archiveCampaign, createCampaign, createId, deleteEntry, getCampaignSnapshot, getSnapshot, importAsCopy, saveDisplaySettings, saveEntry, setActiveCampaign, updateCampaign, replaceAllData } from '../data/database';
import { calculateCampaign, formatMinor, parseAmountToMinor } from '../domain/calculations';
import { addMonthsAnchored, validateCampaignDates } from '../domain/dates';
import { campaignSchema } from '../domain/validation';
import { CURRENCIES, FREQUENCIES, FREQUENCY_LABELS, WEEKDAYS } from '../domain/types';
import type { AppSettings, Campaign, CommitmentEntry, Frequency } from '../domain/types';
import type { DatabaseSnapshot } from '../data/database';
import type { ConnectionState } from '../live/sync';
import { subscribeToCampaign } from '../live/sync';
import { downloadBackup, readBackupFile } from '../export/backup';
import { exportWorkbook } from '../export/workbook';

interface StoreContextValue {
  snapshot: DatabaseSnapshot;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  setError: (message: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function useStore(): StoreContextValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('App store is unavailable.');
  return value;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function localISODate(date: Date): string {
  return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

export function App() {
  const [snapshot, setSnapshot] = useState<DatabaseSnapshot>({ campaigns: [], entries: [], settings: { schemaVersion: 1, displayShowCount: true, displayShowBreakdown: true } });
  const [loading, setLoading] = useState(true);
  const [error, setErrorState] = useState('');
  const refresh = useCallback(async () => {
    const next = await getSnapshot();
    setSnapshot(next);
    setErrorState('');
  }, []);
  useEffect(() => {
    void refresh().catch((reason: unknown) => setErrorState(messageOf(reason))).finally(() => setLoading(false));
  }, [refresh]);
  const value = useMemo(() => ({ snapshot, loading, error, refresh, setError: setErrorState }), [snapshot, loading, error, refresh]);

  return (
    <StoreContext.Provider value={value}>
      <Routes>
        <Route path="/" element={<CampaignsPage />} />
        <Route path="/campaigns/new" element={<CampaignFormPage />} />
        <Route path="/campaigns/:campaignId" element={<DashboardPage />} />
        <Route path="/campaigns/:campaignId/settings" element={<SettingsPage />} />
        <Route path="/display/:campaignId" element={<DisplayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreContext.Provider>
  );
}

function LocalDataNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`local-notice${compact ? ' compact' : ''}`} aria-label="Local data and backup notice">
      <ShieldCheck size={18} aria-hidden="true" />
      <div><strong>Your data stays in this browser.</strong><span> Browser storage can be cleared or evicted. Download a JSON backup after each event.</span></div>
    </aside>
  );
}

function AppHeader({ activeCampaign }: { activeCampaign?: Campaign }) {
  return (
    <header className="app-header">
      <Link to="/" className="brand" aria-label="IraWorks Commitment Counter home">
        <span className="brand-mark"><HeartHandshake size={20} aria-hidden="true" /></span>
        <span><strong>IraWorks</strong><small>Commitment Counter</small></span>
      </Link>
      {activeCampaign && <div className="header-campaign"><span>Active campaign</span><strong>{activeCampaign.title}</strong></div>}
      {activeCampaign && <Link className="icon-button header-settings" to={`/campaigns/${activeCampaign.id}/settings`} aria-label="Campaign settings"><Settings2 size={19} /></Link>}
    </header>
  );
}

function AppFrame({ children, campaign, wide = false }: { children: React.ReactNode; campaign?: Campaign; wide?: boolean }) {
  return <div className="app-frame"><AppHeader activeCampaign={campaign} /><main className={`page-content${wide ? ' wide' : ''}`}>{children}</main></div>;
}

function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="heading-description">{description}</p>}</div>{children && <div className="heading-actions">{children}</div>}</div>;
}

function ErrorBanner({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return <div className="error-banner" role="alert"><CircleHelp size={19} /><span>{message}</span><button className="icon-button" onClick={onClose} aria-label="Dismiss error"><X size={17} /></button></div>;
}

function CampaignsPage() {
  const { snapshot, loading, error, setError } = useStore();
  const active = snapshot.campaigns.filter((campaign) => !campaign.archived).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const archived = snapshot.campaigns.filter((campaign) => campaign.archived);
  return (
    <AppFrame wide>
      <div className="welcome-grid">
        <section className="welcome-copy">
          <p className="eyebrow">A little more clarity, together</p>
          <h1>Count commitments<br /><em>with confidence.</em></h1>
          <p className="lead">A simple, private way to track pledge commitments and see what they may add up to across your campaign.</p>
          <div className="trust-row"><span><ShieldCheck size={17} /> Private by default</span><span><MonitorUp size={17} /> Ready for a projector</span></div>
        </section>
        <section className="campaign-panel" aria-labelledby="campaign-list-title">
          <div className="panel-heading"><div><p className="eyebrow">Your workspace</p><h2 id="campaign-list-title">Campaigns</h2></div><Link to="/campaigns/new" className="button primary"><Plus size={17} /> New campaign</Link></div>
          <ErrorBanner message={error} onClose={() => setError('')} />
          {loading ? <p className="muted">Opening local workspace…</p> : active.length === 0 ? (
            <div className="empty-state"><span className="empty-icon"><FolderOpen size={24} /></span><h3>Start your first campaign</h3><p>Set a date range and service day, then add commitments as they come in.</p><Link to="/campaigns/new" className="button primary"><Plus size={17} /> Create campaign</Link></div>
          ) : (
            <ul className="campaign-list">{active.map((campaign) => {
              const projection = calculateCampaign(campaign, snapshot.entries);
              return <li key={campaign.id}><Link to={`/campaigns/${campaign.id}`} className="campaign-card"><span className="campaign-card-icon"><CalendarDays size={19} /></span><span className="campaign-card-copy"><strong>{campaign.title}</strong><small>{campaign.startDate} – {campaign.endDate}</small></span><span className="campaign-card-total"><strong>{formatMinor(projection.totalMinor, campaign.currencyCode)}</strong><small>{projection.entryCount} commitment {projection.entryCount === 1 ? 'entry' : 'entries'}</small></span><ArrowUpRight size={18} className="campaign-arrow" /></Link></li>;
            })}</ul>
          )}
          {archived.length > 0 && <details className="archived-list"><summary>Archived campaigns <span>{archived.length}</span></summary><ul>{archived.map((campaign) => <li key={campaign.id}><Link to={`/campaigns/${campaign.id}/settings`}>{campaign.title}</Link><span>{campaign.startDate} – {campaign.endDate}</span></li>)}</ul></details>}
          <LocalDataNotice />
        </section>
      </div>
    </AppFrame>
  );
}

function CampaignFormPage() {
  const { refresh, setError } = useStore();
  const navigate = useNavigate();
  const today = localISODate(new Date());
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => {
    return addMonthsAnchored(today, 3);
  });
  const [currencyCode, setCurrencyCode] = useState<(typeof CURRENCIES)[number]>('PHP');
  const [midweekDay, setMidweekDay] = useState(3);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormError(''); setSaving(true);
    try {
      validateCampaignDates(startDate, endDate);
      const draft = campaignSchema.parse({ id: createId(), title, startDate, endDate, currencyCode, midweekDay, archived: false, revision: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      const campaign = await createCampaign({ title: draft.title, startDate, endDate, currencyCode, midweekDay });
      await refresh(); navigate(`/campaigns/${campaign.id}`);
    } catch (reason) { setFormError(messageOf(reason)); setError(''); }
    finally { setSaving(false); }
  }

  return <AppFrame><Link className="back-link" to="/"><ArrowLeft size={16} /> All campaigns</Link><PageHeading eyebrow="New campaign" title="Set up your campaign" description="Choose the dates and service day used to calculate projected commitments." />
    <form className="form-card campaign-form" onSubmit={(event) => void submit(event)}>
      {formError && <div className="field-error" role="alert">{formError}</div>}
      <label className="field full"><span>Campaign name</span><input autoFocus required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Building Fund Campaign" /><small>1–100 characters</small></label>
      <div className="form-row"><label className="field"><span>Start date <b>Inclusive</b></span><input type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label className="field"><span>End date <b>Inclusive</b></span><input type="date" required value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
      <div className="form-row"><label className="field"><span>Currency</span><select value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value as (typeof CURRENCIES)[number])}>{CURRENCIES.map((code) => <option value={code} key={code}>{code}{code === 'PHP' ? ' · Philippine peso' : ''}</option>)}</select><small>Changing currency later does not convert amounts.</small></label><label className="field"><span>Midweek service day</span><select value={midweekDay} onChange={(event) => setMidweekDay(Number(event.target.value))}>{WEEKDAYS.map((day) => <option value={day.value} key={day.value}>{day.label}</option>)}</select><small>Sundays are always included in Per Service.</small></label></div>
      <div className="form-footer"><Link className="button secondary" to="/">Cancel</Link><button className="button primary" disabled={saving}>{saving ? 'Saving…' : 'Create campaign'} <ArrowUpRight size={17} /></button></div>
      <p className="form-footnote"><ShieldCheck size={15} /> Your campaign is saved only in this browser. You can download a JSON backup once it’s created.</p>
    </form>
  </AppFrame>;
}

function DashboardPage() {
  const { campaignId = '' } = useParams();
  const { snapshot, loading, error, refresh, setError } = useStore();
  const campaign = snapshot.campaigns.find((item) => item.id === campaignId);
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('ONCE');
  const [note, setNote] = useState('');
  const [editEntry, setEditEntry] = useState<CommitmentEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommitmentEntry | null>(null);
  const [entryError, setEntryError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const projection = campaign ? calculateCampaign(campaign, snapshot.entries) : null;

  useEffect(() => {
    if (!campaignId) return;
    return subscribeToCampaign(campaignId, () => { void refresh().catch((reason: unknown) => setError(messageOf(reason))); }, () => {});
  }, [campaignId, refresh, setError]);

  if (loading) return <AppFrame><p className="muted">Opening campaign…</p></AppFrame>;
  if (!campaign) return <AppFrame><div className="empty-state"><h1>Campaign not found</h1><p>This campaign may have been archived or removed from local storage.</p><Link to="/" className="button primary">Return to campaigns</Link></div></AppFrame>;
  if (campaign.archived) return <AppFrame campaign={campaign}><div className="empty-state"><h1>This campaign is archived</h1><p>Restore it in campaign settings to keep adding commitments.</p><Link to={`/campaigns/${campaign.id}/settings`} className="button primary">Open settings</Link></div></AppFrame>;
  const rows = [...(projection?.entries ?? [])].sort((a, b) => b.entry.createdAt.localeCompare(a.entry.createdAt) || b.entry.id.localeCompare(a.entry.id));

  async function addOrSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setEntryError(''); setSaving(true);
    try {
      const wasEditing = Boolean(editEntry);
      const amountMinor = parseAmountToMinor(amount);
      await saveEntry({ ...(editEntry ? { id: editEntry.id } : {}), campaignId: campaign!.id, amountMinor, frequency, note: note.trim() || undefined });
      setAmount(''); setNote(''); setFrequency('ONCE'); setEditEntry(null);
      await refresh();
      setAnnouncement(wasEditing ? 'Commitment updated.' : 'Commitment added.');
    } catch (reason) { setEntryError(messageOf(reason)); }
    finally { setSaving(false); }
  }

  function startEdit(entry: CommitmentEntry) {
    setEditEntry(entry); setAmount((entry.amountMinor / 100).toFixed(2)); setFrequency(entry.frequency); setNote(entry.note ?? ''); setEntryError('');
    document.getElementById('amount')?.focus();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try { await deleteEntry(campaign!.id, deleteTarget.id); setDeleteTarget(null); await refresh(); setAnnouncement('Commitment deleted. Projected totals updated.'); }
    catch (reason) { setEntryError(messageOf(reason)); setDeleteTarget(null); }
  }

  function openDisplay() {
    const target = `${window.location.origin}${window.location.pathname}#/display/${campaign!.id}`;
    const opened = window.open(target, '_blank', 'popup,width=1440,height=900');
    setPopupBlocked(!opened);
  }

  async function backup() {
    try { await downloadBackup(); }
    catch (reason) { setError(messageOf(reason)); }
  }

  return (
    <AppFrame campaign={campaign} wide>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      <div className="dashboard-topline"><div><p className="eyebrow">Campaign dashboard</p><h1>{campaign.title}</h1><p className="muted">{campaign.startDate} – {campaign.endDate} <span className="dot-separator">·</span> {campaign.currencyCode}</p></div><div className="heading-actions"><Link className="button secondary" to={`/campaigns/${campaign.id}/settings`}><Settings2 size={17} /> Settings</Link><button className="button secondary" onClick={openDisplay}><MonitorUp size={17} /> Open live display</button></div></div>
      <ErrorBanner message={error} onClose={() => setError('')} />
      {popupBlocked && <div className="info-banner" role="status">The browser blocked the new window. <a href={`${window.location.pathname}#/display/${campaign.id}`} target="_blank" rel="noreferrer">Open live display in a new tab</a><button className="icon-button" onClick={() => setPopupBlocked(false)} aria-label="Dismiss"><X size={16} /></button></div>}
      <LocalDataNotice compact />
      <section className="summary-grid" aria-label="Campaign totals">
        <div className="summary-card total-card"><span className="summary-label">Projected Commitments</span><strong className="total-value" aria-live="polite" aria-atomic="true">{formatMinor(projection!.totalMinor, campaign.currencyCode)}</strong><small>Pledges projected across the campaign · not funds collected</small></div>
        <div className="summary-card count-card"><span className="summary-label">Commitment Entries</span><strong className="count-value">{projection!.entryCount}</strong><small>Rows entered in this campaign</small></div>
        <div className="frequency-cards">{FREQUENCIES.map((item) => <div className="frequency-card" key={item}><span>{FREQUENCY_LABELS[item]}</span><strong>{formatMinor(projection!.byFrequency[item], campaign.currencyCode)}</strong></div>)}</div>
      </section>
      <section className="operator-grid">
        <div className="entry-section">
          <div className="section-heading"><div><p className="eyebrow">The activity</p><h2>Commitment history</h2></div><span className="entry-count-pill">{rows.length} {rows.length === 1 ? 'entry' : 'entries'}</span></div>
          {rows.length === 0 ? <div className="history-empty"><History size={22} /><strong>No commitments yet</strong><span>Your first entry will appear here.</span></div> : (
            <div className="table-wrap"><table className="entries-table"><thead><tr><th scope="col">Commitment</th><th scope="col">Occurrences</th><th scope="col">Projected</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.map(({ entry, occurrences, projectedMinor }) => <tr key={entry.id}><td><strong>{FREQUENCY_LABELS[entry.frequency]}</strong><small>{formatMinor(entry.amountMinor, campaign.currencyCode)} per occurrence{entry.note ? ` · ${entry.note}` : ''}</small></td><td>{occurrences}</td><td className="projected-cell">{formatMinor(projectedMinor, campaign.currencyCode)}</td><td className="row-actions"><button className="text-action" onClick={() => startEdit(entry)} aria-label={`Edit ${FREQUENCY_LABELS[entry.frequency]} commitment`}>Edit</button><button className="text-action danger-text" onClick={() => setDeleteTarget(entry)} aria-label={`Delete ${FREQUENCY_LABELS[entry.frequency]} commitment`}>Delete</button></td></tr>)}</tbody></table></div>
          )}
        </div>
        <aside className="quick-entry-card" aria-labelledby="quick-entry-title">
          <div className="quick-entry-heading"><span className="quick-entry-mark"><Plus size={18} /></span><div><p className="eyebrow">Quick entry</p><h2 id="quick-entry-title">{editEntry ? 'Edit commitment' : 'Add a commitment'}</h2></div></div>
          <p className="form-intro">Just an amount and frequency. Names are never required.</p>
          <form onSubmit={(event) => void addOrSave(event)}>
            {entryError && <div className="field-error" role="alert">{entryError}</div>}
            <label className="field" htmlFor="amount"><span>Amount</span><div className="money-input"><span>{campaign.currencyCode}</span><input id="amount" inputMode="decimal" autoComplete="off" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} aria-describedby="amount-help" required /></div><small id="amount-help">Enter a positive amount, up to two decimal places.</small></label>
            <fieldset className="frequency-picker"><legend>Frequency</legend><div className="frequency-options">{FREQUENCIES.map((item) => <label key={item} className={`frequency-option${frequency === item ? ' selected' : ''}`}><input type="radio" name="frequency" value={item} checked={frequency === item} onChange={() => setFrequency(item)} /><span>{FREQUENCY_LABELS[item]}</span></label>)}</div></fieldset>
            <label className="field" htmlFor="note"><span>Note <em>Optional</em></span><input id="note" maxLength={140} value={note} onChange={(event) => setNote(event.target.value)} placeholder="A short reminder" /><small>Avoid names or personal details. Up to 140 characters.</small></label>
            <div className="quick-entry-actions"><button className="button primary full-button" disabled={saving}>{saving ? 'Saving…' : editEntry ? 'Save changes' : 'Add commitment'} <Check size={17} /></button>{editEntry && <button className="button secondary full-button" type="button" onClick={() => { setEditEntry(null); setAmount(''); setNote(''); setFrequency('ONCE'); setEntryError(''); }}>Cancel edit</button>}</div>
          </form>
        </aside>
      </section>
      <section className="export-strip"><div className="export-icon"><FileSpreadsheet size={20} /></div><div><strong>Take your numbers with you</strong><span>Export a spreadsheet report or save a JSON backup you can restore later.</span></div><div className="export-actions"><button className="button secondary" onClick={() => void exportWorkbook(campaign, snapshot.entries).catch((reason: unknown) => setError(messageOf(reason)))}><Download size={16} /> Export Excel</button><button className="button secondary" onClick={() => void backup()}><ShieldCheck size={16} /> Download JSON backup</button></div></section>
      {deleteTarget && <ConfirmDialog title="Delete this commitment?" description={`${FREQUENCY_LABELS[deleteTarget.frequency]} · ${formatMinor(deleteTarget.amountMinor, campaign.currencyCode)}. This permanently removes the entry from this campaign.`} confirmLabel="Delete commitment" onCancel={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />}
    </AppFrame>
  );
}

function ConfirmDialog({ title, description, confirmLabel, onCancel, onConfirm, destructive = true }: { title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void; destructive?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('[data-initial-focus]')?.focus();
    return () => {
      if (dialog.open) dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={dialogRef} className="modal-native" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={(event) => { event.preventDefault(); onCancel(); }} onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section className="modal-card"><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p><div className="modal-actions"><button className="button secondary" data-initial-focus onClick={onCancel}>Cancel</button><button className={`button ${destructive ? 'danger-button' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button></div></section></dialog>;
}

function SettingsPage() {
  const { campaignId = '' } = useParams();
  const { snapshot, loading, refresh, error, setError } = useStore();
  const navigate = useNavigate();
  const campaign = snapshot.campaigns.find((item) => item.id === campaignId);
  const [draft, setDraft] = useState<Campaign | null>(campaign ?? null);
  const [saving, setSaving] = useState(false);
  const [restoreBackup, setRestoreBackup] = useState<Awaited<ReturnType<typeof readBackupFile>> | null>(null);
  const [restoreError, setRestoreError] = useState('');
  const [busyRestore, setBusyRestore] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  useEffect(() => { if (campaign) setDraft(campaign); }, [campaign]);

  if (loading) return <AppFrame><p className="muted">Opening settings…</p></AppFrame>;
  if (!campaign || !draft) return <AppFrame><div className="empty-state"><h1>Campaign not found</h1><Link to="/" className="button primary">Return to campaigns</Link></div></AppFrame>;

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      validateCampaignDates(draft!.startDate, draft!.endDate);
      const next = await updateCampaign(draft!);
      await refresh(); setDraft(next); setError('');
    } catch (reason) { setError(messageOf(reason)); }
    finally { setSaving(false); }
  }

  async function uploadBackup(file?: File) {
    if (!file) return;
    setRestoreError('');
    try { setRestoreBackup(await readBackupFile(file)); }
    catch (reason) { setRestoreError(messageOf(reason)); }
  }

  async function restore(mode: 'replace' | 'copy') {
    if (!restoreBackup) return;
    setBusyRestore(true);
    try {
      if (mode === 'replace') await replaceAllData(restoreBackup);
      else await importAsCopy(restoreBackup);
      setRestoreBackup(null); await refresh();
      if (mode === 'replace') navigate('/');
    } catch (reason) { setRestoreError(messageOf(reason)); }
    finally { setBusyRestore(false); }
  }

  async function doArchive() {
    try {
      if (campaign!.archived) {
        const restored = await updateCampaign({ ...campaign!, archived: false });
        await setActiveCampaign(restored.id);
      } else await archiveCampaign(campaign!.id);
      await refresh(); navigate('/');
    } catch (reason) { setError(messageOf(reason)); }
  }

  return <AppFrame campaign={campaign}><Link className="back-link" to={`/campaigns/${campaign.id}`}><ArrowLeft size={16} /> Campaign dashboard</Link><PageHeading eyebrow="Campaign settings" title="Keep things up to date" description="Change your campaign details, move older campaigns out of the way, or protect your local data." />
    <ErrorBanner message={error} onClose={() => setError('')} />
    <form className="form-card settings-form" onSubmit={(event) => void saveSettings(event)}>
      <div className="settings-section-title"><h2>Campaign details</h2><p>All dates are inclusive. Updates recalculate recurring projections right away.</p></div>
      <label className="field full"><span>Campaign name</span><input required maxLength={100} value={draft.title} onChange={(event) => setDraft({ ...draft!, title: event.target.value })} /></label>
      <div className="form-row"><label className="field"><span>Start date</span><input required type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft!, startDate: event.target.value })} /></label><label className="field"><span>End date</span><input required type="date" value={draft.endDate} onChange={(event) => setDraft({ ...draft!, endDate: event.target.value })} /></label></div>
      {(draft.startDate !== campaign.startDate || draft.endDate !== campaign.endDate) && <div className="info-banner"><CalendarDays size={17} /> Changing campaign dates recalculates Weekly, Monthly and Per Service projections from the saved commitments.</div>}
      <div className="form-row"><label className="field"><span>Currency</span><select value={draft.currencyCode} onChange={(event) => setDraft({ ...draft!, currencyCode: event.target.value as Campaign['currencyCode'] })}>{CURRENCIES.map((code) => <option value={code} key={code}>{code}</option>)}</select>{draft.currencyCode !== campaign.currencyCode && <small className="warning-copy">Changing currency does not convert existing amounts.</small>}</label><label className="field"><span>Midweek service day</span><select value={draft.midweekDay} onChange={(event) => setDraft({ ...draft!, midweekDay: Number(event.target.value) })}>{WEEKDAYS.map((day) => <option value={day.value} key={day.value}>{day.label}</option>)}</select></label></div>
      <div className="form-footer"><Link className="button secondary" to={`/campaigns/${campaign.id}`}>Cancel</Link><button className="button primary" disabled={saving}>{saving ? 'Saving…' : 'Save campaign'} <Check size={16} /></button></div>
    </form>
    <section className="settings-card display-settings"><div><h2>Live display</h2><p>Choose which aggregate details appear on the separate projector screen.</p></div><label className="toggle-row"><span><strong>Show commitment entry count</strong><small>Counts rows, not people.</small></span><input type="checkbox" checked={snapshot.settings.displayShowCount} onChange={(event) => void saveDisplaySettings({ displayShowCount: event.target.checked }).then(refresh).catch((reason: unknown) => setError(messageOf(reason)))} /></label><label className="toggle-row"><span><strong>Show frequency breakdown</strong><small>Display projected subtotals for each frequency.</small></span><input type="checkbox" checked={snapshot.settings.displayShowBreakdown} onChange={(event) => void saveDisplaySettings({ displayShowBreakdown: event.target.checked }).then(refresh).catch((reason: unknown) => setError(messageOf(reason)))} /></label><label className="toggle-row"><span><strong>Reduce motion</strong><small>Use still number updates on the public screen.</small></span><input type="checkbox" checked={snapshot.settings.reducedMotionOverride ?? false} onChange={(event) => void saveDisplaySettings({ reducedMotionOverride: event.target.checked }).then(refresh).catch((reason: unknown) => setError(messageOf(reason)))} /></label><button className="button secondary" onClick={() => { const target = `${window.location.origin}${window.location.pathname}#/display/${campaign.id}`; window.open(target, '_blank', 'popup,width=1440,height=900'); }}><MonitorUp size={16} /> Open live display</button></section>
    <section className="settings-card backup-card"><div><h2>Excel export and JSON backup</h2><p>Excel is a report. JSON is the editable backup you can restore later.</p></div><div className="backup-actions"><button className="button secondary" onClick={() => void exportWorkbook(campaign, snapshot.entries).catch((reason: unknown) => setError(messageOf(reason)))}><FileSpreadsheet size={16} /> Export Excel report</button><button className="button secondary" onClick={() => void downloadBackup().catch((reason: unknown) => setError(messageOf(reason)))}><Download size={16} /> Download JSON backup</button><label className="button secondary upload-button"><Upload size={16} /> Restore JSON backup<input type="file" accept="application/json,.json" onChange={(event) => { void uploadBackup(event.target.files?.[0]); event.target.value = ''; }} /></label></div>{restoreError && <div className="field-error" role="alert">{restoreError}</div>}<LocalDataNotice compact /></section>
    {campaign.archived ? <section className="settings-card archive-card"><div><h2>Archived campaign</h2><p>This campaign is read-only until you restore it.</p></div><button className="button primary" onClick={() => void doArchive()}>Restore campaign</button></section> : <section className="settings-card archive-card"><div><h2>Archive this campaign</h2><p>Move it out of your active campaign list. Its entries and history remain saved.</p></div><button className="button danger-outline" onClick={() => setConfirmArchive(true)}><Archive size={16} /> Archive campaign</button></section>}
    {confirmArchive && <ConfirmDialog title="Archive this campaign?" description="This removes the campaign from the active list. Its entries remain in this browser and can be restored later." confirmLabel="Archive campaign" onCancel={() => setConfirmArchive(false)} onConfirm={() => { setConfirmArchive(false); void doArchive(); }} />}
    {restoreBackup && <RestoreDialog backup={restoreBackup} error={restoreError} busy={busyRestore} onCancel={() => setRestoreBackup(null)} onReplace={() => void restore('replace')} onCopy={() => void restore('copy')} />}
  </AppFrame>;
}

function RestoreDialog({ backup, error, busy, onCancel, onReplace, onCopy }: { backup: Awaited<ReturnType<typeof readBackupFile>>; error: string; busy: boolean; onCancel: () => void; onReplace: () => void; onCopy: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('[data-initial-focus]')?.focus();
    return () => {
      if (dialog.open) dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={dialogRef} className="modal-native restore-modal" aria-labelledby="restore-title" onCancel={(event) => { event.preventDefault(); onCancel(); }} onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section className="modal-card"><span className="modal-icon"><Upload size={20} /></span><h2 id="restore-title">Backup ready to restore</h2><p>This file contains <strong>{backup.campaigns.length} {backup.campaigns.length === 1 ? 'campaign' : 'campaigns'}</strong> and <strong>{backup.entries.length} commitment {backup.entries.length === 1 ? 'entry' : 'entries'}</strong>.</p>{error && <div className="field-error" role="alert">{error}</div>}<ul className="restore-campaign-list">{backup.campaigns.slice(0, 5).map((campaign) => <li key={campaign.id}>{campaign.title}<span>{campaign.startDate} – {campaign.endDate}</span></li>)}</ul>{backup.campaigns.length > 5 && <small>and {backup.campaigns.length - 5} more campaigns</small>}<div className="restore-warning"><strong>Replace all local data</strong> removes the campaigns currently saved in this browser. Import as a separate copy keeps your current data.</div><div className="modal-actions vertical"><button className="button danger-button" disabled={busy} onClick={onReplace}>Replace all local data</button><button className="button primary" disabled={busy} onClick={onCopy}>Import as separate copy</button><button className="button text-button" data-initial-focus disabled={busy} onClick={onCancel}>Cancel</button></div></section></dialog>;
}

function DisplayPage() {
  const { campaignId = '' } = useParams();
  const [campaign, setCampaign] = useState<Campaign>();
  const [entries, setEntries] = useState<CommitmentEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ schemaVersion: 1, displayShowCount: true, displayShowBreakdown: true });
  const [status, setStatus] = useState<ConnectionState>('reconnecting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const reload = useCallback(async () => {
    try {
      const saved = await getCampaignSnapshot(campaignId);
      if (!saved.campaign) { setCampaign(undefined); setError('This campaign could not be found in this browser. Return to the operator dashboard and reopen the display.'); setStatus('reconnecting'); }
      else { setCampaign(saved.campaign); setEntries(saved.entries); setSettings(saved.settings); setError(''); setStatus(typeof BroadcastChannel === 'undefined' ? 'degraded' : 'live'); }
      setLoading(false);
    } catch (reason) { setError(`${messageOf(reason)} The display is showing its last saved state.`); setStatus('reconnecting'); setLoading(false); }
  }, [campaignId]);

  useEffect(() => {
    void reload();
    return subscribeToCampaign(campaignId, () => { void reload(); }, setStatus);
  }, [campaignId, reload]);

  const projection = campaign ? calculateCampaign(campaign, entries) : null;
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (reason) { setError(`Fullscreen could not be enabled. ${messageOf(reason)}`); }
  }

  const reduceMotion = settings.reducedMotionOverride ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return <main className={`display-screen${reduceMotion ? ' reduce-motion' : ''}`}>
    <div className="display-topbar"><Link to={campaign ? `/campaigns/${campaign.id}` : '/'} className="display-brand"><span className="brand-mark"><HeartHandshake size={18} /></span>IraWorks</Link><div className={`connection-badge ${status}`} role="status"><span className="connection-dot" />{status === 'live' ? 'Live' : status === 'degraded' ? 'Limited updates' : 'Reconnecting'}</div></div>
    {loading ? <div className="display-loading" role="status">Loading saved campaign…</div> : error && !campaign ? <div className="display-empty"><h1>Live display unavailable</h1><p>{error}</p><Link className="button display-button" to="/">Return to campaigns</Link></div> : campaign && projection && <>
      <div className="display-content"><p className="display-overline">Projected Commitments</p><h1 className="display-campaign-title">{campaign.title}</h1><strong className="display-total" aria-live="polite" aria-atomic="true">{formatMinor(projection.totalMinor, campaign.currencyCode)}</strong><p className="display-disclaimer">Pledges projected across {campaign.startDate} – {campaign.endDate}<br />This total represents commitments, not funds collected.</p>
        {settings.displayShowCount && <div className="display-entry-count"><span>{projection.entryCount}</span> Commitment {projection.entryCount === 1 ? 'Entry' : 'Entries'}</div>}
        {settings.displayShowBreakdown && <div className="display-breakdown">{FREQUENCIES.map((frequency) => <div key={frequency}><span>{FREQUENCY_LABELS[frequency]}</span><strong>{formatMinor(projection.byFrequency[frequency], campaign.currencyCode)}</strong></div>)}</div>}
      </div><div className="display-footer"><span>Private to this device and browser</span><button className="button display-button" onClick={() => void toggleFullscreen()}>{isFullscreen ? 'Exit full screen' : 'Enter full screen'}</button></div>
      {error && <div className="display-toast" role="status">{error}</div>}
    </>}
  </main>;
}
