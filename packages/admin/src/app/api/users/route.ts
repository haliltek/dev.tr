import { NextResponse } from 'next/server';

const MOCK_USERS = [
  {
    id: 'usr_1',
    name: 'Halil TEK',
    username: 'haliltek',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    reputation: 4280,
    role: 'Admin / Lead',
    createdAt: '2026-01-15T10:20:00Z',
  },
  {
    id: 'usr_2',
    name: 'Özkan Kütük',
    username: 'ozkankutuk',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    reputation: 3950,
    role: 'Admin / DevOps',
    createdAt: '2026-02-01T14:40:00Z',
  },
  {
    id: 'usr_3',
    name: 'Ahmet Yılmaz',
    username: 'ahmetyilmaz',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    reputation: 1140,
    role: 'Geliştirici',
    createdAt: '2026-05-12T09:15:00Z',
  },
  {
    id: 'usr_4',
    name: 'Zeynep Kaya',
    username: 'zeynepkaya',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    reputation: 890,
    role: 'Geliştirici',
    createdAt: '2026-06-20T16:00:00Z',
  },
  {
    id: 'usr_5',
    name: 'Can Demir',
    username: 'candemir',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120',
    reputation: 640,
    role: 'Geliştirici',
    createdAt: '2026-08-04T11:30:00Z',
  },
];

export async function GET() {
  return NextResponse.json(MOCK_USERS);
}
