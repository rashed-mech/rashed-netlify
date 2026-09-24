import dotenv from 'dotenv';
import path from 'path';

// Load .env first, then override with .env.local if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
