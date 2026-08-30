package com.hiddensignal.scanner.ui

import android.app.AlertDialog
import android.os.Bundle
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.hiddensignal.scanner.data.DeviceEntity
import com.hiddensignal.scanner.data.DeviceRepository
import com.hiddensignal.scanner.data.HistoryExporter
import com.hiddensignal.scanner.databinding.ActivityHistoryBinding
import kotlinx.coroutines.launch

/**
 * Historial completo de todo lo detectado. Tocar un dispositivo
 * desconocido permite ponerle un apodo y moverlo a la lista blanca.
 * El botón superior exporta todo a CSV y abre el selector de compartir.
 */
class HistoryActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHistoryBinding
    private lateinit var repository: DeviceRepository
    private lateinit var adapter: DeviceAdapter
    private var currentList: List<DeviceEntity> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHistoryBinding.inflate(layoutInflater)
        setContentView(binding.root)
        title = "Historial"

        repository = DeviceRepository(applicationContext)
        adapter = DeviceAdapter { device -> showLabelDialog(device.address) }
        binding.recyclerHistory.layoutManager = LinearLayoutManager(this)
        binding.recyclerHistory.adapter = adapter

        binding.buttonExport.setOnClickListener {
            HistoryExporter.exportAndShare(this, currentList)
        }

        lifecycleScope.launch {
            repository.observeAll().collect { list ->
                currentList = list
                adapter.submit(list)
            }
        }
    }

    private fun showLabelDialog(address: String) {
        val input = EditText(this).apply { hint = "Ej. Mi celular, Router de casa…" }
        AlertDialog.Builder(this)
            .setTitle("Marcar como conocido")
            .setView(input)
            .setPositiveButton("Guardar") { _, _ ->
                lifecycleScope.launch {
                    repository.setWhitelisted(address, true, input.text.toString().ifBlank { null })
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}
