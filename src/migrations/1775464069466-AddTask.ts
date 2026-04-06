import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTask1775464069466 implements MigrationInterface {
    name = 'AddTask1775464069466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "completed" boolean NOT NULL DEFAULT (0), "order" integer NOT NULL DEFAULT (0), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_task" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "completed" boolean NOT NULL DEFAULT (0), "order" integer NOT NULL DEFAULT (0), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_task"("id", "title", "completed", "order", "userId", "createdAt", "updatedAt") SELECT "id", "title", "completed", "order", "userId", "createdAt", "updatedAt" FROM "task"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`ALTER TABLE "temporary_task" RENAME TO "task"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" RENAME TO "temporary_task"`);
        await queryRunner.query(`CREATE TABLE "task" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "completed" boolean NOT NULL DEFAULT (0), "order" integer NOT NULL DEFAULT (0), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "task"("id", "title", "completed", "order", "userId", "createdAt", "updatedAt") SELECT "id", "title", "completed", "order", "userId", "createdAt", "updatedAt" FROM "temporary_task"`);
        await queryRunner.query(`DROP TABLE "temporary_task"`);
        await queryRunner.query(`DROP TABLE "task"`);
    }

}
