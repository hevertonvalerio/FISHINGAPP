// Database abstraction layer - PostgreSQL
const pool = require('./pool');

const db = {
  catches: {
    findAll: async () => {
      const { rows } = await pool.query(
        'SELECT * FROM catches ORDER BY date DESC, time DESC'
      );
      return rows.map(rowToCatch);
    },
    findById: async (id) => {
      const { rows } = await pool.query('SELECT * FROM catches WHERE id = $1', [id]);
      return rows.length ? rowToCatch(rows[0]) : null;
    },
    create: async (data) => {
      const now = new Date();
      const { rows } = await pool.query(
        `INSERT INTO catches (species, weight, length, location, date, time, weather, bait_used, photo_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          data.species,
          data.weight,
          data.length || 0,
          data.location,
          data.date || now.toISOString().split('T')[0],
          data.time || now.toTimeString().slice(0, 5),
          data.weather || 'Não informado',
          data.baitUsed || null,
          data.photoUrl || null
        ]
      );
      return rowToCatch(rows[0]);
    },
    update: async (id, data) => {
      const fields = [];
      const values = [];
      let idx = 1;
      if (data.species !== undefined)  { fields.push(`species=$${idx++}`);   values.push(data.species); }
      if (data.weight !== undefined)   { fields.push(`weight=$${idx++}`);    values.push(data.weight); }
      if (data.length !== undefined)   { fields.push(`length=$${idx++}`);    values.push(data.length); }
      if (data.location !== undefined) { fields.push(`location=$${idx++}`);  values.push(data.location); }
      if (data.weather !== undefined)  { fields.push(`weather=$${idx++}`);   values.push(data.weather); }
      if (data.baitUsed !== undefined) { fields.push(`bait_used=$${idx++}`); values.push(data.baitUsed); }
      if (!fields.length) return db.catches.findById(id);
      fields.push(`updated_at=NOW()`);
      values.push(id);
      const { rows } = await pool.query(
        `UPDATE catches SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`,
        values
      );
      return rows.length ? rowToCatch(rows[0]) : null;
    },
    delete: async (id) => {
      const { rowCount } = await pool.query('DELETE FROM catches WHERE id=$1', [id]);
      return rowCount > 0;
    }
  },

  spots: {
    findAll: async () => {
      const { rows } = await pool.query('SELECT * FROM fishing_spots ORDER BY rating DESC');
      return rows.map(rowToSpot);
    },
    findById: async (id) => {
      const { rows } = await pool.query('SELECT * FROM fishing_spots WHERE id=$1', [id]);
      return rows.length ? rowToSpot(rows[0]) : null;
    },
    create: async (data) => {
      const { rows } = await pool.query(
        `INSERT INTO fishing_spots (name, latitude, longitude, catches_count, rating)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [data.name, data.latitude || null, data.longitude || null, data.catches || 0, data.rating || 0]
      );
      return rowToSpot(rows[0]);
    },
    update: async (id, data) => {
      const fields = [];
      const values = [];
      let idx = 1;
      if (data.name !== undefined)    { fields.push(`name=$${idx++}`);           values.push(data.name); }
      if (data.rating !== undefined)  { fields.push(`rating=$${idx++}`);         values.push(data.rating); }
      if (data.catches !== undefined) { fields.push(`catches_count=$${idx++}`);  values.push(data.catches); }
      if (!fields.length) return db.spots.findById(id);
      fields.push(`updated_at=NOW()`);
      values.push(id);
      const { rows } = await pool.query(
        `UPDATE fishing_spots SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`,
        values
      );
      return rows.length ? rowToSpot(rows[0]) : null;
    },
    delete: async (id) => {
      const { rowCount } = await pool.query('DELETE FROM fishing_spots WHERE id=$1', [id]);
      return rowCount > 0;
    }
  },

  weather: {
    getCurrent: async () => {
      const { rows } = await pool.query(
        'SELECT * FROM weather_data ORDER BY recorded_at DESC LIMIT 1'
      );
      if (rows.length) {
        return { ...rowToWeather(rows[0]), fishingCondition: 'Bom', sunrise: '06:15' };
      }
      return {
        temp: 23, windSpeed: 12, windDirection: 'NE',
        waveHeight: 0.8, pressure: 1013, humidity: 75,
        visibility: 10, fishingCondition: 'Bom', sunrise: '06:15'
      };
    },
    getForecast: async () => {
      const { rows } = await pool.query(
        'SELECT * FROM weather_data ORDER BY recorded_at DESC LIMIT 3'
      );
      const base = rows[0] ? rowToWeather(rows[0]) : { temp: 23, windSpeed: 12, windDirection: 'NE', waveHeight: 0.8, pressure: 1013, humidity: 75, visibility: 10 };
      return {
        today: base,
        tomorrow: { ...base, temp: base.temp + 2 },
        dayAfter: { ...base, temp: base.temp + 1 }
      };
    }
  },

  users: {
    findByEmail: async (email) => {
      const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
      return rows.length ? rows[0] : null;
    },
    findById: async (id) => {
      const { rows } = await pool.query('SELECT id, name, email, subscription_plan, created_at FROM users WHERE id=$1', [id]);
      return rows.length ? rows[0] : null;
    },
    create: async (data) => {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, subscription_plan)
         VALUES ($1,$2,$3,$4) RETURNING id, name, email, subscription_plan, created_at`,
        [data.name, data.email, data.passwordHash, data.subscriptionPlan || 'free']
      );
      return rows[0];
    }
  }
};

function rowToCatch(row) {
  return {
    id: row.id,
    species: row.species,
    weight: parseFloat(row.weight),
    length: parseFloat(row.length),
    location: row.location,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    time: row.time,
    weather: row.weather,
    baitUsed: row.bait_used,
    photoUrl: row.photo_url
  };
}

function rowToSpot(row) {
  return {
    id: row.id,
    name: row.name,
    catches: row.catches_count,
    rating: parseFloat(row.rating),
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null
  };
}

function rowToWeather(row) {
  return {
    temp: parseFloat(row.temp),
    windSpeed: row.wind_speed,
    windDirection: row.wind_direction,
    waveHeight: parseFloat(row.wave_height),
    pressure: row.pressure,
    humidity: row.humidity,
    visibility: row.visibility
  };
}

module.exports = db;
