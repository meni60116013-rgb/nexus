package com.vcore.sonar

import android.content.*
import android.database.sqlite.*

class AnomalyDatabaseManager(context: Context) : SQLiteOpenHelper(context, "vcore_sonar_anomalies.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE anomalies (id INTEGER PRIMARY KEY AUTOINCREMENT, pos_x REAL, pos_y REAL, distance REAL, confidence REAL, timestamp INTEGER)")
    }
    override fun onUpgrade(db: SQLiteDatabase, o: Int, n: Int) { db.execSQL("DROP TABLE IF EXISTS anomalies"); onCreate(db) }
    fun saveAnomalyVector(vector: SpatialFusionEngine.SpatialVector): Long {
        val values = ContentValues().apply {
            put("pos_x", vector.relativeX); put("pos_y", vector.relativeY)
            put("distance", vector.distanceMeters); put("confidence", vector.confidence)
            put("timestamp", System.currentTimeMillis())
        }
        return writableDatabase.insert("anomalies", null, values)
    }
}