
import React, { useState, useEffect, useCallback } from 'react';
import { FFXIItem, ViewState, AggregatorLog } from './types';
import { Icons, COLORS } from './constants';
import PipelineVisualizer from './components/PipelineVisualizer';
import AggregatorLogView from './components/AggregatorLog';
import { reconcileData } from './services/geminiService';

const MOCK_ITEMS: FFXIItem[] = [
  {
    id: 'Excalibur',
    name: 'Excalibur',
    level: 75,
    jobs: ['PLD', 'RDM'],
    slots: ['Main'],
    bgData: {
      source: 'BG-Wiki',
      url: 'https://www.bg-wiki.com/ffxi/Excalibur',
      description: 'The legendary sword of King Arthur.',
      stats: { Damage: 49, Delay: 233, "Knight's Stratagem": 1 },
      acquisition: ['Relic Weapon Quest', 'Dynamis-Beaucedine']
    },
    clopediaData: {
      source: 'FFXiclopedia',
      url: 'https://ffxiclopedia.fandom.com/wiki/Excalibur',
      description: 'Legendary Relic sword.',
      stats: { DMG: 49, Delay: 233, "Additional Effect": "Chant du Cygne" },
      acquisition: ['Relic Weapon', 'Beaucedine Glacier']
    }
  },
  {
    id: 'Thibron',
    name: 'Thibron',
    level: 99,
    jobs: ['WAR', 'PLD', 'DRK', 'BST', 'SAM'],
    slots: ['Sub'],
    bgData: {
      source: 'BG-Wiki',
      url: 'https://www.bg-wiki.com/ffxi/Thibron',
      description: 'A powerful off-hand sword for multi-hit builds.',
      stats: { Damage: 120, "Weapon Skill Damage": "+10%" },
      acquisition: ['Oboro']
    },
    clopediaData: {
      source: 'FFXiclopedia',
      url: 'https://ffxiclopedia.fandom.com/wiki/Thibron',
      description: 'Oboro JSE weapon.',
      stats: { DMG: 120, "WS DMG": "+10%" },
      acquisition: ['Oboro', 'Port Jeuno']
    }
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [items, setItems] = useState<FFXIItem[]>(MOCK_ITEMS);
  const [logs, setLogs] = useState<AggregatorLog[]>([]);
  const [selectedItem, setSelectedItem] = useState<FFXIItem | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  const addLog = useCallback((message: string, level: AggregatorLog['level'] = 'info', item?: string) => {
    const newLog: AggregatorLog = {
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      level,
      item
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    // Simulate initial scraping activity
    const timeout = setTimeout(() => {
      addLog("Initializing MediaWiki clients...", "info");
      addLog("Connected to www.bg-wiki.com", "success");
      addLog("Connected to ffxiclopedia.fandom.com", "success");
      addLog("Fetching item category: Relic_Weapons", "info");
      addLog("Aggregated Excalibur data successfully", "success", "Excalibur");
    }, 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReconcile = async (item: FFXIItem) => {
    if (!item.bgData || !item.clopediaData) return;
    
    setIsReconciling(true);
    addLog(`Initiating AI reconciliation for ${item.name}...`, 'info');
    
    try {
      const result = await reconcileData(item.bgData, item.clopediaData);
      setItems(prev => prev.map(i => i.id === item.id ? {
        ...i,
        validatedData: {
          description: result.unifiedDescription,
          stats: result.reconciledStats,
          status: result.status,
          aiSummary: result.aiSummary
        }
      } : i));
      addLog(`Validation complete for ${item.name}`, 'success', item.name);
    } catch (err) {
      addLog(`Failed to reconcile ${item.name}`, 'error');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-8 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Icons.Database />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">VANA-DATA</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Aggregator v2.4</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: ViewState.DASHBOARD, label: 'Dashboard', icon: Icons.Activity },
            { id: ViewState.PIPELINE, label: 'Data Pipeline', icon: Icons.Terminal },
            { id: ViewState.EXPLORER, label: 'Item Explorer', icon: Icons.Search },
            { id: ViewState.RECONCILIATION, label: 'AI Validation', icon: Icons.Check }
          ].map(link => (
            <button
              key={link.id}
              onClick={() => setCurrentView(link.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === link.id 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <link.icon />
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 glass rounded-xl border-sky-500/20">
          <p className="text-xs text-slate-400 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-medium">Cloud Pipeline Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {currentView === ViewState.DASHBOARD && 'Operational Overview'}
              {currentView === ViewState.PIPELINE && 'Live Data Pipeline'}
              {currentView === ViewState.EXPLORER && 'Inventory Explorer'}
              {currentView === ViewState.RECONCILIATION && 'Intelligent Reconciliation'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Synchronizing BG-Wiki and FFXiclopedia in real-time.
            </p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => addLog("Force sync triggered", "warn")}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition-colors border border-slate-700"
             >
               Force Sync
             </button>
          </div>
        </header>

        {currentView === ViewState.DASHBOARD && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 glass rounded-2xl border-sky-500/10">
                <p className="text-slate-400 text-sm font-medium mb-1">Total Aggregated Items</p>
                <p className="text-4xl font-bold text-white">42,851</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                  <span className="font-bold">+124</span> since last hour
                </div>
              </div>
              <div className="p-6 glass rounded-2xl border-sky-500/10">
                <p className="text-slate-400 text-sm font-medium mb-1">Conflict Rate</p>
                <p className="text-4xl font-bold text-white">0.82%</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 font-medium">
                  351 items require manual review
                </div>
              </div>
              <div className="p-6 glass rounded-2xl border-sky-500/10">
                <p className="text-slate-400 text-sm font-medium mb-1">API Throughput</p>
                <p className="text-4xl font-bold text-white">12.5 <span className="text-lg text-slate-500">req/s</span></p>
                <div className="mt-4 flex items-center gap-2 text-xs text-sky-400">
                  Stable latency: 45ms
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <AggregatorLogView logs={logs} />
               <div className="glass rounded-2xl p-6 border-slate-800">
                  <h3 className="font-bold text-lg mb-4">Latest Ingested</h3>
                  <div className="space-y-3">
                    {items.slice(0, 5).map(item => (
                      <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                             <span className="text-xs font-bold text-sky-400">Lv{item.level}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-100">{item.name}</h4>
                            <p className="text-xs text-slate-500">{item.jobs.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <span className="px-2 py-1 rounded text-[10px] bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">BG-WIKI</span>
                           <span className="px-2 py-1 rounded text-[10px] bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">FFXIPEDIA</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {currentView === ViewState.PIPELINE && (
          <div className="space-y-8">
            <PipelineVisualizer />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass rounded-2xl p-6 border-slate-800">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Icons.Terminal /> Aggregator Config
                  </h3>
                  <pre className="text-sm mono text-sky-300 p-4 bg-slate-950 rounded-xl overflow-x-auto border border-slate-800">
{`# aggregator.py configuration
WIKI_SOURCES = {
    'bg': 'www.bg-wiki.com/ffxi/',
    'clopedia': 'ffxiclopedia.fandom.com/'
}

RECONCILIATION_STRATEGY = 'ai_validator'
BATCH_SIZE = 50
FIREBASE_TARGET = 'items_v2'`}
                  </pre>
               </div>
               <div className="glass rounded-2xl p-6 border-slate-800">
                  <h3 className="text-lg font-bold mb-4">Worker Health</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Wiki Scraper #1', status: 'Healthy', load: '12%' },
                      { name: 'Wiki Scraper #2', status: 'Healthy', load: '8%' },
                      { name: 'Gemini Logic Unit', status: 'Healthy', load: '45%' },
                      { name: 'Firestore Writer', status: 'Healthy', load: '2%' }
                    ].map((w, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                         <span className="text-sm font-medium">{w.name}</span>
                         <div className="flex items-center gap-3">
                           <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-sky-500" style={{ width: w.load }}></div>
                           </div>
                           <span className="text-xs text-emerald-400">{w.status}</span>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {currentView === ViewState.RECONCILIATION && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-bold text-slate-300">Pending Validation</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedItem?.id === item.id 
                        ? 'border-sky-500 bg-sky-500/5' 
                        : 'border-slate-800 hover:border-slate-600 bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{item.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.validatedData ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.validatedData ? 'VALIDATED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Lv.{item.level} • {item.jobs.slice(0,3).join('/')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
               {selectedItem ? (
                 <div className="glass rounded-2xl border-slate-800 flex flex-col min-h-[600px]">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                       <div>
                         <h3 className="text-xl font-bold text-white">{selectedItem.name}</h3>
                         <p className="text-xs text-slate-500 mt-1">Comparing source entities</p>
                       </div>
                       <button
                         disabled={isReconciling}
                         onClick={() => handleReconcile(selectedItem)}
                         className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-sky-900/20"
                       >
                         {isReconciling ? (
                           <span className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Reconciling...
                           </span>
                         ) : 'Run AI Validation'}
                       </button>
                    </div>

                    <div className="p-6 grid grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <h4 className="text-xs font-bold text-sky-400 tracking-widest uppercase">BG-Wiki Source</h4>
                          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-sm space-y-2">
                            <p className="text-slate-300 italic">"{selectedItem.bgData?.description}"</p>
                            <div className="pt-2 border-t border-slate-800">
                               {Object.entries(selectedItem.bgData?.stats || {}).map(([k, v]) => (
                                 <div key={k} className="flex justify-between py-1">
                                   <span className="text-slate-500">{k}:</span>
                                   <span className="text-slate-200">{v}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-xs font-bold text-indigo-400 tracking-widest uppercase">FFXiclopedia Source</h4>
                          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-sm space-y-2">
                            <p className="text-slate-300 italic">"{selectedItem.clopediaData?.description}"</p>
                            <div className="pt-2 border-t border-slate-800">
                               {Object.entries(selectedItem.clopediaData?.stats || {}).map(([k, v]) => (
                                 <div key={k} className="flex justify-between py-1">
                                   <span className="text-slate-500">{k}:</span>
                                   <span className="text-slate-200">{v}</span>
                                 </div>
                               ))}
                            </div>
                          </div>
                       </div>
                    </div>

                    {selectedItem.validatedData && (
                      <div className="mt-auto p-6 bg-emerald-500/5 border-t border-emerald-500/20 rounded-b-2xl">
                         <div className="flex items-center gap-2 text-emerald-400 mb-4">
                           <Icons.Check />
                           <span className="font-bold uppercase tracking-wider text-xs">AI Consolidated Data</span>
                         </div>
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                               <div className="text-sm text-slate-300 leading-relaxed">
                                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Unified Description</span>
                                  {selectedItem.validatedData.description}
                               </div>
                               <div className="text-sm text-slate-300 leading-relaxed">
                                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Modern Utility Summary</span>
                                  {selectedItem.validatedData.aiSummary}
                               </div>
                            </div>
                            <div className="pt-4 border-t border-emerald-500/10">
                               <span className="block text-xs font-bold text-slate-500 uppercase mb-2">Reconciled Stats</span>
                               <div className="flex flex-wrap gap-2">
                                  {Object.entries(selectedItem.validatedData.stats).map(([k, v]) => (
                                    <span key={k} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded font-mono">
                                      {k}: {v}
                                    </span>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="h-full glass rounded-2xl border-slate-800 border-dashed flex items-center justify-center text-slate-500 italic">
                    Select an item from the left to begin reconciliation
                 </div>
               )}
            </div>
          </div>
        )}

        {currentView === ViewState.EXPLORER && (
          <div className="glass rounded-2xl border-slate-800 p-8 h-[600px] flex items-center justify-center">
            <div className="text-center">
               <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <Icons.Search />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Advanced Item Explorer Coming Soon</h3>
               <p className="text-slate-500 max-w-sm">
                 We are currently indexing over 40,000 items. Full-text search and filtering will be available once the initial synchronization is complete.
               </p>
               <button 
                 onClick={() => setCurrentView(ViewState.DASHBOARD)}
                 className="mt-6 px-6 py-2 bg-sky-600 rounded-xl font-bold hover:bg-sky-500 transition-colors shadow-lg shadow-sky-900/20"
               >
                 Return to Dashboard
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
