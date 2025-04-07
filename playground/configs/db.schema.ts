import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: t.int().primaryKey({ autoIncrement: true }),
  name: t.text().notNull(),
  email: t.text().notNull().unique(),
  password: t.text().notNull(),
  createdAt: t.int({ mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const posts = sqliteTable("posts", {
  id: t.int().primaryKey({ autoIncrement: true }),
  title: t.text().notNull(),
  content: t.text().notNull(),
  createdAt: t.int({ mode: "timestamp" }).notNull(),
  userId: t.int().notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
