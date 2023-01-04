import { Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ current: Timestamp.now().toMillis() });
}
