import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

const id = integer('id').primaryKey({ autoIncrement: true })

const createdAt = integer('created_at', { mode: 'timestamp_ms' })
  .$defaultFn(() => new Date())
  .notNull()

const updatedAt = integer('updated_at', { mode: 'timestamp_ms' })
  .$defaultFn(() => new Date())
  .$onUpdateFn(() => new Date())
  .notNull()

// チームメンバー
export const member = sqliteTable('member', {
  id,
  name: text('name').notNull(),
  avatarUrl: text('avatar_url').default(''),
  isLeader: integer('is_leader').default(0).notNull(),
  isConcept: integer('is_concept').default(1).notNull(),
  isFinalStriker: integer('is_final_striker').default(0).notNull(),
  ratioPoint: integer('ratio_point').default(0).notNull(),
  createdAt,
  updatedAt
})

// 役割
export const role = sqliteTable('role_master', {
  id,
  title: text('title').notNull()
})

// メンバーごとのロール
export const memberRole = sqliteTable('member_role', {
  memberId: integer('member_id').references(() => member.id),
  roleId: integer('role_id').references(() => role.id)
})

// 作品
export const work = sqliteTable('work', {
  id,
  registerNo: integer('register_no').notNull(),
  title: text('title').default('').notNull(),
  genre: text('genre').default('').notNull(),
  memberId: integer('member_id').references(() => member.id),
  registeredAt: integer('registered_at', { mode: 'timestamp_ms' }).$defaultFn(() => new Date()).notNull(),
  stageFileUrl: text('stage_file_url').default(''),
  minBpm: integer('min_bpm').default(0).notNull(),
  maxBpm: integer('max_bpm').default(0).notNull(),
  YouTubeUrl: text('youtube_url').default(''),
  SoundCloudUrl: text('soundcloud_url').default(''),
  comment: text('comment').default(''),
})

// インプレッション
export const impression = sqliteTable('impression', {
  id,
  workId: integer('work_id').references(() => work.id),
  hash: text('hash').notNull(),
  name: text('name').default(''),
  country: text('country'),
  point: integer('point').default(100).notNull(),
  isVote: integer('is_vote').default(0).notNull(),
  comment: text('comment').default(''),
  postedAt: integer('posted_at', { mode: 'timestamp_ms' }),
  fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' })
})
