// Tasks tab — priority-sorted list with overdue and blocked indicators.

import { store } from '../store.js';

const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export function mountTasks(el) {
  function render(state) {
    const { tasks } = state;
    const sorted  = [...tasks].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    const open    = tasks.filter(t => t.status !== 'Done').length;
    const blocked = tasks.filter(t => t.status === 'Blocked').length;

    el.innerHTML = `
      <div class="section-header">
        <h2 class="section-title">TASK COMMAND</h2>
        <span class="section-subtitle">${open} open · ${blocked} blocked</span>
      </div>
      <div class="tasks-list">
        ${sorted.map(task => {
          const overdue = task.status !== 'Done' && new Date(task.dueDate) < new Date();
          return `
            <div class="task-item priority-${task.priority.toLowerCase()} ${overdue ? 'overdue' : ''}">
              <div class="task-priority-bar"></div>
              <div class="task-body">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                  <span class="task-status status-${task.status.toLowerCase().replace(/\s+/g, '-')}">${task.status}</span>
                  <span class="task-assignee">${task.assignee}</span>
                  <span class="task-due ${overdue ? 'overdue' : ''}">${task.dueDate}</span>
                  ${task.tags.map(t => `<span class="task-tag">${t}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  render(store.getState());
  store.subscribe(render);
}
