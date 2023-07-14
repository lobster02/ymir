import logging
from typing import List

from sqlalchemy.orm import Session

from app import crud
from app.config import settings
from app.constants.state import RunningStates, TaskState
from app.db.session import SessionLocal
from app.models.task import Task
from app.utils.ymir_controller import ControllerClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def list_unfinished_tasks(db: Session) -> List[Task]:
    tasks = crud.task.get_tasks_by_states(
        db,
        states=RunningStates,
        including_deleted=True,
    )
    return tasks


def terminate_tasks() -> None:
    db = SessionLocal()
    controller = ControllerClient(settings.GRPC_CHANNEL)
    FIRST_ADMIN_ID = 1
    for task in list_unfinished_tasks(db):
        if task.type in settings.TASK_TYPES_WHITELIST:
            # do not terminate task having whitelist type
            continue
        try:
            controller.terminate_task(user_id=FIRST_ADMIN_ID, task_hash=task.hash, task_type=task.type)
        except Exception:
            # terminate legacy tasks shouldn't break start up process
            logger.info("Failed to terminate legacy task: %s", task.hash)
            continue
        else:
            crud.task.update_state(db, task=task, new_state=TaskState.error)
            if task.result_model:
                crud.model.set_result_state_to_error(db, id=task.result_model.id)
            if task.result_dataset:
                crud.dataset.set_result_state_to_error(db, id=task.result_dataset.id)
            if task.result_prediction:
                crud.prediction.set_result_state_to_error(db, id=task.result_prediction.id)
            if task.result_docker_image:
                crud.docker_image.set_result_state_to_error(db, id=task.result_docker_image.id)


def main() -> None:
    logger.info("Cleaning legacy tasks upon start up")
    # todo
    #  put the whole terminating process into background
    terminate_tasks()
    logger.info("Cleaned legacy tasks")


if __name__ == "__main__":
    main()
