import { useEffect, useState } from 'react';
import { Link } from '../context/RouterContext';
import { Card, Button, Select, Spinner, EmptyState } from './ui';
import { supabase, type Project, type Milestone } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CalendarRange, FolderKanban, ChevronDown } from 'lucide-react';

export function MilestonesPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, m] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('project_milestones').select('*').eq('user_id', user.id).order('start_date', { ascending: true }),
      ]);
      setProjects(p.data as Project[] || []);
      setMilestones(m.data as Milestone[] || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  const filteredMilestones = selectedProject === 'all'
    ? milestones
    : milestones.filter(m => m.project_id === selectedProject);

  // Build timeline range
  const allDates = filteredMilestones
    .filter(m => m.start_date && m.end_date)
    .flatMap(m => [new Date(m.start_date!).getTime(), new Date(m.end_date!).getTime()]);
  const minDate = allDates.length > 0 ? Math.min(...allDates) : Date.now();
  const maxDate = allDates.length > 0 ? Math.max(...allDates) : Date.now() + 30 * 86400000;
  const range = Math.max(maxDate - minDate, 86400000); // min 1 day

  // Group by project
  const byProject = filteredMilestones.reduce((acc, m) => {
    if (!acc[m.project_id]) acc[m.project_id] = [];
    acc[m.project_id].push(m);
    return acc;
  }, {} as Record<string, Milestone[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Milestones Timeline</h2>
          <p className="text-slate-500 text-sm mt-1">Gantt-style view of all project milestones</p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedProject} onChange={setSelectedProject} options={[
            { value: 'all', label: 'All Projects' },
            ...projects.map(p => ({ value: p.id, label: p.name })),
          ]} />
        </div>
      </div>

      {filteredMilestones.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<CalendarRange className="w-8 h-8" />}
            title="No milestones found"
            description="Add milestones to your projects to see them in the timeline view."
            action={<Link to="/projects"><Button>Go to Projects</Button></Link>}
          />
        </Card>
      ) : (
        <Card className="p-6 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Timeline header */}
            <div className="flex border-b border-slate-200 pb-2 mb-4">
              <div className="w-48 flex-shrink-0 text-xs font-medium text-slate-500 uppercase tracking-wider">Project / Milestone</div>
              <div className="flex-1 relative h-6">
                {[0, 25, 50, 75, 100].map(pct => (
                  <div key={pct} className="absolute top-0 text-xs text-slate-400" style={{ left: `${pct}%` }}>
                    {pct === 0 ? 'Start' : pct === 100 ? 'End' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline rows */}
            <div className="space-y-6">
              {Object.entries(byProject).map(([projectId, projectMilestones]) => {
                const project = projects.find(p => p.id === projectId);
                return (
                  <div key={projectId}>
                    <Link to={`/projects/${projectId}`} className="flex items-center gap-2 mb-3">
                      <FolderKanban className="w-4 h-4 text-primary-500" />
                      <span className="font-medium text-slate-900 text-sm">{project?.name || 'Unknown Project'}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Link>
                    <div className="space-y-2">
                      {projectMilestones.map((milestone) => {
                        const hasDates = milestone.start_date && milestone.end_date;
                        const start = hasDates ? new Date(milestone.start_date!).getTime() : minDate;
                        const end = hasDates ? new Date(milestone.end_date!).getTime() : minDate + 86400000;
                        const leftPct = ((start - minDate) / range) * 100;
                        const widthPct = Math.max(((end - start) / range) * 100, 3);
                        return (
                          <div key={milestone.id} className="flex items-center group">
                            <div className="w-48 flex-shrink-0 pr-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: milestone.color }} />
                                <span className="text-sm text-slate-700 truncate">{milestone.title}</span>
                              </div>
                            </div>
                            <div className="flex-1 relative h-8">
                              <div className="absolute inset-0 flex items-center">
                                <div
                                  className="h-7 rounded-lg flex items-center px-2 text-xs text-white font-medium shadow-sm transition-all hover:h-8 hover:shadow-md cursor-pointer"
                                  style={{
                                    left: `${Math.max(0, leftPct)}%`,
                                    width: `${widthPct}%`,
                                    backgroundColor: milestone.color,
                                    position: 'relative',
                                  }}
                                >
                                  <MilestoneStatusIcon />
                                  <span className="truncate">{milestone.status}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100">
              {[
                { status: 'pending', label: 'Pending', color: '#94a3b8' },
                { status: 'in_progress', label: 'In Progress', color: '#0ea5e9' },
                { status: 'completed', label: 'Completed', color: '#22c55e' },
                { status: 'blocked', label: 'Blocked', color: '#ef4444' },
              ].map(item => (
                <div key={item.status} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function MilestoneStatusIcon() {
  return <span className="w-1.5 h-1.5 rounded-full bg-white/60 mr-1.5 flex-shrink-0" />;
}
