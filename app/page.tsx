"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, ClipboardCheck, FileText, LockKeyhole, Search, ShieldCheck, Timer, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Role = "Engineer" | "Reviewer" | "Admin";
type AuditEvent = { action: string; actor: string; outcome: "Allowed" | "Blocked" | "Approved"; time: string };

const sources = [
  { title: "5G network change procedure", section: "4.2", trust: "Reviewed" },
  { title: "Operations runbook: controlled changes", section: "2.1", trust: "Reviewed" },
  { title: "Access policy for engineering tools", section: "3.4", trust: "Current" },
];

const roleRules: Record<Role, string[]> = {
  Engineer: ["Search approved documents", "Create a draft report"],
  Reviewer: ["Search approved documents", "Approve a drafted report", "View audit records"],
  Admin: ["Search approved documents", "Approve reports", "View audit records", "View evaluation results"],
};

export default function Home() {
  const [role, setRole] = useState<Role>("Engineer");
  const [query, setQuery] = useState("What checks are required before a planned radio configuration change?");
  const [searched, setSearched] = useState(false);
  const [reportStatus, setReportStatus] = useState<"Not created" | "Awaiting review" | "Approved">("Not created");
  const [audit, setAudit] = useState<AuditEvent[]>([
    { action: "Document search", actor: "Engineer", outcome: "Allowed", time: "09:42" },
    { action: "Draft report", actor: "Engineer", outcome: "Allowed", time: "09:44" },
    { action: "Approve report", actor: "Engineer", outcome: "Blocked", time: "09:44" },
  ]);
  const canApprove = role === "Reviewer" || role === "Admin";
  const metrics = useMemo(() => [
    { label: "Grounded answers", value: "18 / 20", note: "uses cited sources", icon: BookOpen },
    { label: "Blocked actions", value: "6 / 6", note: "role checks passed", icon: LockKeyhole },
    { label: "Median response", value: "1.8 s", note: "demo evaluation", icon: Timer },
  ], []);

  function addAudit(action: string, outcome: AuditEvent["outcome"]) {
    setAudit((items) => [{ action, actor: role, outcome, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...items]);
  }
  function runSearch() { setSearched(true); addAudit("Document search", "Allowed"); }
  function createReport() { setReportStatus("Awaiting review"); addAudit("Draft report", "Allowed"); }
  function approveReport() {
    if (!canApprove) { addAudit("Approve report", "Blocked"); return; }
    setReportStatus("Approved"); addAudit("Approve report", "Approved");
  }

  return (
    <main className="min-h-screen bg-[#071823] text-slate-100">
      <div className="mx-auto max-w-[1460px] px-4 py-4 sm:px-7 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200"><ShieldCheck className="size-5" /></div>
            <div><p className="text-sm font-semibold tracking-wide text-white">T-Guard</p><p className="text-xs text-slate-400">Secure engineering assistant</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/10">Demo workspace</Badge>
            <div className="flex items-center gap-2 text-sm text-slate-300"><UserRoundCheck className="size-4 text-cyan-300" />Acting as
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger className="w-[132px] border-white/15 bg-white/5 text-slate-100"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Engineer">Engineer</SelectItem><SelectItem value="Reviewer">Reviewer</SelectItem><SelectItem value="Admin">Admin</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="grid gap-6 py-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-[#0a202e] p-4 lg:min-h-[700px]">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace</p>
            <nav className="space-y-1 text-sm">
              {[[Activity, "Assistant", true], [FileText, "Approval queue", false], [ClipboardCheck, "Audit trail", false], [BookOpen, "Evaluation", false]].map(([Icon, label, active]) => {
                const NavIcon = Icon as typeof Activity;
                return <div key={String(label)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${active ? "bg-cyan-300/10 text-cyan-100" : "text-slate-400"}`}><NavIcon className="size-4" />{String(label)}{active && <span className="ml-auto size-1.5 rounded-full bg-cyan-300" />}</div>;
              })}
            </nav>
            <div className="mt-7 border-t border-white/10 pt-5"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Role permissions</p>
              <ul className="space-y-2 text-xs leading-5 text-slate-300">{roleRules[role].map((rule) => <li key={rule} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-cyan-300" />{rule}</li>)}</ul>
            </div>
            <div className="mt-7 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-xs leading-5 text-slate-300">All assistant actions are logged. Report approval is separated from drafting.</div>
          </aside>

          <Tabs defaultValue="assistant" className="min-w-0">
            <TabsList className="border border-white/10 bg-[#0a202e] p-1"><TabsTrigger value="assistant" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-[#05202d]">Assistant</TabsTrigger><TabsTrigger value="review" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-[#05202d]">Review queue</TabsTrigger><TabsTrigger value="audit" className="data-[state=active]:bg-cyan-300 data-[state=active]:text-[#05202d]">Audit and evaluation</TabsTrigger></TabsList>

            <TabsContent value="assistant" className="mt-5">
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a202e]">
                <div className="border-b border-white/10 p-5 sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-cyan-300">Controlled lookup</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Ask the engineering workspace</h1></div><Badge variant="outline" className="border-white/15 text-slate-300">Approved documents only</Badge></div>
                  <label className="mt-5 flex min-h-14 items-center gap-3 rounded-xl border border-white/15 bg-[#06141e] px-4 focus-within:border-cyan-300/70" htmlFor="question"><Search className="size-5 shrink-0 text-cyan-300" /><input id="question" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500" /><Button onClick={runSearch} className="hidden bg-cyan-300 text-[#05202d] hover:bg-cyan-200 sm:inline-flex">Search sources</Button></label>
                  <Button onClick={runSearch} className="mt-3 w-full bg-cyan-300 text-[#05202d] hover:bg-cyan-200 sm:hidden">Search sources</Button>
                </div>
                <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="rounded-xl border border-white/10 bg-[#071823] p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-white">Grounded response</p>{searched ? <Badge className="bg-emerald-300/15 text-emerald-200 hover:bg-emerald-300/15">3 sources found</Badge> : <Badge variant="outline" className="border-white/15 text-slate-400">Ready</Badge>}</div>{searched ? <><p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-slate-200">Before the change, confirm the approved change window, validate the affected configuration, and record a rollback step. The change should remain a draft until a reviewer checks the evidence and approves the report.</p><div className="mt-5 flex flex-wrap gap-2"><Badge variant="outline" className="border-cyan-300/25 text-cyan-100">Cited from 3 approved documents</Badge><Badge variant="outline" className="border-white/15 text-slate-300">No external action requested</Badge></div></> : <p className="mt-4 text-sm leading-6 text-slate-400">Use the controlled lookup to retrieve only the approved sample documents in this demo.</p>}</div>
                  <div className="rounded-xl border border-white/10 bg-[#071823] p-5"><p className="text-sm font-semibold text-white">Action boundary</p><p className="mt-2 text-sm leading-6 text-slate-400">The assistant can create a draft. It cannot publish a report without a reviewer.</p><Button onClick={createReport} disabled={!searched || reportStatus !== "Not created"} className="mt-5 w-full bg-white text-[#071823] hover:bg-slate-200">Create draft report</Button><div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><LockKeyhole className="size-3.5" />Approval is a separate action.</div></div>
                </div>
              </section>
              <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-2xl border border-white/10 bg-[#0a202e] p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="font-semibold text-white">Retrieved sources</h2><span className="text-xs text-slate-500">Demo corpus</span></div><div className="mt-4 divide-y divide-white/10">{sources.map((source) => <div key={source.title} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><div className="grid size-9 place-items-center rounded-lg bg-white/5 text-cyan-300"><FileText className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-100">{source.title}</p><p className="mt-0.5 text-xs text-slate-500">Section {source.section} · {source.trust}</p></div><ChevronRight className="size-4 text-slate-500" /></div>)}</div></div>
                <div className="rounded-2xl border border-white/10 bg-[#0a202e] p-5 sm:p-6"><p className="text-sm font-semibold text-white">Safety checks</p><div className="mt-4 space-y-3 text-sm text-slate-300"><p className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-300" />Document scope checked</p><p className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-300" />Tool use logged</p><p className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-300" />Approval boundary active</p></div></div>
              </section>
            </TabsContent>

            <TabsContent value="review" className="mt-5"><section className="rounded-2xl border border-white/10 bg-[#0a202e] p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-cyan-300">Human approval</p><h2 className="mt-1 text-2xl font-semibold text-white">Change-readiness report</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Prepared from approved sample documents. The report remains internal until a Reviewer or Admin approves it.</p></div><Badge className={reportStatus === "Approved" ? "bg-emerald-300/15 text-emerald-200 hover:bg-emerald-300/15" : "bg-amber-300/15 text-amber-100 hover:bg-amber-300/15"}>{reportStatus}</Badge></div><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-500">Requested by</p><p className="mt-1 font-medium text-white">Engineer</p></div><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-500">Evidence</p><p className="mt-1 font-medium text-white">3 approved sources</p></div><div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-500">External action</p><p className="mt-1 font-medium text-white">Not permitted</p></div></div><div className="mt-6 rounded-xl border border-white/10 bg-[#071823] p-5 text-sm leading-7 text-slate-300">The draft records pre-change checks and a rollback expectation. This prototype deliberately stops at reviewer approval; it does not execute network changes.</div><div className="mt-5 flex flex-wrap gap-3"><Button onClick={approveReport} disabled={reportStatus !== "Awaiting review"} className="bg-cyan-300 text-[#05202d] hover:bg-cyan-200"><UserRoundCheck />Approve report</Button>{!canApprove && <p className="self-center text-xs text-amber-200">Your current role cannot approve this report.</p>}</div></section></TabsContent>

            <TabsContent value="audit" className="mt-5"><section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="rounded-2xl border border-white/10 bg-[#0a202e] p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-cyan-300">Accountability</p><h2 className="mt-1 text-xl font-semibold text-white">Recent audit events</h2></div><Badge variant="outline" className="border-white/15 text-slate-300">Append-only demo log</Badge></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-medium">Action</th><th className="pb-3 font-medium">Actor</th><th className="pb-3 font-medium">Outcome</th><th className="pb-3 text-right font-medium">Time</th></tr></thead><tbody className="divide-y divide-white/10">{audit.map((event, index) => <tr key={`${event.action}-${index}`}><td className="py-3 text-slate-200">{event.action}</td><td className="py-3 text-slate-400">{event.actor}</td><td className="py-3"><span className={event.outcome === "Blocked" ? "text-rose-200" : event.outcome === "Approved" ? "text-cyan-200" : "text-emerald-200"}>{event.outcome}</span></td><td className="py-3 text-right text-slate-500">{event.time}</td></tr>)}</tbody></table></div></div><div className="rounded-2xl border border-white/10 bg-[#0a202e] p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-cyan-300">Evaluation snapshot</p><h2 className="mt-1 text-xl font-semibold text-white">Controlled test set</h2><div className="mt-5 space-y-3">{metrics.map((metric) => { const Icon = metric.icon; return <div key={metric.label} className="rounded-xl border border-white/10 bg-[#071823] p-4"><div className="flex items-start justify-between"><div><p className="text-xs text-slate-500">{metric.label}</p><p className="mt-1 text-lg font-semibold text-white">{metric.value}</p></div><Icon className="size-4 text-cyan-300" /></div><p className="mt-1 text-xs text-slate-400">{metric.note}</p></div>})}</div><p className="mt-5 text-xs leading-5 text-slate-500">Results are illustrative sample data. Replace them with results from your own documented test cases.</p></div></section></TabsContent>
          </Tabs>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-slate-500"><span>Portfolio prototype · local roles and sample data only</span><span className="flex items-center gap-1">Designed for controlled engineering support <ArrowUpRight className="size-3" /></span></footer>
      </div>
    </main>
  );
}
