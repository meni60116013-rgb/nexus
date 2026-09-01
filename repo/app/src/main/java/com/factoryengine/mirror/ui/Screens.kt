package com.vcore.vectorforge.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vcore.vectorforge.BuildPhase
import com.vcore.vectorforge.MainViewModel

@Composable
fun DashboardScreen(vm: MainViewModel) {
    val state by vm.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            "VECTOR-FORGE",
            style = MaterialTheme.typography.headlineLarge
        )

        Text(
            "Vehicle Engineering Platform",
            style = MaterialTheme.typography.titleMedium
        )

        Text(
            "Thin client Android · procesamiento y compilación en la nube",
            style = MaterialTheme.typography.bodyMedium
        )

        HorizontalDivider()

        Text(
            "NÚCLEO DE INGENIERÍA",
            style = MaterialTheme.typography.labelLarge
        )

        EngineCard("Vehicle Core", "Definición universal del vehículo")
        EngineCard("Frame / Chassis", "Geometría y estructura")
        EngineCard("Suspension / Dynamics", "Dinámica, cargas y movimiento")
        EngineCard("Powertrain", "Potencia, torque y rendimiento")
        EngineCard("Engineering", "Validación de ingeniería")

        HorizontalDivider()

        Text(
            "ESTADO DE PLATAFORMA",
            style = MaterialTheme.typography.labelLarge
        )

        StatusCard(
            "GitHub Actions",
            "Autoridad de compilación",
            true
        )

        StatusCard(
            "Release Pipeline",
            "Android Release",
            state.phase == BuildPhase.SUCCESS
        )
    }
}

@Composable
fun CreatorScreen(
    vm: MainViewModel,
    onGenerate: () -> Unit
) {
    val state by vm.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            "VEHICLE CREATOR",
            style = MaterialTheme.typography.headlineMedium
        )

        Text(
            "Construye una definición de vehículo utilizando el núcleo Vector-Forge.",
            style = MaterialTheme.typography.bodyMedium
        )

        OutlinedTextField(
            value = state.idea,
            onValueChange = vm::updateIdea,
            modifier = Modifier.fillMaxWidth(),
            minLines = 5,
            label = { Text("Especificación del vehículo") },
            placeholder = {
                Text("Ejemplo: motocicleta urbana eléctrica...")
            }
        )

        EngineCard("1 · Vehicle Definition", "Arquitectura base")
        EngineCard("2 · Frame Definition", "Chasis y geometría")
        EngineCard("3 · Dynamics Definition", "Suspensión y dinámica")
        EngineCard("4 · Powertrain Definition", "Propulsión y rendimiento")
        EngineCard("5 · Engineering Validation", "Validación")
        EngineCard("6 · Creator Output", "Salida del vehículo")

        Button(
            onClick = onGenerate,
            enabled = state.idea.isNotBlank() &&
                    state.phase == BuildPhase.IDLE,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.PlayArrow, null)
            Spacer(Modifier.width(8.dp))
            Text("GENERAR VEHÍCULO")
        }
    }
}

@Composable
fun BuildScreen(vm: MainViewModel) {
    val state by vm.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        Text(
            "BUILD CENTER",
            style = MaterialTheme.typography.headlineMedium
        )

        Text(
            "Pipeline de compilación VECTOR-FORGE",
            style = MaterialTheme.typography.bodyMedium
        )

        when (state.phase) {
            BuildPhase.SUCCESS -> {
                ResultCard(
                    title = "BUILD COMPLETADO",
                    message = state.message,
                    success = true
                )
            }

            BuildPhase.FAILED -> {
                ResultCard(
                    title = "BUILD FALLIDO",
                    message = state.message,
                    success = false
                )
            }

            BuildPhase.IDLE -> {
                ResultCard(
                    title = "ESPERANDO BUILD",
                    message = "Genera un vehículo desde Creator.",
                    success = false
                )
            }

            else -> {
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(28.dp)
                        )

                        Spacer(Modifier.width(16.dp))

                        Text(
                            state.message,
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
            }
        }

        if (state.repoName.isNotBlank()) {
            InfoCard("Repositorio", state.repoName)
        }

        state.issueBody?.let {
            InfoCard("Diagnóstico", it)
        }

        state.apkPath?.let {
            Button(
                onClick = { vm.installApk() },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Android, null)
                Spacer(Modifier.width(8.dp))
                Text("INSTALAR APK")
            }
        }
    }
}

@Composable
fun SettingsScreen(vm: MainViewModel) {
    var token by remember { mutableStateOf("") }
    var saved by remember { mutableStateOf(vm.hasToken()) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            "VECTOR-FORGE CONFIG",
            style = MaterialTheme.typography.headlineMedium
        )

        Text(
            if (saved)
                "Credencial GitHub almacenada de forma segura."
            else
                "Configura la credencial necesaria para las operaciones GitHub.",
            style = MaterialTheme.typography.bodyMedium
        )

        OutlinedTextField(
            value = token,
            onValueChange = { token = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("GitHub Token") }
        )

        Button(
            onClick = {
                vm.saveToken(token)
                saved = true
                token = ""
            },
            enabled = token.isNotBlank(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("GUARDAR CREDENCIAL")
        }

        HorizontalDivider()

        EngineCard("Release Authority", "GitHub Actions")
        EngineCard("Android Target", "SDK 34 · API 34")
        EngineCard("Architecture", "Thin Client")
        EngineCard("Local Gradle", "Disabled by policy")
    }
}

@Composable
private fun EngineCard(title: String, description: String) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(description, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun StatusCard(
    title: String,
    description: String,
    ok: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                if (ok) Icons.Default.CheckCircle else Icons.Default.Error,
                null
            )

            Spacer(Modifier.width(12.dp))

            Column {
                Text(title, style = MaterialTheme.typography.titleMedium)
                Text(description, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable
private fun ResultCard(
    title: String,
    message: String,
    success: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                if (success) Icons.Default.CheckCircle else Icons.Default.Build,
                null
            )

            Text(
                title,
                style = MaterialTheme.typography.titleLarge
            )

            Text(
                message,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun InfoCard(title: String, value: String) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(title, style = MaterialTheme.typography.labelLarge)
            Text(value, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
