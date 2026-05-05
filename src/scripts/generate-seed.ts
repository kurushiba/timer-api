import 'reflect-metadata';
import datasource from '../datasource';
import { User } from '../modules/users/user.entity';
import { FocusSession } from '../modules/sessions/focus-session.entity';
import { Task } from '../modules/tasks/task.entity';

async function seed() {
  await datasource.initialize();

  const userRepo = datasource.getRepository(User);
  const sessionRepo = datasource.getRepository(FocusSession);
  const taskRepo = datasource.getRepository(Task);

  const [user] = await userRepo.find({ order: { createdAt: 'ASC' }, take: 1 });

  if (!user) {
    console.error('エラー: ユーザーが一人も登録されていません。先にユーザーを作成してください。');
    await datasource.destroy();
    process.exit(1);
  }

  const tasks = await taskRepo.find({ where: { userId: user.id } });

  if (tasks.length === 0) {
    console.error('エラー: 対象ユーザーにタスクが1件も登録されていません。先にタスクを作成してください。');
    await datasource.destroy();
    process.exit(1);
  }

  const now = new Date();
  const sessions: Partial<FocusSession>[] = [];

  for (let day = 0; day < 90; day++) {
    const rand = Math.random();
    let count = 0;
    if (rand < 0.25) count = 0;
    else if (rand < 0.55) count = 1;
    else if (rand < 0.78) count = 2;
    else if (rand < 0.93) count = 3;
    else count = 4;

    for (let s = 0; s < count; s++) {
      const startedAt = new Date(now);
      startedAt.setDate(now.getDate() - (89 - day));
      startedAt.setHours(
        Math.floor(Math.random() * 12) + 8,
        Math.floor(Math.random() * 60),
        0,
        0
      );

      const duration = Math.floor(Math.random() * 1500) + 1500;
      const endedAt = new Date(startedAt.getTime() + duration * 1000);

      const taskId =
        Math.random() < 0.2
          ? tasks[Math.floor(Math.random() * tasks.length)].id
          : undefined;

      sessions.push({
        type: 'focus',
        duration,
        interrupted: Math.random() < 0.15,
        startedAt,
        endedAt,
        userId: user.id,
        taskId,
      });
    }
  }

  await sessionRepo.insert(sessions as FocusSession[]);

  const linkedCount = sessions.filter((s) => s.taskId).length;

  console.log('=== シードデータ作成完了 ===');
  console.log(`対象ユーザー: ${user.name} (${user.email})`);
  console.log(`作成したFocusSession件数: ${sessions.length}件`);
  console.log(`うちタスク紐付け済み: ${linkedCount}件 / 対象タスク候補: ${tasks.length}件`);

  await datasource.destroy();
}

seed().catch((err) => {
  console.error('シードデータの作成中にエラーが発生しました:', err);
  process.exit(1);
});
