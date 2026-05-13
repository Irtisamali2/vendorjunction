const db = require('../config/db')

async function run() {
  const cols = [
    { name: 'reference_number', sql: "ALTER TABLE license_requests ADD COLUMN reference_number VARCHAR(20) NULL AFTER id" },
    { name: 'is_new', sql: "ALTER TABLE license_requests ADD COLUMN is_new TINYINT(1) NOT NULL DEFAULT 1 AFTER status" },
  ]

  for (const { name, sql } of cols) {
    const [[{ cnt }]] = await db.query(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'license_requests' AND COLUMN_NAME = ?`,
      [name]
    )
    if (!cnt) {
      await db.query(sql)
      console.log(`Added column: ${name}`)
    } else {
      console.log(`Column already exists: ${name}`)
    }
  }

  console.log('Migration v3 complete')
  process.exit(0)
}

run().catch(e => { console.error(e); process.exit(1) })
