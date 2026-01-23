import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = process.env.NODE_ENV === 'production' 
  ? '.env.docker' 
  : '.env';     

const fullPath = path.resolve(process.cwd(), envPath);

if (fs.existsSync(fullPath)) {
  console.log(`Loading environment from: ${fullPath}`);
  const result = dotenv.config({ path: fullPath });
  console.log(`Loaded ${Object.keys(result.parsed || {}).length} environment variables from ${envPath}`);
} else {
  console.warn(`Warning: Environment file not found at ${fullPath}`);
}
