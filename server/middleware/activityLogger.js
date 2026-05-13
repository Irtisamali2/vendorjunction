const db = require('../config/db');

/**
 * Log an activity to the activity_logs table.
 * @param {object} params
 * @param {'admin'|'partner'|'system'} params.actorType
 * @param {number|null} params.actorId
 * @param {string|null} params.actorName
 * @param {string|null} params.actorEmail
 * @param {string|null} params.actorIp
 * @param {'auth'|'partner'|'program'|'attachment'|'email'|'license'|'system'} params.category
 * @param {string} params.action
 * @param {string} params.description
 * @param {string|null} params.entityType
 * @param {number|null} params.entityId
 * @param {string|null} params.entityName
 * @param {object|null} params.metadata
 */
async function logActivity(params) {
  try {
    const {
      actorType = 'system', actorId = null, actorName = null, actorEmail = null, actorIp = null,
      category = 'system', action, description,
      entityType = null, entityId = null, entityName = null, metadata = null,
    } = params;
    await db.query(
      `INSERT INTO activity_logs
        (actor_type, actor_id, actor_name, actor_email, actor_ip, category, action, description, entity_type, entity_id, entity_name, metadata)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [actorType, actorId, actorName, actorEmail, actorIp,
       category, action, description, entityType, entityId, entityName,
       metadata ? JSON.stringify(metadata) : null]
    );
  } catch (err) {
    // Never crash the main request due to logging failure
    console.error('Activity log error:', err.message);
  }
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

module.exports = { logActivity, getClientIp };
