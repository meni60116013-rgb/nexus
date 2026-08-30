package com.hiddensignal.scanner.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.hiddensignal.scanner.data.DeviceRepository
import com.hiddensignal.scanner.databinding.ActivityMainBinding
import com.hiddensignal.scanner.scan.ScanForegroundService
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var repository: DeviceRepository

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        if (results.values.all { it }) startScanService()
        else binding.textStatus.text = "Faltan permisos para escanear. Actívalos desde Ajustes."
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        repository = DeviceRepository(applicationContext)

        binding.buttonWhitelist.setOnClickListener {
            startActivity(Intent(this, WhitelistActivity::class.java))
        }
        binding.buttonHistory.setOnClickListener {
            startActivity(Intent(this, HistoryActivity::class.java))
        }

        lifecycleScope.launch {
            repository.observeAll().collect { list ->
                binding.radarView.submitDevices(list)
                val nuevos = list.count { !it.isWhitelisted }
                binding.textStatus.text = "${list.size} dispositivos detectados · $nuevos sin identificar"
            }
        }

        ensurePermissionsAndStart()
    }

    private fun ensurePermissionsAndStart() {
        val required = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            required.add(Manifest.permission.BLUETOOTH_SCAN)
            required.add(Manifest.permission.BLUETOOTH_CONNECT)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            required.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missing = required.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isEmpty()) startScanService()
        else permissionLauncher.launch(missing.toTypedArray())
    }

    private fun startScanService() {
        val intent = Intent(this, ScanForegroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(intent)
        else startService(intent)
        binding.textStatus.text = "Escaneando…"
    }
}
