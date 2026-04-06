import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserSetting1775462391348 implements MigrationInterface {
    name = 'AddUserSetting1775462391348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_setting" ("id" varchar PRIMARY KEY NOT NULL, "focusDuration" integer NOT NULL DEFAULT (25), "shortBreakDuration" integer NOT NULL DEFAULT (5), "longBreakDuration" integer NOT NULL DEFAULT (15), "sessionsBeforeLongBreak" integer NOT NULL DEFAULT (4), "autoStartNext" boolean NOT NULL DEFAULT (0), "soundEnabled" boolean NOT NULL DEFAULT (1), "soundType" varchar NOT NULL DEFAULT ('default'), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_4b46d4a3adec99377740b0bafa0" UNIQUE ("userId"))`);
        await queryRunner.query(`CREATE TABLE "temporary_user_setting" ("id" varchar PRIMARY KEY NOT NULL, "focusDuration" integer NOT NULL DEFAULT (25), "shortBreakDuration" integer NOT NULL DEFAULT (5), "longBreakDuration" integer NOT NULL DEFAULT (15), "sessionsBeforeLongBreak" integer NOT NULL DEFAULT (4), "autoStartNext" boolean NOT NULL DEFAULT (0), "soundEnabled" boolean NOT NULL DEFAULT (1), "soundType" varchar NOT NULL DEFAULT ('default'), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_4b46d4a3adec99377740b0bafa0" UNIQUE ("userId"), CONSTRAINT "FK_4b46d4a3adec99377740b0bafa0" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_setting"("id", "focusDuration", "shortBreakDuration", "longBreakDuration", "sessionsBeforeLongBreak", "autoStartNext", "soundEnabled", "soundType", "userId", "createdAt", "updatedAt") SELECT "id", "focusDuration", "shortBreakDuration", "longBreakDuration", "sessionsBeforeLongBreak", "autoStartNext", "soundEnabled", "soundType", "userId", "createdAt", "updatedAt" FROM "user_setting"`);
        await queryRunner.query(`DROP TABLE "user_setting"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_setting" RENAME TO "user_setting"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_setting" RENAME TO "temporary_user_setting"`);
        await queryRunner.query(`CREATE TABLE "user_setting" ("id" varchar PRIMARY KEY NOT NULL, "focusDuration" integer NOT NULL DEFAULT (25), "shortBreakDuration" integer NOT NULL DEFAULT (5), "longBreakDuration" integer NOT NULL DEFAULT (15), "sessionsBeforeLongBreak" integer NOT NULL DEFAULT (4), "autoStartNext" boolean NOT NULL DEFAULT (0), "soundEnabled" boolean NOT NULL DEFAULT (1), "soundType" varchar NOT NULL DEFAULT ('default'), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_4b46d4a3adec99377740b0bafa0" UNIQUE ("userId"))`);
        await queryRunner.query(`INSERT INTO "user_setting"("id", "focusDuration", "shortBreakDuration", "longBreakDuration", "sessionsBeforeLongBreak", "autoStartNext", "soundEnabled", "soundType", "userId", "createdAt", "updatedAt") SELECT "id", "focusDuration", "shortBreakDuration", "longBreakDuration", "sessionsBeforeLongBreak", "autoStartNext", "soundEnabled", "soundType", "userId", "createdAt", "updatedAt" FROM "temporary_user_setting"`);
        await queryRunner.query(`DROP TABLE "temporary_user_setting"`);
        await queryRunner.query(`DROP TABLE "user_setting"`);
    }

}
