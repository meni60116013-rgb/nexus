package com.nexus.vcore.data

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class EngineeringDbHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "vcore_engineering.db"
        const val DATABASE_VERSION = 2
        const val TABLE_MATERIALS = "materials"
        const val COL_MAT_ID = "id"
        const val COL_MAT_NAME = "name"
        const val COL_MAT_YIELD = "yield_strength_mpa"
        const val COL_MAT_TENSILE = "tensile_strength_mpa"
        const val COL_MAT_DENSITY = "density_g_cm3"
        const val TABLE_TORQUE = "torque_specs"
        const val COL_TORQUE_ID = "id"
        const val COL_THREAD_SIZE = "thread_size"
        const val COL_GRADE = "property_class"
        const val COL_TORQUE_NM = "torque_nm"
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE $TABLE_MATERIALS ($COL_MAT_ID INTEGER PRIMARY KEY AUTOINCREMENT, $COL_MAT_NAME TEXT NOT NULL, $COL_MAT_YIELD REAL NOT NULL, $COL_MAT_TENSILE REAL NOT NULL, $COL_MAT_DENSITY REAL NOT NULL)")
        db.execSQL("CREATE TABLE $TABLE_TORQUE ($COL_TORQUE_ID INTEGER PRIMARY KEY AUTOINCREMENT, $COL_THREAD_SIZE TEXT NOT NULL, $COL_GRADE TEXT NOT NULL, $COL_TORQUE_NM REAL NOT NULL)")
        insertInitialData(db)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        if (oldVersion < 2) {
            db.execSQL("INSERT INTO $TABLE_TORQUE (thread_size, property_class, torque_nm) VALUES ('M12', '10.9', 115.0)")
        }
    }

    private fun insertInitialData(db: SQLiteDatabase) {
        db.execSQL("INSERT INTO $TABLE_MATERIALS (name, yield_strength_mpa, tensile_strength_mpa, density_g_cm3) VALUES ('AISI 4130 Chrome-Moly', 460.0, 560.0, 7.85)")
        db.execSQL("INSERT INTO $TABLE_MATERIALS (name, yield_strength_mpa, tensile_strength_mpa, density_g_cm3) VALUES ('ST52 / E355 Steel', 355.0, 490.0, 7.85)")
        db.execSQL("INSERT INTO $TABLE_TORQUE (thread_size, property_class, torque_nm) VALUES ('M6', '8.8', 9.5)")
        db.execSQL("INSERT INTO $TABLE_TORQUE (thread_size, property_class, torque_nm) VALUES ('M8', '8.8', 23.0)")
        db.execSQL("INSERT INTO $TABLE_TORQUE (thread_size, property_class, torque_nm) VALUES ('M10', '8.8', 46.0)")
        db.execSQL("INSERT INTO $TABLE_TORQUE (thread_size, property_class, torque_nm) VALUES ('M10', '10.9', 67.0)")
        db.execSQL("INSERT INTO $TABLE_TORQUE (thread_size, property_class, torque_nm) VALUES ('M12', '10.9', 115.0)")
    }

    fun torqueSpecsAsJson(): String {
        val c = readableDatabase.rawQuery("SELECT $COL_THREAD_SIZE,$COL_GRADE,$COL_TORQUE_NM FROM $TABLE_TORQUE", null)
        val sb = StringBuilder("[")
        while (c.moveToNext()) {
            if (sb.length > 1) sb.append(",")
            sb.append("{\"thread\":\"${c.getString(0)}\",\"grade\":\"${c.getString(1)}\",\"nm\":${c.getDouble(2)}}")
        }
        c.close(); sb.append("]"); return sb.toString()
    }

    fun materialCount(): Int {
        val c = readableDatabase.rawQuery("SELECT COUNT(*) FROM $TABLE_MATERIALS", null)
        c.moveToFirst(); val n = c.getInt(0); c.close(); return n
    }

    fun torqueCount(): Int {
        val c = readableDatabase.rawQuery("SELECT COUNT(*) FROM $TABLE_TORQUE", null)
        c.moveToFirst(); val n = c.getInt(0); c.close(); return n
    }
}
