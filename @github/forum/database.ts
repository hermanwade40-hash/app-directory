export type ForumUser = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  reputation: number;
};

export type ForumCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: string;
  threadCount: number;
  postCount: number;
};

export type ForumThread = {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  excerpt: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isLocked?: boolean;
  lastActivity: string;
  tags: string[];
};

export type ForumReport = {
  id: string;
  threadTitle: string;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved';
};

export const users: ForumUser[] = [
  {
    id: 'u-1',
    username: 'maya-admin',
    displayName: 'Maya Chen',
    avatar: 'MC',
    role: 'admin',
    reputation: 12480,
  },
  {
    id: 'u-2',
    username: 'devon-mod',
    displayName: 'Devon Lee',
    avatar: 'DL',
    role: 'moderator',
    reputation: 6420,
  },
  {
    id: 'u-3',
    username: 'sam-builder',
    displayName: 'Sam Rivera',
    avatar: 'SR',
    role: 'member',
    reputation: 985,
  },
];

export const categories: ForumCategory[] = [
  {
    id: 'c-1',
    name: 'Announcements',
    slug: 'announcements',
    description: 'Official news, launch notes, policies, and community updates.',
    accent: 'from-sky-500 to-cyan-300',
    threadCount: 18,
    postCount: 246,
  },
  {
    id: 'c-2',
    name: 'General Discussion',
    slug: 'general-discussion',
    description: 'Open conversation, introductions, questions, and daily topics.',
    accent: 'from-violet-500 to-fuchsia-300',
    threadCount: 142,
    postCount: 2188,
  },
  {
    id: 'c-3',
    name: 'Support Desk',
    slug: 'support-desk',
    description: 'Ask for help, report bugs, and share troubleshooting answers.',
    accent: 'from-emerald-500 to-lime-300',
    threadCount: 76,
    postCount: 934,
  },
  {
    id: 'c-4',
    name: 'Showcase',
    slug: 'showcase',
    description: 'Share projects, resources, wins, and feedback requests.',
    accent: 'from-amber-500 to-orange-300',
    threadCount: 54,
    postCount: 711,
  },
];

export const threads: ForumThread[] = [
  {
    id: 't-1',
    categoryId: 'c-1',
    authorId: 'u-1',
    title: 'Welcome to the new community forum',
    excerpt:
      'Read the launch notes, moderation expectations, and roadmap for upcoming community features.',
    replies: 42,
    views: 3800,
    isPinned: true,
    lastActivity: '12 min ago',
    tags: ['welcome', 'rules', 'roadmap'],
  },
  {
    id: 't-2',
    categoryId: 'c-3',
    authorId: 'u-3',
    title: 'How should we structure onboarding guides?',
    excerpt:
      'I am drafting a guide for new members and would love examples of helpful first-week workflows.',
    replies: 16,
    views: 920,
    lastActivity: '38 min ago',
    tags: ['help', 'guides'],
  },
  {
    id: 't-3',
    categoryId: 'c-2',
    authorId: 'u-2',
    title: 'Weekly wins: what did you ship this week?',
    excerpt:
      'Share launches, experiments, fixes, learning notes, and small victories from the community.',
    replies: 73,
    views: 2100,
    lastActivity: '1 hr ago',
    tags: ['weekly', 'community'],
  },
  {
    id: 't-4',
    categoryId: 'c-4',
    authorId: 'u-3',
    title: 'Showcase your workspace or latest project',
    excerpt:
      'Post screenshots, demos, writeups, or open questions for friendly community feedback.',
    replies: 29,
    views: 1470,
    isLocked: true,
    lastActivity: '3 hrs ago',
    tags: ['showcase', 'feedback'],
  },
];

export const moderationReports: ForumReport[] = [
  {
    id: 'r-1',
    threadTitle: 'Duplicate support request about login links',
    reason: 'Potential duplicate',
    status: 'reviewing',
  },
  {
    id: 'r-2',
    threadTitle: 'External promotion in discussion thread',
    reason: 'Spam / promotion',
    status: 'open',
  },
];

export const forumStats = {
  members: 12842,
  online: 384,
  threads: categories.reduce((total, category) => total + category.threadCount, 0),
  posts: categories.reduce((total, category) => total + category.postCount, 0),
};

export function getCategory(categoryId: string) {
  return categories.find((category) => category.id === categoryId);
}

export function getAuthor(authorId: string) {
  return users.find((user) => user.id === authorId);
}
