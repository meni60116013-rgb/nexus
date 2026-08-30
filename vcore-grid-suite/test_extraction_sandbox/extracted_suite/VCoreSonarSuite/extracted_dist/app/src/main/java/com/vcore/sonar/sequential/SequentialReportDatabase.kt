package com.vcore.sonar.sequential

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log

/**
 * Micronúcleo de Persistencia de Reportes (VCORE GRID SUITE)
 * Autoría: Manuel de Jesús Ovalle Carrillo
 * Almacenamiento local optimizado para telemetría, inercia y geo-posicionamiento.
 */
class SequentialReportDatabase(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "vcore_sequential_telemetry.db"
        private const val DATABASE_VERSION = 2
        private const val TABLE_REPORTS = "telemetry_reports"
        
        private const val COLUMN_ID = "id"
        private const val COLUMN_LATITUDE = "latitude"
        private const val COLUMN_LONGITUDE = "longitude"
        private const val COLUMN_ALTITUDE = "altitude"
        private const val COLUMN_TIMESTAMP = "timestamp"
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createTableQuery = ("CREATE TABLE $TABLE_REPORTS ("
                + "$COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT, "
                + "$COLUMN_LATITUDE REAL, "
                + "$COLUMN_LONGITUDE REAL, "
                + "$COLUMN_ALTITUDE REAL, "
                + "$COLUMN_TIMESTAMP INTEGER)")
        db.execSQL(createTableQuery)
        Log.d("SequentialReportDatabase", "Tabla de reportes geoespaciales creada exitosamente.")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_REPORTS")
        onCreate(db)
    }

    fun insertGeoReport(latitude: Double, longitude: Double, altitude: Double, timestamp: Long): Long {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_LATITUDE, latitude)
            put(COLUMN_LONGITUDE, longitude)
            put(COLUMN_ALTITUDE, altitude)
            put(COLUMN_TIMESTAMP, timestamp)
        }
        val id = db.insert(TABLE_REPORTS, null, values)
        db.close()
        return id
    }
}
