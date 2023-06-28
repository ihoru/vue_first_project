<script lang="ts" setup>
import {onMounted, onUnmounted, reactive, ref} from "vue";
import {useRefHistory} from "@vueuse/core";
import HelpBlock from "@/components/HelpBlock.vue";
import Task from "@/models/task"

function randomId(length = 10) {
  return Math.random().toString(36).substring(2, length + 2);
}

const tasks = ref([
  new Task(randomId(), 'test1: ' + randomId(), true),
  new Task(randomId(), 'test2: ' + randomId()),
  new Task(randomId(), 'test3: ' + randomId()),
  new Task(randomId(), 'test4: ' + randomId()),
]);

const taskRefs = reactive<{ [key: string]: HTMLInputElement }>({});
const {undo, redo, canUndo, canRedo} = useRefHistory(tasks, {
  deep: true,
  capacity: 10,
});


function setItemRef(task: Task, el: HTMLInputElement) {
  taskRefs[task.id] = el;
}

function tasksReorder() {
  tasks.value = tasks.value.sort(function (taskA: Task, taskB: Task) {
    if (!taskA.done && taskB.done) {
      return 1;
    }
    if (taskA.done && !taskB.done) {
      return -1;
    }
    return 0;
  });
}

function taskCheck(task: Task, index: number, focus: boolean = false) {
  console.log('taskCheck', task.done, task); // TODO: @ihoru
  const isDone = task.done;
  task.done = !task.done;
  if (!isDone) {
    setTimeout(() => {
      const newTask = tasks.value[index];
      if (newTask.id !== task.id) {
        taskRefs[newTask.id].focus();
      }
    });
  }

  // tasks.value.splice(index, 1);
  // console.log(history)
}

function taskDelete(task: Task, index: number, focus: boolean = false) {
  tasks.value.splice(index, 1);
  // TODO: @ihoru focus previous or a new task
  // console.log(history)
}

function taskMoveUp(task: Task, index: number, focus: boolean = false) {
  if (index === 0) {
    return;
  }
  tasks.value[index] = tasks.value[index - 1];
  tasks.value[index - 1] = task;
  if (focus) {
    setTimeout(function () {
      taskRefs[task.id].focus();
    });
  }
}

function taskMoveDown(task: Task, index: number, focus: boolean = false) {
  if (index + 1 === tasks.value.length) {
    return;
  }
  tasks.value[index] = tasks.value[index + 1];
  tasks.value[index + 1] = task;
  if (focus) {
    setTimeout(function () {
      taskRefs[task.id].focus();
    });
  }
}

function taskMoveTop(task: Task, index: number, focus: boolean = false) {
  // TODO: if current task is done prevent moving above other done tasks
  console.log('taskMoveTop')

  if (index === 0) {
    return;
  }
  tasks.value.splice(index, 1);
  tasks.value = [task, ...tasks.value];
  if (focus) {
    setTimeout(function () {
      taskRefs[task.id].focus();
    });
  }
}

function taskMoveBottom(task: Task, index: number, focus: boolean = false) {
  console.log('taskMoveBottom')
  if (index + 1 === tasks.value.length) {
    return;
  }
  tasks.value.splice(index, 1);
  tasks.value.push(task);
  if (focus) {
    setTimeout(function () {
      taskRefs[task.id].focus();
    });
  }
}

function taskFocusUp(index: number) {
  if (index === 0) {
    return;
  }
  const task = tasks.value[index - 1];
  taskRefs[task.id].focus();
}

function taskFocusDown(index: number) {
  if (index + 1 === tasks.value.length) {
    return;
  }
  const task = tasks.value[index + 1];
  taskRefs[task.id].focus();
}

function taskInputKey(task: Task, index: number, event: KeyboardEvent) {
  console.log('taskInputKey', event)
  if (!event.altKey && !event.shiftKey && !event.ctrlKey && event.key === 'PageUp') {
    taskRefs[tasks.value[0].id].focus();
  } else if (!event.altKey && !event.shiftKey && !event.ctrlKey && event.key === 'PageDown') {
    taskRefs[tasks.value[tasks.value.length - 1].id].focus();
  } else if (event.altKey && !event.shiftKey && !event.ctrlKey && event.key === 'Delete') {
    taskDelete(task, index, true);
  }
}

function appKeyUp(event: KeyboardEvent) {
  console.log('appKeyUp', event);
  if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key === 'z') {
    event.preventDefault();
    undo();
  } else if (event.ctrlKey && event.shiftKey && !event.altKey && event.key === 'z') {
    event.preventDefault();
    // FIXME:
    redo();
  } else if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key === 's') {
    event.preventDefault();
    tasksReorder();
  }
}

onMounted(() => {
  document.addEventListener("keyup", appKeyUp);
});
onUnmounted(() => {
  document.removeEventListener("keyup", appKeyUp);
});

</script>

<template>
  <h1>My tasks for today </h1>
  <div class="history">
    <button :disabled="!canUndo" @click="undo">&laquo; undo</button>
    <button :disabled="!canRedo" @click="redo">redo &raquo;</button>
    |
    <button @click="tasksReorder">sort</button>
  </div>
  <ul>
    <li
        v-for="(task, index) in tasks"
        :key="task.id"
        :class="{done: task.done}"
        class="task"
    >
      <div class="actions">
        <input :checked="task.done"
               type="checkbox"
               @change="taskCheck(task, index)"
        >
        <button
            @click="taskDelete(task, index)"
        >&cross;
        </button>
        <button
            @click="taskMoveUp(task, index)"
        >&uparrow;
        </button>
        <button
            @click="taskMoveDown(task, index)"
        >&downarrow;
        </button>
        <button
            @click="taskMoveTop(task, index)"
        >&upuparrows;
        </button>
        <button
            @click="taskMoveBottom(task, index)"
        >&downdownarrows;
        </button>
      </div>
      <div class="content">
        <input :ref="(el) => setItemRef(task, el as HTMLInputElement)"
               v-model="task.title"
               @keydown.exact="taskInputKey(task, index, $event)"
               @keydown.ctrl.enter.prevent.stop.exact="taskCheck(task, index, true)"
               @keydown.enter.prevent.stop.exact="taskFocusDown(index)"
               @keydown.ctrl.up.prevent.stop.exact="taskMoveUp(task, index, true)"
               @keydown.ctrl.down.prevent.stop.exact="taskMoveDown(task, index, true)"
               @keydown.up.prevent.stop.exact="taskFocusUp(index)"
               @keydown.down.prevent.stop.exact="taskFocusDown(index)"
        />
      </div>
    </li>
  </ul>
  <HelpBlock/>
</template>

<style scoped>
ul {
  padding: 0;
  list-style: none;
}


h1,
.history {
  text-align: center;
}

.task {
  margin: 2px;
  padding: 5px;
  border: 1px solid #ccc;
  display: flex;
}

.task .actions {
  flex: 1;
}

.task > * {
  display: flex;
  justify-content: space-evenly;
}

.task .content {
  flex: 2;
}

.task .content input {
  width: 100%;
  border: 1px solid #eee;
  padding: 3px;
}

.task.done {
  opacity: .5;
}
</style>
