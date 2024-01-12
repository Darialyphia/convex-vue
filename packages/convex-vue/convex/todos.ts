import { paginationOptsValidator } from 'convex/server';
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    forceError: v.optional(v.boolean())
  },
  handler: (ctx, args) => {
    console.log('getting todos');
    if (args.forceError) {
      throw new Error('forced error !');
    }
    return ctx.db.query('todos').order('desc').collect();
  }
});

export const paginatedList = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return (
      ctx.db
        .query('todos')
        // .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .order('desc')
        .paginate(args.paginationOpts)
    );
  }
});

export const remove = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  }
});

export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    await ctx.db.insert('todos', {
      text,
      completed: false
    });
  }
});

export const setCompleted = mutation({
  args: { completed: v.boolean(), id: v.id('todos') },
  handler: async (ctx, { id, completed }) => {
    await ctx.db.patch(id, { completed });
  }
});
