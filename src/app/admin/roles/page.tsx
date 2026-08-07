"use client";

import React, { useState } from "react";
import { ENTERPRISE_POSITIONS as Positions } from "@/lib/permissions";
import { ENTERPRISE_DEPARTMENTS, REPORTING_HIERARCHY } from "@/lib/organization";
import { WORKFLOW_CONFIGS } from "@/lib/approval-engine";
import { getActiveDelegations } from "@/lib/delegation";
import { ShieldCheck, GitMerge, Building2, CheckCircle2, Lock, UserCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "hierarchy" | "workflows" | "delegation">("roles");
  const delegations = getActiveDelegations();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            منصة إدارة الهيكل التنظيمي والصلاحيات والسلاسل الإدارية (IAM & Governance)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة الشجرة التنظيمية، مصفوفة الصلاحيات الدقيقة، سلاسل الاعتماد ونظام التفويض المؤقت
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "roles"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="w-4 h-4" />
          مصفوفة الصلاحيات والمسميات ({Positions.length})
        </button>

        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "hierarchy"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="w-4 h-4" />
          الهيكل الإداري والأقسام ({ENTERPRISE_DEPARTMENTS.length})
        </button>

        <button
          onClick={() => setActiveTab("workflows")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "workflows"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitMerge className="w-4 h-4" />
          سلاسل الاعتماد والموافقات ({Object.keys(WORKFLOW_CONFIGS).length})
        </button>

        <button
          onClick={() => setActiveTab("delegation")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "delegation"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          التفويض المؤقت للموافقات ({delegations.length})
        </button>
      </div>

      {/* Tab 1: Roles & Granular Permission Matrix */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Positions.map((pos) => (
            <div
              key={pos.id}
              className="rounded-2xl border bg-card p-5 shadow-card flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {pos.name}
                  </h3>
                  <Badge variant="outline" className="text-xs font-bold">
                    {pos.department}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {pos.description}
                </p>

                {/* Permissions Chips */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    الصلاحيات الدقيقة الممنوحة ({pos.permissions.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pos.permissions.map((p, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border text-slate-700 dark:text-slate-200"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {p.module}: {p.action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Organizational Hierarchy & Visual Tree */}
      {activeTab === "hierarchy" && (
        <div className="space-y-6">
          {/* Visual Reporting Tree */}
          <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-bold text-base border-b pb-3 text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              الشجرة الهيكلية للتسلسل الإداري (Reporting Hierarchy Tree)
            </h3>

            <div className="space-y-2">
              {REPORTING_HIERARCHY.map((node) => (
                <div
                  key={node.positionId}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {node.positionName}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {node.positionId}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground font-semibold">
                    {node.reportsToPositionId ? (
                      <span>يرفع التقارير إلى: <strong className="text-primary">{node.reportsToPositionId}</strong></span>
                    ) : (
                      <span className="text-emerald-600 font-bold">رأس الهيكل التنظيمي</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENTERPRISE_DEPARTMENTS.map((dep) => (
              <div
                key={dep.id}
                className="rounded-2xl border bg-card p-5 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {dep.name}
                    </h3>
                    <Badge variant="secondary" className="font-mono">
                      {dep.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {dep.description}
                  </p>
                </div>

                <div className="border-t pt-3 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>مسؤول القسم:</span>
                  <span className="text-primary font-bold">{dep.headPositionId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Approval Workflows */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(WORKFLOW_CONFIGS).map(([key, wf]) => (
              <div key={key} className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {wf.name}
                  </h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                    نشط ورسمي
                  </Badge>
                </div>

                {/* Workflow Steps Visualization */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground block">
                    تسلسل خطوات الاعتماد الإجباري:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {wf.chain.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-center shrink-0 min-w-[130px]">
                          <span className="text-[10px] font-black text-primary mb-1">
                            خطوة {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {step.name}
                          </span>
                        </div>
                        {idx < wf.chain.length - 1 && (
                          <span className="text-slate-400 font-bold text-base shrink-0">&larr;</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Temporary Delegation */}
      {activeTab === "delegation" && (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b pb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              سجل التفويضات المؤقتة النشطة (Active Temporary Delegations)
            </h3>

            {delegations.map((del) => (
              <div key={del.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      من: {del.delegatorUserName} ({del.delegatorPositionId})
                    </span>
                    <span className="text-primary font-bold">&larr;</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      إلى المفوض: {del.delegateeUserName} ({del.delegateePositionId})
                    </span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold gap-1">
                    <Clock className="w-3 h-3" /> نشط وساري
                  </Badge>
                </div>
                <p className="text-muted-foreground">{del.reason}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t">
                  <span>من: {new Date(del.startDate).toLocaleDateString("ar-SA")}</span>
                  <span>حتى: {new Date(del.endDate).toLocaleDateString("ar-SA")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
