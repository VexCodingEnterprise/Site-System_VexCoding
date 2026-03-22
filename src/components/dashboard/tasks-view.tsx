'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { taskPriorityOptions, taskStatusOptions } from '@/data/demo';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { formatDate } from '@/lib/utils';
import type { Task } from '@/types/dashboard';

export function TasksView() {
  const { workspace, session, updateTask, actionLoading } = useDashboard();
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [projectFilter, setProjectFilter] = useState('Todos');
  const [partnerFilter, setPartnerFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todos');
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<Pick<Task, 'title' | 'description' | 'assigneeId' | 'dueDate' | 'priority' | 'status' | 'branchId'>>({
    title: '',
    description: '',
    assigneeId: 'rafael',
    dueDate: '',
    priority: taskPriorityOptions[1],
    status: taskStatusOptions[0],
    branchId: '',
  });

  const filteredTasks = useMemo(() => {
    if (!workspace) return [];

    return workspace.tasks.filter((task) => {
      const matchMine = !showMineOnly || task.assigneeId === session.partnerId;
      const matchProject = projectFilter === 'Todos' || task.projectId === projectFilter;
      const matchPartner = partnerFilter === 'Todos' || task.assigneeId === partnerFilter;
      const matchPriority = priorityFilter === 'Todos' || task.priority === priorityFilter;
      return matchMine && matchProject && matchPartner && matchPriority;
    });
  }, [workspace, showMineOnly, session.partnerId, projectFilter, partnerFilter, priorityFilter]);

  const selectedTask = workspace?.tasks.find((task) => task.id === selectedTaskId) || null;
  const selectedProject = selectedTask
    ? workspace?.projects.find((project) => project.id === selectedTask.projectId) || null
    : null;
  const selectedBranches = selectedTask
    ? workspace?.branches.filter((branch) => branch.projectId === selectedTask.projectId) || []
    : [];

  useEffect(() => {
    if (!selectedTask) {
      return;
    }

    setTaskForm({
      title: selectedTask.title,
      description: selectedTask.description,
      assigneeId: selectedTask.assigneeId,
      dueDate: selectedTask.dueDate,
      priority: selectedTask.priority,
      status: selectedTask.status,
      branchId: selectedTask.branchId,
    });
  }, [selectedTask]);

  if (!workspace) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Panel>
        <SectionTitle title="Filtros" description="Navegue por todas as tarefas ou apenas pelas suas." />
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4 xl:grid-cols-5">
          <button
            type="button"
            onClick={() => setShowMineOnly((value) => !value)}
            className={`h-11 border text-sm font-medium ${
              showMineOnly ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--line)] bg-[var(--panel)]'
            }`}
          >
            {showMineOnly ? 'Minhas tarefas' : 'Todas as tarefas'}
          </button>
          <select className="field" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
            <option>Todos</option>
            {workspace.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select className="field" value={partnerFilter} onChange={(event) => setPartnerFilter(event.target.value)}>
            <option>Todos</option>
            {workspace.partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.displayName}
              </option>
            ))}
          </select>
          <select className="field" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option>Todos</option>
            {taskPriorityOptions.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {taskStatusOptions.map((status) => (
          <Panel
            key={status}
            className="min-h-[420px]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragTaskId) {
                void updateTask(dragTaskId, { status });
                setDragTaskId(null);
              }
            }}
          >
            <SectionTitle title={status} description={`${filteredTasks.filter((task) => task.status === status).length} tarefas`} />
            <div className="space-y-3 p-3">
              {filteredTasks
                .filter((task) => task.status === status)
                .map((task) => {
                  const project = workspace.projects.find((item) => item.id === task.projectId);
                  const partner = workspace.partners.find((item) => item.id === task.assigneeId);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      draggable
                      onDragStart={() => setDragTaskId(task.id)}
                      onDragEnd={() => setDragTaskId(null)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="w-full border border-[var(--line)] bg-[var(--panel-alt)] px-3 py-3 text-left"
                    >
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="mt-2 text-xs muted">{project?.name}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusPill value={task.priority} />
                        <span className="text-xs muted">{partner?.displayName.split(' ')[0]}</span>
                        <span className="text-xs muted">{formatDate(task.dueDate)}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </Panel>
        ))}
      </div>

      <AnimatePresence>
        {selectedTask ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTaskId(null)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-[var(--line)] bg-[var(--panel)]"
            >
              <div className="sticky top-0 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--panel)] px-4">
                <div>
                  <p className="text-sm font-semibold">{selectedTask.title}</p>
                  <p className="text-xs muted">{selectedProject?.name || 'Sem projeto'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTaskId(null)}
                  className="flex h-10 w-10 items-center justify-center border border-[var(--line)]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 p-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Titulo</span>
                  <input
                    className="field"
                    value={taskForm.title}
                    onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Descricao</span>
                  <textarea
                    className="field"
                    rows={5}
                    value={taskForm.description}
                    onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                  />
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Responsavel</span>
                    <select
                      className="field"
                      value={taskForm.assigneeId}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          assigneeId: event.target.value as typeof current.assigneeId,
                        }))
                      }
                    >
                      {workspace.partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Prazo</span>
                    <input
                      className="field"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Prioridade</span>
                    <select
                      className="field"
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          priority: event.target.value as typeof current.priority,
                        }))
                      }
                    >
                      {taskPriorityOptions.map((priority) => (
                        <option key={priority}>{priority}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Status</span>
                    <select
                      className="field"
                      value={taskForm.status}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          status: event.target.value as typeof current.status,
                        }))
                      }
                    >
                      {taskStatusOptions.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Ramificacao</span>
                  <select
                    className="field"
                    value={taskForm.branchId}
                    onChange={(event) => setTaskForm((current) => ({ ...current, branchId: event.target.value }))}
                  >
                    {selectedBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  disabled={actionLoading || !taskForm.title}
                  onClick={async () => {
                    await updateTask(selectedTask.id, taskForm);
                    setSelectedTaskId(null);
                  }}
                  className="h-11 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Salvar tarefa
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
