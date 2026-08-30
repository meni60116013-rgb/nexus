package com.hiddensignal.scanner.data

import android.content.Context
import kotlinx.coroutines.flow.Flow

class DeviceRepository(context: Context) {
    private val db = AppDatabase.get(context)
    private val dao = db.deviceDao()
    private val sightingDao = db.sightingDao()

    fun observeAll(): Flow<List<DeviceEntity>> = dao.observeAll()
    fun observeWhitelist(): Flow<List<DeviceEntity>> = dao.observeWhitelist()

    /**
     * Registra una detección. Devuelve el DeviceEntity actualizado para
     * que el caller (el servicio de escaneo) pueda pasarlo al motor de
     * alertas sin tener que volver a consultarlo.
     */
    suspend fun reportSighting(address: String, name: String?, type: DeviceType, rssi: Int): DeviceEntity {
        val now = System.currentTimeMillis()
        val existing = dao.findByAddress(address)
        val entity = if (existing != null) {
            existing.copy(
                name = name ?: existing.name,
                lastRssi = rssi,
                lastSeen = now,
                timesSeen = existing.timesSeen + 1
            )
        } else {
            DeviceEntity(
                address = address, name = name, type = type, lastRssi = rssi,
                firstSeen = now, lastSeen = now, timesSeen = 1
            )
        }
        dao.upsert(entity)
        sightingDao.insert(SightingEntity(address = address, timestamp = now, rssi = rssi))
        return entity
    }

    suspend fun getSightingsSince(address: String, since: Long): List<SightingEntity> =
        sightingDao.getSince(address, since)

    suspend fun setWhitelisted(address: String, whitelisted: Boolean, label: String?) =
        dao.setWhitelisted(address, whitelisted, label)

    suspend fun purgeOlderThanDays(days: Int) {
        val cutoff = System.currentTimeMillis() - days * 24L * 60 * 60 * 1000
        dao.purgeOld(cutoff)
    }
}
