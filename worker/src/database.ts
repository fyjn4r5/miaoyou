import { D1Database } from '@cloudflare/workers-types';
import { 
  Mailbox, 
  CreateMailboxParams, 
  Email, 
  SaveEmailParams, 
  EmailListItem,
  Attachment,
  AttachmentListItem,
  SaveAttachmentParams,
  ChatMessage,
  ChatConversation
} from './types';
import { 
  generateId, 
  getCurrentTimestamp, 
  calculateExpiryTimestamp 
} from './utils';

// 附件分块大小（字节）
const CHUNK_SIZE = 500000; // 约500KB

/**
 * 幂等地为表添加列（若列已存在则跳过）
 */
async function addColumnIfMissing(db: D1Database, table: string, column: string, definition: string): Promise<void> {
  const cols = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
  const exists = cols.results?.some(c => c.name === column);
  if (!exists) {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

/**
 * 初始化数据库
 * @param db 数据库实例
 */
export async function initializeDatabase(db: D1Database): Promise<void> {
  try {
    // 创建邮箱表
    await db.exec(`CREATE TABLE IF NOT EXISTS mailboxes (id TEXT PRIMARY KEY, address TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, ip_address TEXT, last_accessed INTEGER NOT NULL);`);
    
    // 创建邮件表
    await db.exec(`CREATE TABLE IF NOT EXISTS emails (id TEXT PRIMARY KEY, mailbox_id TEXT NOT NULL, from_address TEXT NOT NULL, from_name TEXT, to_address TEXT NOT NULL, subject TEXT, text_content TEXT, html_content TEXT, received_at INTEGER NOT NULL, has_attachments BOOLEAN DEFAULT FALSE, is_read BOOLEAN DEFAULT FALSE, FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id) ON DELETE CASCADE);`);
    
    // 创建附件表
    await db.exec(`CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY, email_id TEXT NOT NULL, filename TEXT NOT NULL, mime_type TEXT NOT NULL, content TEXT, size INTEGER NOT NULL, created_at INTEGER NOT NULL, is_large BOOLEAN DEFAULT FALSE, chunks_count INTEGER DEFAULT 0, FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE);`);
    
    // 创建附件块表
    await db.exec(`CREATE TABLE IF NOT EXISTS attachment_chunks (id TEXT PRIMARY KEY, attachment_id TEXT NOT NULL, chunk_index INTEGER NOT NULL, content TEXT NOT NULL, FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE CASCADE);`);
    
    // [feat] 站内聊天表：与收件箱分离，避免聊天消息刷屏站内邮件
    await db.exec(`CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, mailbox_id TEXT NOT NULL, from_address TEXT NOT NULL, from_name TEXT, to_address TEXT NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL, is_read INTEGER DEFAULT 0);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_messages_mailbox_from ON chat_messages(mailbox_id, from_address, created_at);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_messages_mailbox_to ON chat_messages(mailbox_id, to_address, created_at);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(mailbox_id, is_read);`);
    
    // 创建索引
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_address ON mailboxes(address);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_mailboxes_expires_at ON mailboxes(expires_at);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_mailbox_id ON emails(mailbox_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachment_chunks_attachment_id ON attachment_chunks(attachment_id);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachment_chunks_chunk_index ON attachment_chunks(chunk_index);`);
    
    // [feat] 站内信：为 emails 表添加 is_internal 列（幂等迁移，避免重复添加）
    await addColumnIfMissing(db, 'emails', 'is_internal', 'INTEGER DEFAULT 0');
    // [feat] 站内信：为对话按 peer 地址查询建立索引（from/to 双向，降低扫描行数）
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_mailbox_peer ON emails(mailbox_id, from_address, received_at);`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_emails_mailbox_to ON emails(mailbox_id, to_address, received_at);`);
    
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    // 抛出错误，让上层处理
    throw new Error(`数据库初始化失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 创建邮箱
 * @param db 数据库实例
 * @param params 参数
 * @returns 创建的邮箱
 */
export async function createMailbox(db: D1Database, params: CreateMailboxParams): Promise<Mailbox> {
  const now = getCurrentTimestamp();
  const mailbox: Mailbox = {
    id: generateId(),
    address: params.address,
    password: params.password,
    createdAt: now,
    expiresAt: calculateExpiryTimestamp(params.expiresInHours),
    ipAddress: params.ipAddress,
    lastAccessed: now,
  };
  
  await db.prepare(`INSERT INTO mailboxes (id, address, password, created_at, expires_at, ip_address, last_accessed) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(mailbox.id, mailbox.address, mailbox.password, mailbox.createdAt, mailbox.expiresAt, mailbox.ipAddress, mailbox.lastAccessed).run();
  
  return mailbox;
}

/**
 * 获取邮箱信息（不检查过期时间，邮箱永久有效）
 * @param db 数据库实例
 * @param address 邮箱地址
 * @returns 邮箱信息
 */
export async function getMailbox(db: D1Database, address: string): Promise<Mailbox | null> {
  const now = getCurrentTimestamp();
  const result = await db.prepare(`SELECT id, address, password, created_at, expires_at, ip_address, last_accessed FROM mailboxes WHERE address = ?`).bind(address).first();
  
  if (!result) return null;
  
  // 更新最后访问时间
  await db.prepare(`UPDATE mailboxes SET last_accessed = ? WHERE id = ?`).bind(now, result.id).run();
  
  return {
    id: result.id as string,
    address: result.address as string,
    password: result.password as string,
    createdAt: result.created_at as number,
    expiresAt: result.expires_at as number,
    ipAddress: result.ip_address as string,
    lastAccessed: now,
  };
}

/**
 * 轻量检查邮箱是否存在并返回ID（不更新 last_accessed，节省 D1 写入）
 * @param db 数据库实例
 * @param address 邮箱地址
 * @returns 邮箱ID或null
 */
export async function getMailboxId(db: D1Database, address: string): Promise<string | null> {
  const result = await db.prepare(`SELECT id FROM mailboxes WHERE address = ?`).bind(address).first<{ id: string }>();
  return result?.id || null;
}

/**
 * 登录邮箱（验证用户名和密码）
 * @param db 数据库实例
 * @param address 邮箱地址
 * @param password 密码
 * @returns 邮箱信息
 */
export async function loginMailbox(db: D1Database, address: string, password: string): Promise<Mailbox | null> {
  const now = getCurrentTimestamp();
  const result = await db.prepare(`SELECT id, address, password, created_at, expires_at, ip_address, last_accessed FROM mailboxes WHERE address = ? AND password = ?`).bind(address, password).first();
  
  if (!result) return null;
  
  // 更新最后访问时间
  await db.prepare(`UPDATE mailboxes SET last_accessed = ? WHERE id = ?`).bind(now, result.id).run();
  
  return {
    id: result.id as string,
    address: result.address as string,
    password: result.password as string,
    createdAt: result.created_at as number,
    expiresAt: result.expires_at as number,
    ipAddress: result.ip_address as string,
    lastAccessed: now,
  };
}

/**
 * 获取用户的所有邮箱
 * @param db 数据库实例
 * @param ipAddress IP地址
 * @returns 邮箱列表
 */
export async function getMailboxes(db: D1Database, ipAddress: string): Promise<Mailbox[]> {
  const now = getCurrentTimestamp();
  const results = await db.prepare(`SELECT id, address, created_at, expires_at, ip_address, last_accessed FROM mailboxes WHERE ip_address = ? AND expires_at > ? ORDER BY created_at DESC`).bind(ipAddress, now).all();
  
  if (!results.results) return [];
  
  return results.results.map(result => ({
    id: result.id as string,
    address: result.address as string,
    createdAt: result.created_at as number,
    expiresAt: result.expires_at as number,
    ipAddress: result.ip_address as string,
    lastAccessed: result.last_accessed as number,
  }));
}

/**
 * 删除邮箱
 * @param db 数据库实例
 * @param address 邮箱地址
 */
export async function deleteMailbox(db: D1Database, address: string): Promise<void> {
  // [feat] 由于外键设置了 ON DELETE CASCADE，直接删除邮箱即可级联删除相关邮件和附件
  await db.prepare(`DELETE FROM mailboxes WHERE address = ?`).bind(address).run();
}

/**
 * 清理孤立的附件（没有关联到任何邮件的附件）
 * @param db 数据库实例
 * @returns 删除的附件数量
 */
async function cleanupOrphanedAttachments(db: D1Database): Promise<number> {
    // [refactor] 优化孤立附件的清理逻辑
    try {
        // 一次性查询所有孤立附件及其分块信息
        const orphanedAttachmentsResult = await db.prepare(`
            SELECT a.id 
            FROM attachments a 
            LEFT JOIN emails e ON a.email_id = e.id 
            WHERE e.id IS NULL
        `).all<{ id: string }>();

        if (!orphanedAttachmentsResult.results || orphanedAttachmentsResult.results.length === 0) {
            return 0;
        }

        const attachmentIds = orphanedAttachmentsResult.results.map(row => row.id);
        const placeholders = attachmentIds.map(() => '?').join(',');

        console.log(`找到 ${attachmentIds.length} 个孤立附件，准备清理...`);

        // 批量删除附件分块
        await db.prepare(`DELETE FROM attachment_chunks WHERE attachment_id IN (${placeholders})`).bind(...attachmentIds).run();
        console.log(`已清理孤立附件的所有分块`);

        // 批量删除附件记录
        const deleteResult = await db.prepare(`DELETE FROM attachments WHERE id IN (${placeholders})`).bind(...attachmentIds).run();
        const deletedCount = deleteResult.meta?.changes || 0;
        console.log(`已清理 ${deletedCount} 个孤立附件记录`);

        return deletedCount;
    } catch (error) {
        console.error('清理孤立附件时出错:', error);
        return 0;
    }
}

/**
 * 清理过期邮箱（现在邮箱为永久有效，此函数保留但不再删除邮箱）
 * @param db 数据库实例
 * @returns 删除的邮箱数量
 */
export async function cleanupExpiredMailboxes(db: D1Database): Promise<number> {
  // 邮箱现在永久有效，不再清理
  // 如果需要清理非常旧的邮箱（例如超过1年），可以取消下面的注释
  // const now = getCurrentTimestamp();
  // const oneYearAgo = now - (365 * 24 * 60 * 60);
  // const result = await db.prepare(`DELETE FROM mailboxes WHERE created_at <= ?`).bind(oneYearAgo).run();
  // return result.meta?.changes || 0;
  return 0;
}

/**
 * 清理过期邮件
 * @param db 数据库实例
 * @returns 删除的邮件数量
 */
export async function cleanupExpiredMails(db: D1Database): Promise<number> {
  const now = getCurrentTimestamp();
  const oneDayAgo = now - 24 * 60 * 60;
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60;
  
  // 已读邮件超过24小时删除
  const readResult = await db.prepare(`DELETE FROM emails WHERE received_at <= ? AND is_read = 1`).bind(oneDayAgo).run();
  
  // 未读邮件最多保留90天
  const unreadResult = await db.prepare(`DELETE FROM emails WHERE received_at <= ? AND is_read = 0`).bind(ninetyDaysAgo).run();
  
  await cleanupOrphanedAttachments(db);
  
  return (readResult.meta?.changes || 0) + (unreadResult.meta?.changes || 0);
}

/**
 * 清理已被阅读的邮件
 * @param db 数据库实例
 * @returns 删除的邮件数量
 */
export async function cleanupReadMails(db: D1Database): Promise<number> {
  // [refactor] 同样利用 ON DELETE CASCADE 特性简化逻辑
  const result = await db.prepare(`DELETE FROM emails WHERE is_read = 1`).run();
  
  await cleanupOrphanedAttachments(db);
  
  return result.meta?.changes || 0;
}

/**
 * 清理指定邮件的所有附件
 * @param db 数据库实例
 * @param emailId 邮件ID
 */
async function cleanupAttachments(db: D1Database, emailId: string): Promise<void> {
  // [refactor] 利用 ON DELETE CASCADE，此函数在删除邮件时不再需要手动调用。
  // 但保留此函数以备其他需要单独清理附件的场景。
  try {
    // 获取邮件的所有附件ID
    const attachmentsResult = await db.prepare(`SELECT id FROM attachments WHERE email_id = ?`).bind(emailId).all<{ id: string }>();
    
    if (attachmentsResult.results && attachmentsResult.results.length > 0) {
      const attachmentIds = attachmentsResult.results.map(row => row.id);
      const placeholders = attachmentIds.map(() => '?').join(',');

      console.log(`邮件 ${emailId} 有 ${attachmentIds.length} 个附件需要清理`);
      
      // 批量删除所有分块
      await db.prepare(`DELETE FROM attachment_chunks WHERE attachment_id IN (${placeholders})`).bind(...attachmentIds).run();
      console.log(`已清理附件的所有分块`);
      
      // 批量删除所有附件记录
      await db.prepare(`DELETE FROM attachments WHERE id IN (${placeholders})`).bind(...attachmentIds).run();
      console.log(`已清理邮件 ${emailId} 的所有附件`);
    }
  } catch (error) {
    console.error(`清理邮件 ${emailId} 的附件时出错:`, error);
  }
}

/**
 * 保存邮件
 * @param db 数据库实例
 * @param params 参数
 * @returns 保存的邮件
 */
export async function saveEmail(db: D1Database, params: SaveEmailParams): Promise<Email> {
  try {
    console.log('开始保存邮件...');
    
    const now = getCurrentTimestamp();
    const email: Email = {
      id: generateId(),
      mailboxId: params.mailboxId,
      fromAddress: params.fromAddress,
      fromName: params.fromName || '',
      toAddress: params.toAddress,
      subject: params.subject || '',
      textContent: params.textContent || '',
      htmlContent: params.htmlContent || '',
      receivedAt: now,
      hasAttachments: params.hasAttachments || false,
      isRead: false,
      isInternal: params.isInternal || false,
    };
    
    console.log('准备插入邮件:', email.id);
    
    await db.prepare(`INSERT INTO emails (id, mailbox_id, from_address, from_name, to_address, subject, text_content, html_content, received_at, has_attachments, is_read, is_internal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(email.id, email.mailboxId, email.fromAddress, email.fromName, email.toAddress, email.subject, email.textContent, email.htmlContent, email.receivedAt, email.hasAttachments ? 1 : 0, email.isRead ? 1 : 0, email.isInternal ? 1 : 0).run();
    
    console.log('邮件保存成功:', email.id);
    
    return email;
  } catch (error) {
    console.error('保存邮件失败:', error);
    throw new Error(`保存邮件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 保存附件
 * @param db 数据库实例
 * @param params 参数
 * @returns 保存的附件
 */
export async function saveAttachment(db: D1Database, params: SaveAttachmentParams): Promise<Attachment> {
  try {
    console.log('开始保存附件...');
    
    const now = getCurrentTimestamp();
    const attachmentId = generateId();
    
    // 检查附件大小，决定是否需要分块存储
    const isLarge = params.content.length > CHUNK_SIZE;
    console.log(`附件大小: ${params.content.length} 字节, 是否为大型附件: ${isLarge}`);
    
    if (isLarge) {
      // 大型附件，需要分块存储
      const contentLength = params.content.length;
      const chunksCount = Math.ceil(contentLength / CHUNK_SIZE);
      console.log(`将附件分为 ${chunksCount} 块存储`);
      
      // 创建附件记录，但不存储内容
      const attachment: Attachment = {
        id: attachmentId,
        emailId: params.emailId,
        filename: params.filename,
        mimeType: params.mimeType,
        content: '', // 大型附件不在主表存储内容
        size: params.size,
        createdAt: now,
        isLarge: true,
        chunksCount: chunksCount
      };
      
      // 插入附件记录
      await db.prepare(`INSERT INTO attachments (id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(attachment.id, attachment.emailId, attachment.filename, attachment.mimeType, attachment.content, attachment.size, attachment.createdAt, attachment.isLarge ? 1 : 0, attachment.chunksCount).run();
      
      // 分块存储附件内容
      for (let i = 0; i < chunksCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, contentLength);
        const chunkContent = params.content.substring(start, end);
        const chunkId = generateId();
        
        await db.prepare(`INSERT INTO attachment_chunks (id, attachment_id, chunk_index, content) VALUES (?, ?, ?, ?)`).bind(chunkId, attachment.id, i, chunkContent).run();
        console.log(`保存附件块 ${i+1}/${chunksCount}`);
      }
      
      console.log('大型附件保存成功:', attachment.id);
      return attachment;
    } else {
      // 小型附件，直接存储
      const attachment: Attachment = {
        id: attachmentId,
        emailId: params.emailId,
        filename: params.filename,
        mimeType: params.mimeType,
        content: params.content,
        size: params.size,
        createdAt: now,
        isLarge: false,
        chunksCount: 0
      };
      
      await db.prepare(`INSERT INTO attachments (id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(attachment.id, attachment.emailId, attachment.filename, attachment.mimeType, attachment.content, attachment.size, attachment.createdAt, attachment.isLarge ? 1 : 0, attachment.chunksCount).run();
      
      console.log('小型附件保存成功:', attachment.id);
      return attachment;
    }
  } catch (error) {
    console.error('保存附件失败:', error);
    throw new Error(`保存附件失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取邮件列表
 * @param db 数据库实例
 * @param mailboxId 邮箱ID
 * @returns 邮件列表
 */
export async function getEmails(db: D1Database, mailboxId: string): Promise<EmailListItem[]> {
  const results = await db.prepare(`SELECT id, mailbox_id, from_address, from_name, to_address, subject, received_at, has_attachments, is_read, is_internal FROM emails WHERE mailbox_id = ? ORDER BY received_at DESC`).bind(mailboxId).all();
  
  if (!results.results) return [];
  
  return results.results.map(result => ({
    id: result.id as string,
    mailboxId: result.mailbox_id as string,
    fromAddress: result.from_address as string,
    fromName: result.from_name as string,
    toAddress: result.to_address as string,
    subject: result.subject as string,
    receivedAt: result.received_at as number,
    hasAttachments: !!result.has_attachments,
    isRead: !!result.is_read,
    isInternal: !!result.is_internal,
  }));
}

/**
 * 获取邮件详情
 * @param db 数据库实例
 * @param id 邮件ID
 * @returns 邮件详情
 */
export async function getEmail(db: D1Database, id: string): Promise<Email | null> {
  const result = await db.prepare(`SELECT id, mailbox_id, from_address, from_name, to_address, subject, text_content, html_content, received_at, has_attachments, is_read, is_internal FROM emails WHERE id = ?`).bind(id).first();
  
  if (!result) return null;
  
  // 标记为已读
  await db.prepare(`UPDATE emails SET is_read = 1 WHERE id = ?`).bind(id).run();
  
  return {
    id: result.id as string,
    mailboxId: result.mailbox_id as string,
    fromAddress: result.from_address as string,
    fromName: result.from_name as string,
    toAddress: result.to_address as string,
    subject: result.subject as string,
    textContent: result.text_content as string,
    htmlContent: result.html_content as string,
    receivedAt: result.received_at as number,
    hasAttachments: !!result.has_attachments,
    isRead: true,
    isInternal: !!result.is_internal,
  };
}

/**
 * 获取附件列表
 * @param db 数据库实例
 * @param emailId 邮件ID
 * @returns 附件列表
 */
export async function getAttachments(db: D1Database, emailId: string): Promise<AttachmentListItem[]> {
  const results = await db.prepare(`SELECT id, email_id, filename, mime_type, size, created_at, is_large, chunks_count FROM attachments WHERE email_id = ? ORDER BY created_at ASC`).bind(emailId).all();
  
  if (!results.results) return [];
  
  return results.results.map(result => ({
    id: result.id as string,
    emailId: result.email_id as string,
    filename: result.filename as string,
    mimeType: result.mime_type as string,
    size: result.size as number,
    createdAt: result.created_at as number,
    isLarge: !!result.is_large,
    chunksCount: result.chunks_count as number
  }));
}

/**
 * 获取附件详情
 * @param db 数据库实例
 * @param id 附件ID
 * @returns 附件详情
 */
export async function getAttachment(db: D1Database, id: string): Promise<Attachment | null> {
  const result = await db.prepare(`SELECT id, email_id, filename, mime_type, content, size, created_at, is_large, chunks_count FROM attachments WHERE id = ?`).bind(id).first();
  
  if (!result) return null;
  
  const isLarge = !!result.is_large;
  let content = result.content as string;
  
  // 如果是大型附件，需要从块表中获取内容
  if (isLarge) {
    const chunksCount = result.chunks_count as number;
    content = await getAttachmentContent(db, id, chunksCount);
  }
  
  return {
    id: result.id as string,
    emailId: result.email_id as string,
    filename: result.filename as string,
    mimeType: result.mime_type as string,
    content: content,
    size: result.size as number,
    createdAt: result.created_at as number,
    isLarge: isLarge,
    chunksCount: result.chunks_count as number
  };
}

/**
 * 获取大型附件的内容
 * @param db 数据库实例
 * @param attachmentId 附件ID
 * @param chunksCount 块数量
 * @returns 完整的附件内容
 */
async function getAttachmentContent(db: D1Database, attachmentId: string, chunksCount: number): Promise<string> {
  let content = '';
  
  // 按顺序获取所有块
  for (let i = 0; i < chunksCount; i++) {
    const chunk = await db.prepare(`SELECT content FROM attachment_chunks WHERE attachment_id = ? AND chunk_index = ?`).bind(attachmentId, i).first();
    if (chunk && chunk.content) {
      content += chunk.content as string;
    }
  }
  
  return content;
}

/**
 * 删除邮件
 * @param db 数据库实例
 * @param id 邮件ID
 */
export async function deleteEmail(db: D1Database, id: string): Promise<void> {
  // [refactor] 由于外键设置了 ON DELETE CASCADE，直接删除邮件即可
  await db.prepare(`DELETE FROM emails WHERE id = ?`).bind(id).run();
}

/**
 * 将邮件标记为未读
 * @param db 数据库实例
 * @param id 邮件ID
 */
export async function markEmailAsUnread(db: D1Database, id: string): Promise<void> {
  await db.prepare(`UPDATE emails SET is_read = 0 WHERE id = ?`).bind(id).run();
}

/**
 * 批量删除邮件
 * @param db 数据库实例
 * @param emailIds 邮件ID数组
 */
export async function batchDeleteEmails(db: D1Database, emailIds: string[]): Promise<void> {
  if (emailIds.length === 0) return;
  const placeholders = emailIds.map(() => '?').join(',');
  await db.prepare(`DELETE FROM emails WHERE id IN (${placeholders})`).bind(...emailIds).run();
}

/**
 * 批量标记邮件为已读
 * @param db 数据库实例
 * @param emailIds 邮件ID数组
 */
export async function batchMarkEmailsAsRead(db: D1Database, emailIds: string[]): Promise<void> {
  if (emailIds.length === 0) return;
  const placeholders = emailIds.map(() => '?').join(',');
  await db.prepare(`UPDATE emails SET is_read = 1 WHERE id IN (${placeholders})`).bind(...emailIds).run();
}

/**
 * 批量标记邮件为未读
 * @param db 数据库实例
 * @param emailIds 邮件ID数组
 */
export async function batchMarkEmailsAsUnread(db: D1Database, emailIds: string[]): Promise<void> {
  if (emailIds.length === 0) return;
  const placeholders = emailIds.map(() => '?').join(',');
  await db.prepare(`UPDATE emails SET is_read = 0 WHERE id IN (${placeholders})`).bind(...emailIds).run();
}

/**
 * 获取邮箱总数
 * @param db 数据库实例
 * @returns 邮箱总数
 */
export async function getMailboxCount(db: D1Database): Promise<number> {
  const result = await db.prepare(`SELECT COUNT(*) as count FROM mailboxes`).first<{ count: number }>();
  return result?.count || 0;
}

/**
 * 获取指定IP在24小时内创建的邮箱数量
 * @param db 数据库实例
 * @param ipAddress IP地址
 * @returns 邮箱数量
 */
export async function getMailboxCountByIpLast24h(db: D1Database, ipAddress: string): Promise<number> {
  const now = getCurrentTimestamp();
  const oneDayAgo = now - (24 * 60 * 60);
  const result = await db.prepare(`SELECT COUNT(*) as count FROM mailboxes WHERE ip_address = ? AND created_at > ?`).bind(ipAddress, oneDayAgo).first<{ count: number }>();
  return result?.count || 0;
}

/**
 * 发送站内消息（写入独立的 chat_messages 表，双方各自一条，不进入收件箱）
 * @param db 数据库实例
 * @param fromMailbox 发件人邮箱
 * @param toMailbox 收件人邮箱
 * @param fromName 发件人显示名（地址）
 * @param content 消息内容
 * @returns 发件人侧保存的消息
 */
export async function sendInternalMessage(
  db: D1Database,
  fromMailbox: Mailbox,
  toMailbox: Mailbox,
  fromName: string,
  content: string
): Promise<ChatMessage> {
  const now = getCurrentTimestamp();

  // 发件人侧副本：is_read=1（自己已读）；收件人侧副本：is_read=0（未读）
  const senderId = generateId();
  const receiverId = generateId();

  // 两条写入合并在一次 batch 中，降低 D1 事务开销
  await db.batch([
    db.prepare(`INSERT INTO chat_messages (id, mailbox_id, from_address, from_name, to_address, content, created_at, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(senderId, fromMailbox.id, fromMailbox.address, fromName, toMailbox.address, content, now, 1),
    db.prepare(`INSERT INTO chat_messages (id, mailbox_id, from_address, from_name, to_address, content, created_at, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(receiverId, toMailbox.id, fromMailbox.address, fromName, toMailbox.address, content, now, 0),
  ]);

  console.log(`站内消息发送成功: ${fromMailbox.address} -> ${toMailbox.address}`);
  return {
    id: senderId,
    fromAddress: fromMailbox.address,
    toAddress: toMailbox.address,
    fromName: fromName || '',
    subject: '站内消息',
    textContent: content,
    receivedAt: now,
    isRead: true,
  };
}

/**
 * 获取与某用户之间的对话消息（轻量、增量查询，降低 D1 读取量）
 * @param db 数据库实例
 * @param mailboxId 当前邮箱ID
 * @param peerAddress 对方邮箱地址
 * @param since 若>0则只获取大于该时间戳的新消息（增量轮询）；为0则获取最近 limit 条
 * @param limit 单次最多返回条数
 * @returns 聊天消息列表（按时间升序）
 */
export async function getChatMessages(
  db: D1Database,
  mailboxId: string,
  peerAddress: string,
  since: number,
  limit: number
): Promise<ChatMessage[]> {
let rows: Array<{
    id: string;
    from_address: string;
    from_name: string;
    to_address: string;
    content: string;
    created_at: number;
    is_read: number | boolean;
  }> = [];

  if (since > 0) {
    // 增量轮询：只取新消息（用 >= 防止同一秒内的消息被遗漏，客户端按 id 去重）
    const res = await db.prepare(`
      SELECT id, from_address, from_name, to_address, content, created_at, is_read
      FROM chat_messages
      WHERE mailbox_id = ? AND (from_address = ? OR to_address = ?) AND created_at >= ?
      ORDER BY created_at ASC
      LIMIT ?
    `).bind(mailboxId, peerAddress, peerAddress, since, limit).all<{
      id: string;
      from_address: string;
      from_name: string;
      to_address: string;
      content: string;
      created_at: number;
      is_read: number | boolean;
    }>();
    rows = res.results || [];
  } else {
    // 初始加载：取最近 limit 条（先按时间倒序取，再升序返回）
    const res = await db.prepare(`
      SELECT id, from_address, from_name, to_address, content, created_at, is_read
      FROM chat_messages
      WHERE mailbox_id = ? AND (from_address = ? OR to_address = ?)
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(mailboxId, peerAddress, peerAddress, limit).all<{
      id: string;
      from_address: string;
      from_name: string;
      to_address: string;
      content: string;
      created_at: number;
      is_read: number | boolean;
    }>();
    rows = (res.results || []).reverse();
  }

  return rows.map(r => ({
    id: r.id,
    fromAddress: r.from_address,
    toAddress: r.to_address,
    fromName: r.from_name || '',
    subject: '',
    textContent: r.content || '',
    receivedAt: r.created_at,
    isRead: !!r.is_read,
  }));
}

/**
 * 删除与某用户之间的站内消息（同时删除双方各自保存的副本）
 * @param db 数据库实例
 * @param myId 当前邮箱ID
 * @param myAddress 当前邮箱地址
 * @param peerId 对方邮箱ID
 * @param peerAddress 对方邮箱地址
 * @param afterTs 只删除该时间戳之后的消息（秒）；为0表示全部
 * @returns 删除的消息条数
 */
export async function deleteInternalMessages(
  db: D1Database,
  myId: string,
  myAddress: string,
  peerId: string,
  peerAddress: string,
  afterTs: number
): Promise<number> {
  // 双方各自删除 from/to 与双方匹配的站内消息
  const timeCond = afterTs > 0 ? ` AND created_at >= ${afterTs}` : '';

  const myRes = await db.prepare(`
    DELETE FROM chat_messages
    WHERE mailbox_id = ? AND ((from_address = ? AND to_address = ?) OR (from_address = ? AND to_address = ?))${timeCond}
  `).bind(myId, myAddress, peerAddress, peerAddress, myAddress).run();

  const peerRes = await db.prepare(`
    DELETE FROM chat_messages
    WHERE mailbox_id = ? AND ((from_address = ? AND to_address = ?) OR (from_address = ? AND to_address = ?))${timeCond}
  `).bind(peerId, myAddress, peerAddress, peerAddress, myAddress).run();

  const deleted = (myRes.meta?.changes || 0) + (peerRes.meta?.changes || 0);
  console.log(`清理站内聊天记录: ${deleted} 条（${myAddress} <-> ${peerAddress}${afterTs > 0 ? `, 自 ${afterTs} 起` : ', 全部'}）`);
  return deleted;
}

/**
 * 获取当前邮箱的站内会话列表（最近的对话 = 谁发来、发了什么、几条未读）
 * @param db 数据库实例
 * @param mailboxId 当前邮箱ID
 * @param myAddress 当前邮箱地址
 * @param limit 最多扫描的消息条数（用于聚合最近会话）
 */
export async function getChatConversations(
  db: D1Database,
  mailboxId: string,
  myAddress: string,
  limit = 200
): Promise<ChatConversation[]> {
  // 取最近的消息，聚合出每个对方最近一条内容
  const res = await db.prepare(`
    SELECT from_address, to_address, content, created_at
    FROM chat_messages
    WHERE mailbox_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(mailboxId, limit).all<{
    from_address: string;
    to_address: string;
    content: string;
    created_at: number;
  }>();
  const rows = res.results || [];

  const latest = new Map<string, { lastMessage: string; lastAt: number }>();
  for (const r of rows) {
    const peer = r.from_address === myAddress ? r.to_address : r.from_address;
    if (!peer || peer === myAddress) continue;
    if (!latest.has(peer)) {
      latest.set(peer, { lastMessage: r.content || '', lastAt: r.created_at });
    }
  }

  // 对方发来的未读数
  const unreadRes = await db.prepare(`
    SELECT from_address, COUNT(*) AS cnt
    FROM chat_messages
    WHERE mailbox_id = ? AND is_read = 0
    GROUP BY from_address
  `).bind(mailboxId).all<{ from_address: string; cnt: number }>();
  const unreadMap = new Map<string, number>();
  for (const u of unreadRes.results || []) {
    unreadMap.set(u.from_address, u.cnt);
  }

  const conversations: ChatConversation[] = [...latest.entries()].map(([peer, info]) => ({
    peer,
    lastMessage: info.lastMessage,
    lastAt: info.lastAt,
    unreadCount: unreadMap.get(peer) || 0,
  }));

  conversations.sort((a, b) => b.lastAt - a.lastAt);
  return conversations;
}

/**
 * 将某用户发给我的聊天消息标记为已读（打开聊天/轮询时调用）
 * @param db 数据库实例
 * @param mailboxId 当前邮箱ID
 * @param peerAddress 对方邮箱地址
 */
export async function markChatRead(db: D1Database, mailboxId: string, peerAddress: string): Promise<void> {
  await db.prepare(`UPDATE chat_messages SET is_read = 1 WHERE mailbox_id = ? AND from_address = ? AND is_read = 0`)
    .bind(mailboxId, peerAddress).run();
}

/**
 * 获取当前邮箱未读站内消息数量（用于角标/提示条）
 * @param db 数据库实例
 * @param mailboxId 当前邮箱ID
 * @returns 未读数量
 */
export async function getUnreadChatCount(db: D1Database, mailboxId: string): Promise<number> {
  const result = await db.prepare(`SELECT COUNT(*) as count FROM chat_messages WHERE mailbox_id = ? AND is_read = 0`)
    .bind(mailboxId).first<{ count: number }>();
  return result?.count || 0;
}