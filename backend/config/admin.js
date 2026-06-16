import dotenv from 'dotenv';

dotenv.config();

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'shahzaibzaman465@gmail.com').toLowerCase();

export const isAdminEmail = (email) => (email || '').toLowerCase() === ADMIN_EMAIL;

export const isAdminUser = (user) => user?.role === 'admin' && isAdminEmail(user.email);
