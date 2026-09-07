import json
import os
import random
from typing import List, Optional, Dict
from ..schemas import Task, Demonstration

TASKS_FILE_PATH = os.path.join(os.path.dirname(__file__), "tasks.json")

class TaskLoader:
    def __init__(self, filepath: str = TASKS_FILE_PATH):
        self.filepath = filepath
        self._tasks: Dict[str, Task] = {}
        self.load_tasks()

    def load_tasks(self):
        if not os.path.exists(self.filepath):
            self._tasks = {}
            return
        with open(self.filepath, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
            for item in raw_data:
                task = Task(**item)
                self._tasks[task.id] = task

    def get_all_tasks(self) -> List[Task]:
        return list(self._tasks.values())

    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def get_random_challenge_task(self) -> Optional[Task]:
        challenge_tasks = [t for t in self._tasks.values() if not t.is_ambiguous]
        if not challenge_tasks:
            return None
        return random.choice(challenge_tasks)

    def sanitize_task_for_client(self, task: Task, hide_solution: bool = True) -> Dict:
        """Returns task dict. If hide_solution is True, test_output and hidden_rule are hidden."""
        task_dict = task.model_dump()
        if hide_solution:
            task_dict["test_output"] = None
            task_dict["hidden_rule_description"] = "Rule is hidden until inference and evaluation."
        return task_dict

task_loader = TaskLoader()
