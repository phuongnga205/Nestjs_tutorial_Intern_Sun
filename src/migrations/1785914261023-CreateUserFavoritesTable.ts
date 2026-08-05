import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserFavoritesTable1785914261023 implements MigrationInterface {
    name = 'CreateUserFavoritesTable1785914261023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_favorites" ("usersId" integer NOT NULL, "articlesId" integer NOT NULL, CONSTRAINT "PK_ffdbe762d6b281dc3a84a4fd1b1" PRIMARY KEY ("usersId", "articlesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9b10bf53f6d16b355ce259098d" ON "user_favorites"  ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_93fc98d9d34563d649d8079796" ON "user_favorites"  ("articlesId") `);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_9b10bf53f6d16b355ce259098d0" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_93fc98d9d34563d649d80797969" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_93fc98d9d34563d649d80797969"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_9b10bf53f6d16b355ce259098d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93fc98d9d34563d649d8079796"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b10bf53f6d16b355ce259098d"`);
        await queryRunner.query(`DROP TABLE "user_favorites"`);
    }

}
