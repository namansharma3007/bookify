
# Get started

1. Place the `.env.development` file or `.env` file in the root dir
2. [optional] Place the `dump.sql` file in the root dir if you want to create the database for the first time using docker container 
4. Run the app using: `npm run start:dev`

## Commands

```bash
npm run start:database
```

# Database setup

## Starting from scratch

A database dump file is required. Paste the dump file (`dump.sql`) in the root directory and run the following commands to create a docker container and initialize the database with the dump file.

```bash
npm run start:database
```

## Note

Make sure you have the `.env` file. Not the `.env.development`, as the docker env variables are loaded from `.env` by default.

### Entering docker container's mysql

```sh
docker exec -it <containerid> sh # to enter a container's bash
mysql -uroot -proot # to enter mysql
```

### MySql workbench
When connecting the database with a workbench, make sure to turn the following values (if required): 

- allowPublicKeyRetrieval=true
- useSSL=false

More: https://stackoverflow.com/a/50438872 

## Importing database dump for existing container

Assuming you have the dump file `dump.sql` in the root dir, the following steps must be followed:

Run steps (1-3) if you are running it with docker container:

1. Find the docker container id using `docker ps` 
2. Copy the dump file into the docker container: `docker cp dump.sql <container_id>:/dump.sql`
3. Enter into the docker container's shell: `docker exec -it <container_id> /bin/bash`
4. Run this command: `mysql -u<user_name> -p<password> oj_db < dump.sql` where `user_name`=root and `password`=root


## Migrations

Once you get into production you'll need to synchronize model changes into the database. Typically, it is unsafe to use `synchronize: true` for schema synchronization on production once you get data in your database. Here is where migrations come to help.

A migration is just a single file with sql queries to update a database schema and apply new changes to an existing database. There are two methods you must fill with your migration code: **up** and **down**. up has to contain the code you need to perform the migration. down has to revert whatever up changed. down method is used to revert the last migration.

More: 

- [NestJs Database](https://docs.nestjs.com/techniques/database)
- [TypeORM](https://typeorm.io/migration)

### Creating new migrations

Let's say we want to change the User.username to User.fullname. We would run: 
```bash
npm run migration:create --name=UserNameChange
``` 
After you run the command you can see a new file generated in the "migration" directory named `{TIMESTAMP}-UserNameChange.ts` where `{TIMESTAMP}` is the current timestamp when the migration was generated. Now you can open the file and add your migration sql queries there.

```ts
import { MigrationInterface, QueryRunner } from "typeorm"

export class UserNameChangeTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "username" TO "fullname"`,
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "fullname" TO "username"`,
        ) // reverts things made in "up" method
    }
}
```

### Running migrations

Once you have a migration to run on production, you can run them using a CLI command:

```ts
npm run migration:run
```

 **Note**: The `migration:run` and `migration:revert` commands only work on .js files. Thus the typescript files need to be compiled before running the commands. Alternatively, you can use `ts-node` in conjunction with `typeorm` to run .ts migration files. This has already been done in the `package.json`

This command will execute all pending migrations and run them in a sequence ordered by their timestamps. This means all sql queries written in the up methods of your created migrations will be executed. That's all! Now you have your database schema up-to-date.

If for some reason you want to revert the changes, you can run:

```ts
npm run migration:revert
```
This command will execute down in the latest executed migration. If you need to revert multiple migrations you must call this command multiple times.



### Syncing code changes

TypeORM is able to automatically generate migration files with schema changes you made in your **code**. Let's say you have a Post entity with a title column, and you have changed the name title to name. You can run following command:

```ts
npm run migration:generate
```
You don't need to write the queries on your own. The rule of thumb for generating migrations is that you generate them after **each** change you made to your models. 
