import { Router, Request, Response } from 'express';
import { Between } from 'typeorm';
import datasource from '../../datasource';
import { FocusSession } from './focus-session.entity';
import { Auth } from '../../lib/auth';

const router = Router();
const sessionRepository = datasource.getRepository(FocusSession);

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// GET /sessions/weekly — 今週（月〜日）の曜日別集中時間
router.get('/weekly', Auth, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const sessions = await sessionRepository.find({
      where: {
        userId: req.currentUser.id,
        type: 'focus',
        startedAt: Between(weekStart, weekEnd),
      },
    });

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daily = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = toLocalDateStr(date);

      const totalSeconds = sessions
        .filter((s) => toLocalDateStr(new Date(s.startedAt)) === dateStr)
        .reduce((sum, s) => sum + s.duration, 0);

      daily.push({
        date: dateStr,
        dayOfWeek: dayNames[i],
        totalSeconds,
      });
    }

    res.json({
      weekStart: toLocalDateStr(weekStart),
      weekEnd: toLocalDateStr(weekEnd),
      daily,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /sessions/heatmap — 直近90日間の日別集中時間
router.get('/heatmap', Auth, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 89);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const sessions = await sessionRepository.find({
      where: {
        userId: req.currentUser.id,
        type: 'focus',
        startedAt: Between(start, end),
      },
    });

    const result = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = toLocalDateStr(date);

      const totalSeconds = sessions
        .filter((s) => toLocalDateStr(new Date(s.startedAt)) === dateStr)
        .reduce((sum, s) => sum + s.duration, 0);

      result.push({ date: dateStr, totalSeconds });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /sessions/by-task — タスク別集中時間集計
router.get('/by-task', Auth, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const rows = await sessionRepository
      .createQueryBuilder('s')
      .select('s.taskId', 'taskId')
      .addSelect('t.title', 'taskTitle')
      .addSelect('SUM(s.duration)', 'totalSeconds')
      .innerJoin('s.task', 't')
      .where('s.userId = :userId', { userId: req.currentUser.id })
      .andWhere('s.type = :type', { type: 'focus' })
      .andWhere('s.startedAt BETWEEN :start AND :end', {
        start: weekStart,
        end: weekEnd,
      })
      .groupBy('s.taskId')
      .getRawMany();

    res.json(
      rows.map((r) => ({
        taskId: r.taskId,
        taskTitle: r.taskTitle,
        totalSeconds: Number(r.totalSeconds),
      })),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /sessions — 指定日のセッション一覧
router.get('/', Auth, async (req: Request, res: Response) => {
  try {
    const dateStr = (req.query.date as string) || toLocalDateStr(new Date());
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999`);

    const sessions = await sessionRepository.find({
      where: {
        userId: req.currentUser.id,
        startedAt: Between(dayStart, dayEnd),
      },
      relations: ['task'],
      order: { startedAt: 'DESC' },
    });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /sessions — セッション記録
router.post('/', Auth, async (req: Request, res: Response) => {
  try {
    const { type, duration, interrupted, startedAt, endedAt, taskId } =
      req.body;

    if (!type || duration === undefined || !startedAt) {
      res
        .status(400)
        .json({ message: 'type, duration, startedAt are required' });
      return;
    }

    const session = await sessionRepository.save({
      type,
      duration,
      interrupted: interrupted ?? false,
      startedAt: new Date(startedAt),
      endedAt: endedAt ? new Date(endedAt) : undefined,
      taskId: taskId ?? null,
      userId: req.currentUser.id,
    });

    const sessionWithTask = await sessionRepository.findOne({
      where: { id: session.id },
      relations: ['task'],
    });

    res.status(201).json(sessionWithTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
