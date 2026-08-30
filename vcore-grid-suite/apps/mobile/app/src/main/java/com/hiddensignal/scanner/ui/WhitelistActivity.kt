package com.hiddensignal.scanner.ui

import android.app.AlertDialog
import android.os.Bundle
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.hiddensignal.scanner.data.DeviceRepository
import com.hiddensignal.scanner.databinding.ActivityWhitelistBinding
import kotlinx.coroutines.launch

/**
 * Lista blanca: dispositivos que el usuario ya identificó como propios
 * o conocidos (su celular, sus audífonos, el router de casa, etc.).
 * Se pintan en verde en el radar y no disparan alertas.
 */
class WhitelistActivity : AppCompatActivity() {

    private lateinit var binding: ActivityWhitelistBinding
    private lateinit var repository: DeviceRepository
    private lateinit var adapter: DeviceAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWhitelistBinding.inflate(layoutInflater)
        setContentView(binding.root)
        title = "Lista blanca"

        repository = DeviceRepository(applicationContext)
        adapter = DeviceAdapter { device ->
            AlertDialog.Builder(this)
                .setTitle(device.name ?: device.address)
                .setMessage("¿Quitar de la lista blanca?")
                .setPositiveButton("Quitar") { _, _ ->
                    lifecycleScope.launch {
                        repository.setWhitelisted(device.address, false, null)
                    }
                }
                .setNegativeButton("Cancelar", null)
                .show()
        }
        binding.recyclerWhitelist.layoutManager = LinearLayoutManager(this)
        binding.recyclerWhitelist.adapter = adapter

        lifecycleScope.launch {
            repository.observeWhitelist().collect { adapter.submit(it) }
        }
    }
}
