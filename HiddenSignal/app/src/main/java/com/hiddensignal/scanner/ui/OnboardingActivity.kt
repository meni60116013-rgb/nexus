package com.hiddensignal.scanner.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.hiddensignal.scanner.databinding.ActivityOnboardingBinding

/**
 * Primera pantalla que ve el usuario. Si ya la vio antes, pasa directo
 * a MainActivity sin volver a mostrar la explicación. Sirve para que
 * los permisos (ubicación, Bluetooth, notificaciones) no le salgan
 * "en seco" al usuario sin contexto — eso baja mucho la tasa de aceptación.
 */
class OnboardingActivity : AppCompatActivity() {

    private val prefs by lazy { getSharedPreferences("onboarding", Context.MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        if (prefs.getBoolean(KEY_SEEN, false)) {
            goToMain()
            return
        }

        val binding = ActivityOnboardingBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.buttonContinue.setOnClickListener {
            prefs.edit().putBoolean(KEY_SEEN, true).apply()
            goToMain()
        }
    }

    private fun goToMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    companion object {
        private const val KEY_SEEN = "seen"
    }
}
