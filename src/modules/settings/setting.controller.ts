import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { UserSetting } from './user-setting.entity';
import { Auth } from '../../lib/auth';

const router = Router();
const settingRepository = datasource.getRepository(UserSetting);

// GET /settings — ユーザー設定取得（未作成なら初期値で自動生成）
router.get('/', Auth, async (req: Request, res: Response) => {
  try {
    let setting = await settingRepository.findOne({
      where: { userId: req.currentUser.id },
    });

    if (!setting) {
      setting = await settingRepository.save({
        userId: req.currentUser.id,
      });
    }

    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /settings — ユーザー設定更新
router.put('/', Auth, async (req: Request, res: Response) => {
  try {
    const {
      focusDuration,
      shortBreakDuration,
      longBreakDuration,
      sessionsBeforeLongBreak,
      autoStartNext,
      soundEnabled,
      soundType,
    } = req.body;

    let setting = await settingRepository.findOne({
      where: { userId: req.currentUser.id },
    });

    if (!setting) {
      setting = await settingRepository.save({
        userId: req.currentUser.id,
      });
    }

    setting.focusDuration = focusDuration ?? setting.focusDuration;
    setting.shortBreakDuration = shortBreakDuration ?? setting.shortBreakDuration;
    setting.longBreakDuration = longBreakDuration ?? setting.longBreakDuration;
    setting.sessionsBeforeLongBreak = sessionsBeforeLongBreak ?? setting.sessionsBeforeLongBreak;
    setting.autoStartNext = autoStartNext ?? setting.autoStartNext;
    setting.soundEnabled = soundEnabled ?? setting.soundEnabled;
    setting.soundType = soundType ?? setting.soundType;

    const updated = await settingRepository.save(setting);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
