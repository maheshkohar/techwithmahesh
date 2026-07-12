import { useEffect, useState } from 'react';
import { Link } from '../context/RouterContext';
import { Card, Button, Input, Select, Textarea, Modal, ProgressBar, Spinner, EmptyState } from './ui';
import { supabase, type Project, type Milestone, type Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from './ProjectsPage';
import {
  ArrowLeft, FolderKanban, MapPin, Calendar, DollarSign, Plus,
  CheckCircle2, Circle, Clock, Trash2, Edit3, User, Mail
} from 'lucide-react';

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null);
  const [showEditProject, setShowEditProject] = useState(false);

  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', start_date: '', end_date: '', color: '#0ea5e9' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'medium', due_date: '' });
  const [editForm, setEditForm] = useState({ name: '', client_name: '', status: 'pending', priority: 'medium', progress: 0, description: '', location: '', budget: '' });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, m, t] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).eq('user_id', user.id).maybeSingle(),
        supabase.from('project_milestones').select('*').eq('project_id', projectId).order('sort_order', { ascending: true }),
        supabase.from('project_tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
      ]);
      setProject(p.data as Project | null);
      setMilestones(m.data as Milestone[] || []);
      setTasks(t.data as Task[] || []);
      if (p.data) {
        const proj = p.data as Project;
        setEditForm({
          name: proj.name, client_name: proj.client_name, status: proj.status,
          priority: proj.priority, progress: proj.progress, description: proj.description || '',
          location: proj.location || '', budget: proj.budget?.toString() || '',
        });
      }
      setLoading(false);
    })();
  }, [user, projectId]);

  const handleAddMilestone = async () => {
    if (!user || !milestoneForm.title) return;
    const { data } = await supabase.from('project_milestones').insert({
      ...milestoneForm,
      project_id: projectId,
      user_id: user.id,
      sort_order: milestones.length,
    }).select().single();
    if (data) {
      setMilestones([...milestones, data as Milestone]);
      setShowMilestoneModal(false);
      setMilestoneForm({ title: '', description: '', start_date: '', end_date: '', color: '#0ea5e9' });
    }
  };

  const handleAddTask = async () => {
    if (!user || !taskForm.title || !activeMilestone) return;
    const { data } = await supabase.from('project_tasks').insert({
      ...taskForm,
      milestone_id: activeMilestone,
      project_id: projectId,
      user_id: user.id,
    }).select().single();
    if (data) {
      setTasks([...tasks, data as Task]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignee: '', priority: 'medium', due_date: '' });
      setActiveMilestone(null);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const { data } = await supabase.from('project_tasks').update({
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null,
    }).eq('id', task.id).select().single();
    if (data) {
      setTasks(tasks.map(t => t.id === task.id ? data as Task : t));
    }
  };

  const deleteMilestone = async (id: string) => {
    await supabase.from('project_milestones').delete().eq('id', id);
    setMilestones(milestones.filter(m => m.id !== id));
    setTasks(tasks.filter(t => t.milestone_id !== id));
  };

  const deleteTask = async (id: string) => {
    await supabase.from('project_tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleEditProject = async () => {
    if (!project) return;
    const { data } = await supabase.from('projects').update({
      name: editForm.name,
      client_name: editForm.client_name,
      status: editForm.status,
      priority: editForm.priority,
      progress: parseInt(editForm.progress.toString()),
      description: editForm.description,
      location: editForm.location,
      budget: editForm.budget ? parseFloat(editForm.budget) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', project.id).select().single();
    if (data) {
      setProject(data as Project);
      setShowEditProject(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!project) {
    return (
      <Card className="p-6">
        <EmptyState icon={<FolderKanban className="w-8 h-8" />} title="Project not found" description="This project may have been deleted." action={<Link to="/projects"><Button>Back to Projects</Button></Link>} />
      </Card>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Project header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <FolderKanban className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-2xl font-bold text-slate-900">{project.name}</h2>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-slate-500 text-sm">{project.description || 'No description provided'}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {project.client_name}</span>
                {project.client_email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {project.client_email}</span>}
                {project.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.location}</span>}
                {project.budget && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> ${project.budget.toLocaleString()}</span>}
                {project.start_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(project.start_date).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowEditProject(true)}><Edit3 className="w-4 h-4" /> Edit</Button>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Overall Progress</span>
            <span className="text-slate-500">{taskProgress}% · {completedTasks}/{totalTasks} tasks</span>
          </div>
          <ProgressBar value={taskProgress} color={taskProgress === 100 ? 'success' : 'primary'} />
        </div>
      </Card>

      {/* Milestones & Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-slate-900">Milestones & Tasks</h3>
          <Button size="sm" onClick={() => setShowMilestoneModal(true)}><Plus className="w-4 h-4" /> Add Milestone</Button>
        </div>

        {milestones.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="No milestones yet"
              description="Break your project into milestones and track tasks within each."
              action={<Button onClick={() => setShowMilestoneModal(true)}><Plus className="w-4 h-4" /> Add Milestone</Button>}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
              const doneCount = milestoneTasks.filter(t => t.status === 'done').length;
              return (
                <Card key={milestone.id} className="overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: milestone.color }} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                          {milestone.description && <p className="text-sm text-slate-500 mt-0.5">{milestone.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                            {milestone.start_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(milestone.start_date).toLocaleDateString()}</span>}
                            {milestone.end_date && <span>→ {new Date(milestone.end_date).toLocaleDateString()}</span>}
                            <span>· {doneCount}/{milestoneTasks.length} tasks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setActiveMilestone(milestone.id); setShowTaskModal(true); }}><Plus className="w-4 h-4" /> Task</Button>
                        <button onClick={() => deleteMilestone(milestone.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    {milestoneTasks.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">No tasks yet. Click "Task" to add one.</p>
                    ) : (
                      <div className="space-y-1">
                        {milestoneTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 group transition-colors">
                            <button onClick={() => toggleTaskStatus(task)} className="flex-shrink-0">
                              {task.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</p>
                              {task.assignee && <p className="text-xs text-slate-500">Assigned to {task.assignee}</p>}
                            </div>
                            {task.due_date && <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}</span>}
                            <PriorityBadge priority={task.priority} />
                            <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestone modal */}
      <Modal open={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
        <div className="space-y-4">
          <Input label="Title" value={milestoneForm.title} onChange={(v) => setMilestoneForm({ ...milestoneForm, title: v })} placeholder="e.g. Site Survey" required />
          <Textarea label="Description" value={milestoneForm.description} onChange={(v) => setMilestoneForm({ ...milestoneForm, description: v })} placeholder="Milestone details..." rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={milestoneForm.start_date} onChange={(v) => setMilestoneForm({ ...milestoneForm, start_date: v })} />
            <Input label="End Date" type="date" value={milestoneForm.end_date} onChange={(v) => setMilestoneForm({ ...milestoneForm, end_date: v })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
            <div className="flex gap-2">
              {['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                <button key={color} onClick={() => setMilestoneForm({ ...milestoneForm, color })} className={`w-8 h-8 rounded-lg ${milestoneForm.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
            <Button onClick={handleAddMilestone} disabled={!milestoneForm.title}>Add Milestone</Button>
          </div>
        </div>
      </Modal>

      {/* Task modal */}
      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Task">
        <div className="space-y-4">
          <Input label="Task Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} placeholder="e.g. Install 4 cameras" required />
          <Textarea label="Description" value={taskForm.description} onChange={(v) => setTaskForm({ ...taskForm, description: v })} placeholder="Task details..." rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Assignee" value={taskForm.assignee} onChange={(v) => setTaskForm({ ...taskForm, assignee: v })} placeholder="Technician name" />
            <Select label="Priority" value={taskForm.priority} onChange={(v) => setTaskForm({ ...taskForm, priority: v })} options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]} />
          </div>
          <Input label="Due Date" type="date" value={taskForm.due_date} onChange={(v) => setTaskForm({ ...taskForm, due_date: v })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!taskForm.title}>Add Task</Button>
          </div>
        </div>
      </Modal>

      {/* Edit project modal */}
      <Modal open={showEditProject} onClose={() => setShowEditProject(false)} title="Edit Project" size="lg">
        <div className="space-y-4">
          <Input label="Project Name" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Client Name" value={editForm.client_name} onChange={(v) => setEditForm({ ...editForm, client_name: v })} />
            <Input label="Location" value={editForm.location} onChange={(v) => setEditForm({ ...editForm, location: v })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Select label="Status" value={editForm.status} onChange={(v) => setEditForm({ ...editForm, status: v })} options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'cancelled', label: 'Cancelled' },
            ]} />
            <Select label="Priority" value={editForm.priority} onChange={(v) => setEditForm({ ...editForm, priority: v })} options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]} />
            <Input label="Progress (%)" type="number" value={editForm.progress.toString()} onChange={(v) => setEditForm({ ...editForm, progress: parseInt(v) || 0 })} />
          </div>
          <Input label="Budget ($)" type="number" value={editForm.budget} onChange={(v) => setEditForm({ ...editForm, budget: v })} />
          <Textarea label="Description" value={editForm.description} onChange={(v) => setEditForm({ ...editForm, description: v })} rows={3} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowEditProject(false)}>Cancel</Button>
            <Button onClick={handleEditProject}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
