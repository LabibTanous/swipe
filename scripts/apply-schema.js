#!/usr/bin/env node
// Usage: node scripts/apply-schema.js YOUR_DB_PASSWORD
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/apply-schema.js YOUR_DB_PASSWORD')
  console.error('Find your password at: https://supabase.com/dashboard/project/dwtfcsvmlxoyhljjddlt/settings/database')
  process.exit(1)
}

const schema = fs.readFileSync(path.join(__dirname, '../src/lib/schema.sql'), 'utf8')

const client = new Client({
  host: 'db.dwtfcsvmlxoyhljjddlt.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
})

async function run() {
  console.log('Connecting to Supabase...')
  await client.connect()
  console.log('Connected. Applying schema...')
  await client.query(schema)
  console.log('Schema applied successfully!')
  await client.end()
}

run().catch(e => {
  console.error('Error:', e.message)
  client.end().catch(() => {})
  process.exit(1)
})
