import json
import os
import random
from typing import List, Optional, Dict, Any
from ..schemas import Task, Demonstration

class TaskLoader:
    def __init__(self):
        self._tasks: Dict[str, Task] = {}
        self._challenge_tasks: Dict[str, Task] = {}
        self._failure_cases: List[Dict[str, Any]] = []
        self.load_data()

    def _resolve_path(self, filename: str) -> Optional[str]:
        # Search priority: 1) top-level data/ dir, 2) relative to backend, 3) local dir
        candidates = [
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", filename)),
            os.path.abspath(os.path.join(os.getcwd(), "data", filename)),
            os.path.abspath(os.path.join(os.path.dirname(__file__), filename))
        ]
        for p in candidates:
            if os.path.exists(p):
                return p
        return None

    def load_data(self):
        self._tasks = {}
        self._challenge_tasks = {}
        self._failure_cases = []

        # 1. Load standard tasks.json
        tasks_path = self._resolve_path("tasks.json")
        if tasks_path and os.path.exists(tasks_path):
            with open(tasks_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                for item in raw_data:
                    task = Task(**item)
                    self._tasks[task.id] = task

        # 2. Load challenge_tasks.json
        challenge_path = self._resolve_path("challenge_tasks.json")
        if challenge_path and os.path.exists(challenge_path):
            with open(challenge_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
                for item in raw_data:
                    task = Task(**item)
                    self._challenge_tasks[task.id] = task
                    self._tasks[task.id] = task

        # 3. Load failure_cases.json
        failure_path = self._resolve_path("failure_cases.json")
        if failure_path and os.path.exists(failure_path):
            with open(failure_path, "r", encoding="utf-8") as f:
                self._failure_cases = json.load(f)
                for fc in self._failure_cases:
                    if "task" in fc and fc["task"]:
                        task = Task(**fc["task"])
                        self._tasks[task.id] = task

    def get_all_tasks(self) -> List[Task]:
        return list(self._tasks.values())

    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def get_random_challenge_task(self) -> Optional[Task]:
        if self._challenge_tasks:
            return random.choice(list(self._challenge_tasks.values()))
        challenge_tasks = [t for t in self._tasks.values() if not t.is_ambiguous]
        if not challenge_tasks:
            return None
        return random.choice(challenge_tasks)

    def get_failure_cases(self) -> List[Dict[str, Any]]:
        return self._failure_cases

    def sanitize_task_for_client(self, task: Task, hide_solution: bool = True) -> Dict:
        """Returns task dict. If hide_solution is True, test_output and hidden_rule are hidden."""
        task_dict = task.model_dump()
        if hide_solution:
            task_dict["test_output"] = None
            task_dict["hidden_rule_description"] = "Rule is hidden until inference and evaluation."
        return task_dict

task_loader = TaskLoader()

