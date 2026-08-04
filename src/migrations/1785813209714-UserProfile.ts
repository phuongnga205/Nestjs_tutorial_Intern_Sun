import { MigrationInterface, QueryRunner } from "typeorm";

export class UserProfile1785813209714 implements MigrationInterface {
    name = 'UserProfile1785813209714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "file_name" character varying NOT NULL, "file_type" character varying NOT NULL, "file_size" integer NOT NULL, "entity_id" integer, "entity_type" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_follows" ("follower_id" integer NOT NULL, "following_id" integer NOT NULL, CONSTRAINT "PK_abc657d7ff1282910784b819171" PRIMARY KEY ("follower_id", "following_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f7af3bf8f2dcba61b4adc10823" ON "user_follows"  ("follower_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5a71643cec3110af425f92e76e" ON "user_follows"  ("following_id") `);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_5a71643cec3110af425f92e76e5" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_5a71643cec3110af425f92e76e5"`);
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a71643cec3110af425f92e76e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7af3bf8f2dcba61b4adc10823"`);
        await queryRunner.query(`DROP TABLE "user_follows"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
    }

}
