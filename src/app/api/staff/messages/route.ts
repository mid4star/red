import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET: Fetch conversations, a specific thread, or just unread count
export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly');
    const partnerId = searchParams.get('partnerId');
    const myId = auth.id;

    // Just return unread count
    if (countOnly === 'true') {
      const unreadCount = await prisma.message.count({
        where: { receiverId: myId, isRead: false }
      });
      return NextResponse.json({ success: true, unreadCount });
    }

    // Fetch specific conversation thread
    if (partnerId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: myId, receiverId: partnerId },
            { senderId: partnerId, receiverId: myId }
          ]
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, nameAr: true, profilePictureUrl: true } },
          receiver: { select: { id: true, name: true, nameAr: true, profilePictureUrl: true } }
        }
      });
      return NextResponse.json({ success: true, messages });
    }

    // Fetch all conversations (grouped by partner)
    // Get all messages involving this user
    const allMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId },
          { receiverId: myId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, nameAr: true, employeeId: true, profilePictureUrl: true, role: true } },
        receiver: { select: { id: true, name: true, nameAr: true, employeeId: true, profilePictureUrl: true, role: true } }
      }
    });

    // Group by partner
    const conversationMap = new Map<string, any>();
    for (const msg of allMessages) {
      const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(partnerId)) {
        const partner = msg.senderId === myId ? msg.receiver : msg.sender;
        const unreadCount = allMessages.filter(
          m => m.senderId === partnerId && m.receiverId === myId && !m.isRead
        ).length;
        conversationMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          lastMessageByMe: msg.senderId === myId,
          unreadCount
        });
      }
    }

    const conversations = Array.from(conversationMap.values());
    conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    console.error('Error in messages GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Send a new message
export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'receiverId and content are required' }, { status: 400 });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: auth.id,
        receiverId,
        content: content.trim()
      },
      include: {
        sender: { select: { id: true, name: true, nameAr: true, profilePictureUrl: true } },
        receiver: { select: { id: true, name: true, nameAr: true, profilePictureUrl: true } }
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Error in messages POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Mark messages as read
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { partnerId } = body;

    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }

    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: auth.id,
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in messages PATCH:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
