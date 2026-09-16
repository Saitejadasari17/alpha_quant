"use client";

import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { AUTH_TOKEN_KEY } from "../../../lib/constants";

interface PlanStep {
  step_number: number;
  capability: string;
  description: string;
  status: string;
}

interface ToolTrace {
  tool: string;
  args: Record<string, any>;
  result: any;
  permission_tier: string;
  duration_ms: number;
}

interface DigitalTwinComparison {
  baseline?: {
    income: number;
    monthly_emi: number;
    monthly_surplus: number;
    dti_ratio_pct: number;
    health_score: number;
  };
  scenario?: {
    loan_principal: number;
    added_monthly_emi: number;
    total_monthly_emi: number;
    new_monthly_surplus: number;
    new_dti_ratio_pct: number;
    new_health_score: number;
    health_score_delta: number;
    affordability_verdict: string;
  };
  feasibility?: {
    verdict: string;
    verdict_explanation: string;
    required_monthly_sip: number;
    growth_mutual_fund_sip: number;
    liquid_emergency_sip: number;
    surplus_gap: number;
  };
  goal?: {
    goal_name: string;
    target_amount: number;
    timeline_years: number;
  };
  action_roadmap?: string[];
  goal_impacts?: Array<{ goalName: string; delay_months: any }>;
}

export default function AgentPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [capability, setCapability] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [traces, setTraces] = useState<ToolTrace[]>([]);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwinComparison | null>(null);

  const handleSend = async (customQuery?: string) => {
    const text = customQuery || query;
    if (!text.trim()) return;

    setLoading(true);
    setResponse(null);
    setCapability(null);
    setPlan([]);
    setTraces([]);
    setDigitalTwin(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:8004/api/v1/agent/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: text, user_id: user?.id || "user_default" }),
      });

      if (!res.ok) throw new Error("Agent request failed");
      const data = await res.json();

      setResponse(data.response);
      setCapability(data.capability);
      setPlan(data.plan || []);
      setTraces(data.traces || []);
      setDigitalTwin(data.digital_twin_comparison || null);
    } catch (err: any) {
      setResponse(`Error communicating with Agent Service: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                ACTIVE SUPERVISOR
              </span>
              <span className="text-slate-400 text-xs">v1.0.0</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
              AlphaQuant Financial Agent
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Deterministic Financial Digital Twin + Autonomous Supervisor Planning
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            <button
              onClick={() => handleSend("Can I reach my financial goal of 10 Lakh Home Down Payment in 3 years?")}
              className="px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 text-xs font-medium rounded-lg transition text-indigo-200"
            >
              🎯 Goal Reachability Roadmap
            </button>
            <button
              onClick={() => handleSend("Can I afford a 15 lakh car next year?")}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium rounded-lg transition"
            >
              🚗 15L Car Affordability
            </button>
            <button
              onClick={() => handleSend("What is the status of my savings goals?")}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium rounded-lg transition"
            >
              📊 Goals Progress
            </button>
          </div>
        </div>

        {/* Input Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask financial question (e.g., 'Can I reach my goal of 10 Lakh Home Down Payment in 3 years?')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Planning...
                </>
              ) : (
                "Execute Plan"
              )}
            </button>
          </div>
        </div>

        {/* Execution Output Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Response & Digital Twin */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Recommendation */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                <span>Agent Recommendation & Action Plan</span>
                {capability && (
                  <span className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-400 font-mono rounded border border-indigo-500/20">
                    Capability: {capability}
                  </span>
                )}
              </h2>

              {response ? (
                <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                  {response}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">
                  Submit a prompt (or click a preset chip above) to observe supervisor capability routing and deterministic scenario execution.
                </p>
              )}
            </div>

            {/* Digital Twin Feasibility Card */}
            {digitalTwin && digitalTwin.feasibility && (
              <div className="bg-slate-900/60 border border-indigo-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-bl uppercase">
                  GOAL REACHABILITY SIMULATION
                </div>

                <h3 className="text-md font-bold text-white mb-4">
                  Target: {digitalTwin.goal?.goal_name} (₹{digitalTwin.goal?.target_amount.toLocaleString()})
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Total Required SIP</span>
                    <div className="text-lg font-bold text-indigo-400 mt-1">₹{digitalTwin.feasibility.required_monthly_sip.toLocaleString()}/mo</div>
                    <div className="text-xs text-slate-400">Growth SIP: ₹{digitalTwin.feasibility.growth_mutual_fund_sip.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">Liquid SIP: ₹{digitalTwin.feasibility.liquid_emergency_sip.toLocaleString()}</div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Current Monthly Surplus</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">₹{digitalTwin.baseline?.monthly_surplus.toLocaleString()}/mo</div>
                    <div className="text-xs text-slate-400">Timeline: {digitalTwin.goal?.timeline_years} Years</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {digitalTwin.feasibility.surplus_gap > 0
                        ? `Surplus Gap: ₹${digitalTwin.feasibility.surplus_gap.toLocaleString()}`
                        : "Surplus Gap: Fully Covered!"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/20">
                  <span className="text-xs text-indigo-200 font-semibold">Feasibility Status:</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded uppercase tracking-wider">
                    {digitalTwin.feasibility.verdict}
                  </span>
                </div>
              </div>
            )}

            {/* Digital Twin Loan Card */}
            {digitalTwin && digitalTwin.scenario && (
              <div className="bg-slate-900/60 border border-indigo-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-bl uppercase">
                  LOAN SCENARIO SIMULATION
                </div>

                <h3 className="text-md font-bold text-white mb-4">
                  Loan Scenario Simulation
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Baseline</span>
                    <div className="text-lg font-bold text-white mt-1">₹{digitalTwin.baseline?.monthly_surplus.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">Monthly Surplus</div>
                    <div className="text-xs text-slate-400 mt-2">DTI: {digitalTwin.baseline?.dti_ratio_pct}%</div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Scenario</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">₹{digitalTwin.scenario.new_monthly_surplus.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">New Monthly Surplus</div>
                    <div className="text-xs text-slate-400 mt-2">New DTI: {digitalTwin.scenario.new_dti_ratio_pct}%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/20">
                  <span className="text-xs text-indigo-200 font-semibold">Affordability Verdict:</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded uppercase tracking-wider">
                    {digitalTwin.scenario.affordability_verdict}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Execution Plan & Agent Traces */}
          <div className="space-y-6">
            
            {/* Plan Steps */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Supervisor Execution Plan
              </h3>

              {plan.length > 0 ? (
                <div className="space-y-3">
                  {plan.map((step) => (
                    <div key={step.step_number} className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {step.step_number}
                      </span>
                      <div className="text-xs">
                        <div className="text-slate-200 font-medium">{step.description}</div>
                        <div className="text-slate-500 font-mono text-[10px] mt-0.5">{step.capability}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic">Plan steps will populate upon query execution.</p>
              )}
            </div>

            {/* Tool Trace Timeline */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-md font-bold text-white mb-4">Tool Execution Trace</h3>

              {traces.length > 0 ? (
                <div className="space-y-3">
                  {traces.map((t, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                      <div className="flex justify-between items-center text-emerald-400 font-semibold mb-1">
                        <span>{t.tool}()</span>
                        <span className="text-slate-500 text-[10px]">{t.duration_ms}ms</span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">
                        Permission: <span className="text-slate-200">{t.permission_tier}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic">No tools executed yet.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
