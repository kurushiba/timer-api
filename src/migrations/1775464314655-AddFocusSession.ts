import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFocusSession1775464314655 implements MigrationInterface {
    name = 'AddFocusSession1775464314655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "focus_session" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "duration" integer NOT NULL, "interrupted" boolean NOT NULL DEFAULT (0), "startedAt" datetime NOT NULL, "endedAt" datetime, "taskId" varchar, "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_focus_session" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "duration" integer NOT NULL, "interrupted" boolean NOT NULL DEFAULT (0), "startedAt" datetime NOT NULL, "endedAt" datetime, "taskId" varchar, "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_b1ac34e4db8c415d993cadf3b2e" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_3908f346f94fe3f23842a9ac04c" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_focus_session"("id", "type", "duration", "interrupted", "startedAt", "endedAt", "taskId", "userId", "createdAt", "updatedAt") SELECT "id", "type", "duration", "interrupted", "startedAt", "endedAt", "taskId", "userId", "createdAt", "updatedAt" FROM "focus_session"`);
        await queryRunner.query(`DROP TABLE "focus_session"`);
        await queryRunner.query(`ALTER TABLE "temporary_focus_session" RENAME TO "focus_session"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "focus_session" RENAME TO "temporary_focus_session"`);
        await queryRunner.query(`CREATE TABLE "focus_session" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "duration" integer NOT NULL, "interrupted" boolean NOT NULL DEFAULT (0), "startedAt" datetime NOT NULL, "endedAt" datetime, "taskId" varchar, "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "focus_session"("id", "type", "duration", "interrupted", "startedAt", "endedAt", "taskId", "userId", "createdAt", "updatedAt") SELECT "id", "type", "duration", "interrupted", "startedAt", "endedAt", "taskId", "userId", "createdAt", "updatedAt" FROM "temporary_focus_session"`);
        await queryRunner.query(`DROP TABLE "temporary_focus_session"`);
        await queryRunner.query(`DROP TABLE "focus_session"`);
    }

}
