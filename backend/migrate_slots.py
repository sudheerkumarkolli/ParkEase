import sqlite3

def migrate():
    conn = sqlite3.connect('parkease.db')
    cursor = conn.cursor()
    columns = [row[1] for row in cursor.execute('PRAGMA table_info(parking_slots)').fetchall()]
    print('Existing parking_slots columns:', columns)

    if 'image_url' not in columns:
        cursor.execute('ALTER TABLE parking_slots ADD COLUMN image_url VARCHAR(500)')
        print('Added image_url column')
    if 'floor_level' not in columns:
        cursor.execute("ALTER TABLE parking_slots ADD COLUMN floor_level VARCHAR(50) DEFAULT 'Level 1'")
        print('Added floor_level column')
    if 'description' not in columns:
        cursor.execute('ALTER TABLE parking_slots ADD COLUMN description VARCHAR(500)')
        print('Added description column')

    conn.commit()
    conn.close()
    print('Database migration done!')

if __name__ == '__main__':
    migrate()
