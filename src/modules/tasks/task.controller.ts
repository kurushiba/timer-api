import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { Task } from './task.entity';
import { Auth } from '../../lib/auth';

const router = Router();
const taskRepository = datasource.getRepository(Task);

// GET /tasks — タスク一覧（order昇順）
router.get('/', Auth, async (req: Request, res: Response) => {
  try {
    const tasks = await taskRepository.find({
      where: { userId: req.currentUser.id },
      order: { order: 'ASC' },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /tasks — タスク作成
router.post('/', Auth, async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const task = await taskRepository.save({
      title,
      userId: req.currentUser.id,
    });
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /tasks/reorder — 並び順一括更新（:idより先に定義）
router.patch('/reorder', Auth, async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ message: 'orderedIds is required' });
      return;
    }

    const cases = orderedIds
      .map((id: string, i: number) => `WHEN '${id}' THEN ${i}`)
      .join(' ');

    await taskRepository
      .createQueryBuilder()
      .update(Task)
      .set({ order: () => `CASE "id" ${cases} END` })
      .where('"id" IN (:...ids) AND "userId" = :userId', {
        ids: orderedIds,
        userId: req.currentUser.id,
      })
      .execute();

    res.json({ message: 'Reordered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /tasks/:id — タスク更新
router.patch('/:id', Auth, async (req: Request, res: Response) => {
  try {
    const task = await taskRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser.id },
    });

    if (!task) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    const { title, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (completed !== undefined) task.completed = completed;

    const updated = await taskRepository.save(task);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /tasks/:id — タスク削除
router.delete('/:id', Auth, async (req: Request, res: Response) => {
  try {
    const task = await taskRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser.id },
    });

    if (!task) {
      res.status(404).json({ message: 'Not found' });
      return;
    }

    await taskRepository.remove(task);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
